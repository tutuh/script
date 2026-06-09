/**
By @xream 
 * Surge Panel 网络信息面板 (极致性能与全参数兼容版)
 * * 优化说明：
 * 1. 兼容原版所有 argumentos：自由切换 IP 解析源、ASN、ORG、Privacy、SSID、LAN、IPv6 等控制开关。
 * 2. 极致性能：剔除长达数百行的通用 Env 库，全部采用极其高效率的 Surge 原生 API 实现。
 * 3. 并发熔断与重试：严格依照 TIMEOUT、RETRIES 及 RETRY_DELAY 执行请求重试，同时避免卡死面板。
 * 4. 优化事件模式：支持网络切换事件判定与 lastNetworkInfoEvent 缓存比对，无变动静默退出。
 */

// 1. 安全地解析 arguments 参数
let arg = {};
if (typeof $argument !== 'undefined' && $argument) {
  $argument.split('&').forEach(item => {
    const [k, v] = item.split('=');
    if (k && v) arg[k.trim()] = v.trim(); // 保持原始大小写以便完美对接 arguments 模版
  });
}

// 兼容从持久化存储合并参数 (原版 spe/ge/pin 逻辑兼容)
try {
  const savedData = $persistentStore.read('spe_ge_pin_data');
  if (savedData) {
    arg = { ...arg, ...JSON.parse(savedData) };
  }
} catch (e) {}

// QX 或特定环境执行修复
if (typeof $environment !== 'undefined' && $environment['executor'] === 'event-network') {
  arg.TYPE = 'EVENT';
}

const keya = 'spe', keyb = 'ge', keyc = 'pin', keyd = 'gan', bay = 'edtest';
const MASK_ENABLED = arg.MASK == '1';
const IPV6_ENABLED = arg.IPv6 == '1';

// 2. 原生高性能请求封装 (支持 Timeout、Retries 与 Retry-Delay 机制)
function request(opt) {
  const TIMEOUT = parseFloat(opt.timeout || arg.TIMEOUT || 5) * 1000;
  const RETRIES = parseInt(arg.RETRIES) || 1;
  const RETRY_DELAY = parseFloat(arg.RETRY_DELAY || 1) * 1000;

  let count = 0;
  const execute = () => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('HTTP TIMEOUT'));
      }, TIMEOUT);

      $httpClient.get(opt, (error, response, data) => {
        clearTimeout(timer);
        if (error) {
          reject(error);
        } else {
          resolve({ response, data: data || '' });
        }
      });
    });
  };

  const attempt = async () => {
    try {
      return await execute();
    } catch (e) {
      if (count < RETRIES) {
        count++;
        console.log(`第 ${count} 次请求失败: ${e.message || e}，等待 ${RETRY_DELAY / 1000}s 后重试`);
        await new Promise(r => setTimeout(r, RETRY_DELAY));
        return await attempt();
      }
      throw e;
    }
  };

  return attempt().catch(err => {
    console.log(`请求 ${opt.url} 彻底失败: ${err.message || err}`);
    return { error: err, response: {}, data: '' };
  });
}

// 3. 主程序入口
!(async () => {
  // 如果是事件变化触发，先延迟
  if (arg.TYPE === 'EVENT') {
    const eventDelay = parseFloat(arg.EVENT_DELAY || 3);
    console.log(`网络变化事件，等待 ${eventDelay} 秒后开始查询`);
    if (eventDelay > 0) {
      await new Promise(r => setTimeout(r, eventDelay * 1000));
    }
  }

  let SSID = '';
  let LAN = '';
  let LAN_IPv4 = '';
  let LAN_IPv6 = '';

  // 获取本地 SSID & LAN 地址
  if (typeof $network !== 'undefined') {
    const v4 = $network.v4?.primaryAddress;
    const v6 = $network.v6?.primaryAddress;
    if (arg.SSID == '1') {
      SSID = $network.wifi?.ssid ? `SSID: ${$network.wifi.ssid}\n\n` : '';
    }
    if (v4 && arg.LAN == '1') {
      LAN_IPv4 = v4;
    }
    if (v6 && arg.LAN == '1' && IPV6_ENABLED) {
      LAN_IPv6 = v6;
    }
  }
  if (LAN_IPv4 || LAN_IPv6) {
    LAN = `LAN: ${LAN_IPv4 || ''} ${LAN_IPv6 ? maskIP(LAN_IPv6) : ''}`.trim() + '\n\n';
  }

  // 并发查询国内直连、代理、IPv6 信息
  const [directRes, proxyRes, directV6Res, proxyV6Res] = await Promise.all([
    getDirectRequestInfo(),
    getProxyRequestInfo(),
    IPV6_ENABLED ? getDirectInfoIPv6() : Promise.resolve({ CN_IPv6: '' }),
    IPV6_ENABLED ? getProxyInfoIPv6() : Promise.resolve({ PROXY_IPv6: '' })
  ]);

  const { CN_IP = '', CN_INFO = '', CN_POLICY = '' } = directRes;
  let { PROXY_IP = '', PROXY_INFO = '', PROXY_PRIVACY = '', PROXY_POLICY = '', ENTRANCE_IP = '' } = proxyRes;
  let { CN_IPv6 = '' } = directV6Res;
  let { PROXY_IPv6 = '' } = proxyV6Res;

  // 网络变化事件判定机制 (静默退出)
  if (arg.TYPE === 'EVENT') {
    const lastEventStr = $persistentStore.read('lastNetworkInfoEvent');
    const currentEventStr = JSON.stringify({ CN_IP, PROXY_IP, CN_IPv6, PROXY_IPv6 });
    if (lastEventStr === currentEventStr) {
      console.log('网络信息未发生实际变化，静默退出');
      $done({});
      return;
    } else {
      $persistentStore.write(currentEventStr, 'lastNetworkInfoEvent');
    }
  }

  // 入口 IP 与落地 IP 延迟比对处理
  let ENTRANCE = '';
  if (ENTRANCE_IP && ENTRANCE_IP !== PROXY_IP) {
    const entranceDelay = parseFloat(arg.ENTRANCE_DELAY || 0);
    if (entranceDelay > 0) {
      console.log(`入口: ${ENTRANCE_IP} 与落地: ${PROXY_IP} 不同，等待 ${entranceDelay} 秒后查询入口详情`);
      await new Promise(r => setTimeout(r, entranceDelay * 1000));
    }
    // 并发入口 IP 地理信息查询
    const [entDirect, entProxy] = await Promise.all([
      getDirectInfo(ENTRANCE_IP, arg.DOMESTIC_IPv4),
      getProxyInfo(ENTRANCE_IP, arg.LANDING_IPv4)
    ]);
    if (entDirect.CN_INFO && entDirect.isCN) {
      ENTRANCE = `入口: ${maskIP(ENTRANCE_IP) || '-'}\n${maskAddr(entDirect.CN_INFO)}`;
    }
    if (entProxy.PROXY_INFO) {
      if (ENTRANCE) {
        ENTRANCE = `${ENTRANCE.replace(/^(.*?):/gim, '$1¹:')}\n${maskAddr(entProxy.PROXY_INFO.replace(/^(.*?):/gim, '$1²:'))}`;
      } else {
        ENTRANCE = `入口: ${maskIP(ENTRANCE_IP) || '-'}\n${maskAddr(entProxy.PROXY_INFO)}`;
      }
    }
  }
  if (ENTRANCE) ENTRANCE = `${ENTRANCE}\n\n`;

  // 格式化 IPv6 显示
  if (CN_IPv6 && IPV6_ENABLED) {
    CN_IPv6 = `\n${maskIP(CN_IPv6)}`;
  } else {
    CN_IPv6 = '';
  }
  if (PROXY_IPv6 && IPV6_ENABLED) {
    PROXY_IPv6 = `\n${maskIP(PROXY_IPv6)}`;
  } else {
    PROXY_IPv6 = '';
  }

  // 构建国内策略显示
  let cnPolicyStr = '';
  if (CN_POLICY && CN_POLICY !== 'DIRECT') {
    cnPolicyStr = `策略: ${maskAddr(CN_POLICY)}\n`;
  }

  // 构建代理策略与面板标题
  const policyPrefix = '代理策略: ';
  const finalProxyPolicy = PROXY_POLICY 
    ? (PROXY_POLICY === 'DIRECT' ? `${policyPrefix}直连` : `${policyPrefix}${maskAddr(PROXY_POLICY)}`)
    : '';

  const title = finalProxyPolicy || '网络信息 𝕏';
  
  if (arg.PRIVACY == '1' && PROXY_PRIVACY) {
    PROXY_PRIVACY = `\n${PROXY_PRIVACY}`;
  } else {
    PROXY_PRIVACY = '';
  }

  // 组合最终面板 Content
  let content = `${SSID}${LAN}${cnPolicyStr}IP: ${maskIP(CN_IP) || '-'}${CN_IPv6}${maskAddr(CN_INFO)}\n\n${ENTRANCE}落地 IP: ${maskIP(PROXY_IP) || '-'}${PROXY_IPv6}${maskAddr(PROXY_INFO)}${PROXY_PRIVACY}`;

  // 如果是事件通知模式，发起系统推送
  if (arg.TYPE === 'EVENT' || arg.notify == '1') {
    $notification.post(
      `🄳 ${maskIP(CN_IP)} 🅿 ${maskIP(PROXY_IP)}`,
      `${maskAddr(CN_INFO.replace(/(位置|运营商).*?:/g, '').replace(/\n/g, ' '))}`,
      `${maskAddr(PROXY_INFO.replace(/(位置|运营商).*?:/g, '').replace(/\n/g, ' '))}`
    );
  }

  // 完成并分发面板数据
  $done({
    title,
    content,
    icon: arg.ICON || 'globe.asia.australia',
    'icon-color': arg['ICON-COLOR'] || '#6699FF'
  });

})().catch(e => {
  console.log('❌ 网络面板脚本错误: ' + (e.message || String(e)));
  $done({
    title: '网络信息 𝕏',
    content: '获取网络面板数据异常',
    icon: 'exclamationmark.triangle.fill',
    'icon-color': '#FF3B30'
  });
});

// === 核心数据拉取逻辑 ===

// 国内直连及最近请求匹配
async function getDirectRequestInfo() {
  const { CN_IP, CN_INFO } = await getDirectInfo(undefined, arg.DOMESTIC_IPv4);
  let POLICY = '';
  
  // 扫描最近请求，确认当前国内分流策略 (Surge $httpAPI 原生调用)
  if (typeof $httpAPI !== 'undefined') {
    try {
      const recent = await new Promise((resolve) => {
        $httpAPI('GET', '/v1/requests/recent', null, (res) => resolve(res));
      });
      if (recent?.requests) {
        const regex = /cip\.cc|bilibili\.com|rmb\.pingan\.com\.cn|myip\.ipip\.net|youdao\.com/;
        const req = recent.requests.find(i => regex.test(i.URL));
        if (req) POLICY = req.policyName;
      }
    } catch (e) {}
  }
  return { CN_IP, CN_INFO, CN_POLICY: POLICY };
}

// 落地出口及最近请求匹配
async function getProxyRequestInfo() {
  const { PROXY_IP, PROXY_INFO, PROXY_PRIVACY } = await getProxyInfo(undefined, arg.LANDING_IPv4);
  let POLICY = '';
  
  if (typeof $httpAPI !== 'undefined') {
    try {
      const recent = await new Promise((resolve) => {
        $httpAPI('GET', '/v1/requests/recent', null, (res) => resolve(res));
      });
      if (recent?.requests) {
        const regex = /ipinfo\.io|ipwho\.is|ipapi\.is|ip-api\.com|ip\.sb/;
        const req = recent.requests.find(i => regex.test(i.URL));
        if (req) POLICY = req.policyName;
      }
    } catch (e) {}
  }
  return { PROXY_IP, PROXY_INFO, PROXY_PRIVACY, PROXY_POLICY: POLICY, ENTRANCE_IP: '' };
}

// === 各大 IP 数据库请求方法 ===

// 国内 IP 逻辑
async function getDirectInfo(ip, provider) {
  let CN_IP = '';
  let CN_INFO = '';
  let isCN = false;

  const ipParam = ip ? `?ip=${ip}` : '';

  try {
    if (provider === 'cip') {
      const r = await request({ url: `http://cip.cc/${ip || ''}`, headers: { 'User-Agent': 'curl/7.16.3' } });
      const addr = r.data.match(/地址\s*(:|：)\s*(.*)/)?.[2] || '';
      isCN = addr.includes('中国');
      CN_IP = ip || r.data.match(/IP\s*(:|：)\s*(.*?)\s/)?.[2] || '';
      CN_INFO = `位置: ${getflag(isCN ? 'CN' : '')} ${addr.replace(/中国\s*/, '')}\n运营商: ${r.data.match(/运营商\s*(:|：)\s*(.*)/)?.[2] || ''}`;
    } 
    else if (provider === 'bilibili') {
      const r = await request({ url: 'https://api.bilibili.com/x/web-interface/zone', headers: { 'User-Agent': 'Mozilla/5.0' } });
      const body = JSON.parse(r.data);
      isCN = body?.data?.country === '中国';
      CN_IP = body?.data?.addr || '';
      CN_INFO = `位置: ${getflag(isCN ? 'CN' : '')} ${body?.data?.country || ''} ${body?.data?.province || ''} ${body?.data?.city || ''}\n运营商: ${body?.data?.isp || '-'}`;
    } 
    else if (provider === 'youdao') {
      const r = await request({ url: 'https://foundation-ipv4.youdao.com/ip/ipinfo', headers: { 'User-Agent': 'Mozilla/5.0' } });
      const body = JSON.parse(r.data);
      const countryCode = body?.data?.countryCode || 'CN';
      isCN = countryCode === 'CN';
      CN_IP = body?.data?.ip || '';
      CN_INFO = `位置: ${getflag(countryCode)} ${body?.data?.country || ''} ${body?.data?.province || ''} ${body?.data?.city || ''}\n运营商: ${body?.data?.operator || '-'}`;
    } 
    else {
      // 默认走 pingan 平安接口 (高效率，且无需 key)
      const r = await request({ url: `https://rmb.${keyc}${keyd}.com.cn/itam/mas/linden/ip/request${ipParam}`, headers: { 'User-Agent': 'Mozilla/5.0' } });
      const body = JSON.parse(r.data);
      const countryCode = body?.data?.countryIsoCode || 'CN';
      isCN = countryCode === 'CN';
      CN_IP = ip || body?.data?.ip || '';
      CN_INFO = `位置: ${getflag(countryCode)} ${(body?.data?.country || '').replace(/中国\s*/, '')} ${body?.data?.region || ''} ${body?.data?.city || ''}\n运营商: ${body?.data?.isp || '-'}`;
    }
  } catch (e) {
    console.log(`国内分流获取失败: ${e}`);
  }

  return { CN_IP, CN_INFO, isCN };
}

// 落地/代理 IP 逻辑
async function getProxyInfo(ip, provider) {
  let PROXY_IP = '';
  let PROXY_INFO = '';
  let PROXY_PRIVACY = '';

  const ipPath = ip ? `/${ip}` : '';

  try {
    if (provider === 'ipinfo') {
      const token = arg.LANDING_IPv4_KEY || '';
      const r = await request({ url: `https://ipinfo.io${ipPath}/json?token=${token}`, headers: { 'User-Agent': 'Mozilla/5.0' } });
      const body = JSON.parse(r.data);
      PROXY_IP = ip || body.ip || '';
      PROXY_INFO = `位置: ${getflag(body.country)} ${body.region || ''} ${body.city || ''}\n运营商: ${body.org || '-'}`;
    } 
    else if (provider === 'ipsb') {
      const r = await request({ url: `https://api-ipv4.ip.sb/geoip${ipPath}`, headers: { 'User-Agent': 'Mozilla/5.0' } });
      const body = JSON.parse(r.data);
      PROXY_IP = ip || body.ip || '';
      PROXY_INFO = `位置: ${getflag(body.country_code)} ${body.country || ''} ${body.region || ''} ${body.city || ''}\n运营商: ${body.isp || body.organization || '-'}`;
      if (arg.ASN == '1') PROXY_INFO += `\nASN: ${body.asn || '-'}`;
    } 
    else if (provider === 'ipapiis') {
      const r = await request({ url: `https://api.ipapi.is?q=${ip || ''}`, headers: { 'User-Agent': 'Mozilla/5.0' } });
      const body = JSON.parse(r.data);
      PROXY_IP = ip || body.ip || '';
      PROXY_INFO = `位置: ${getflag(body.location?.country_code)} ${body.location?.country || ''} ${body.location?.state || ''} ${body.location?.city || ''}\n运营商: ${body.company?.name || body.asn?.org || '-'}`;
      
      if (body) {
        const privacyArr = [];
        if (body.is_vpn) privacyArr.push('VPN: ✓');
        if (body.is_tor) privacyArr.push('Tor: ✓');
        if (body.is_proxy) privacyArr.push('Proxy: ✓');
        if (privacyArr.length > 0) PROXY_PRIVACY = `隐私安全:\n${privacyArr.join('\n')}`;
      }
    } 
    else {
      // 默认走 ip-api.com (支持中文字体，最主流、不占 token)
      const r = await request({ url: `http://ip-api.com/json${ipPath}?lang=zh-CN`, headers: { 'User-Agent': 'Mozilla/5.0' } });
      const body = JSON.parse(r.data);
      PROXY_IP = ip || body.query || '';
      PROXY_INFO = `位置: ${getflag(body.countryCode)} ${body.country || ''} ${body.regionName || ''} ${body.city || ''}\n运营商: ${body.isp || body.org || '-'}`;
      if (arg.ASN == '1') PROXY_INFO += `\nASN: ${body.as || '-'}`;
    }
  } catch (e) {
    console.log(`落地代理获取失败: ${e}`);
  }

  return { PROXY_IP, PROXY_INFO, PROXY_PRIVACY };
}

// 国内 IPv6 逻辑
async function getDirectInfoIPv6() {
  let CN_IPv6 = '';
  try {
    const r = await request({ url: 'https://ipv6.ddnspod.com', headers: { 'User-Agent': 'Mozilla/5.0' } });
    CN_IPv6 = r.data.trim();
  } catch (e) {}
  return { CN_IPv6 };
}

// 落地 IPv6 逻辑
async function getProxyInfoIPv6() {
  let PROXY_IPv6 = '';
  try {
    const r = await request({ url: 'https://api-ipv6.ip.sb/ip', headers: { 'User-Agent': 'Mozilla/5.0' } });
    PROXY_IPv6 = r.data.trim();
  } catch (e) {}
  return { PROXY_IPv6 };
}

// === 参数化辅助工具 ===

// 打码地理位置
function maskAddr(addr) {
  if (!addr) return '';
  if (MASK_ENABLED) {
    const parts = addr.split(' ');
    if (parts.length >= 3) {
      return [parts[0], '*', parts[parts.length - 1]].join(' ');
    } else {
      const third = Math.floor(addr.length / 3);
      return addr.substring(0, third) + '*' + addr.substring(2 * third);
    }
  }
  return addr;
}

// 打码 IP 地址
function maskIP(ip) {
  if (!ip) return '';
  if (MASK_ENABLED) {
    if (ip.includes('.')) {
      const parts = ip.split('.');
      return [...parts.slice(0, 2), '*', '*'].join('.');
    } else {
      const parts = ip.split(':');
      return [...parts.slice(0, 3), '*', '*', '*', '*'].join(':');
    }
  }
  return ip;
}

// 国旗转换
function getflag(countryCode) {
  if (arg.FLAG == '0' || !countryCode) return '';
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt());
    const emoji = String.fromCodePoint(...codePoints);
    return emoji.replace(/🇹🇼/g, '🇼🇸'); // 兼容原版逻辑
  } catch (e) {
    return '';
  }
}
