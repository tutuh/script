constNAME = 'network-info'
const $ = Env(NAME)

let arg
if (typeof $argument != 'undefined') {
  arg = Object.fromEntries($argument.split('&').map(item => item.split('=')))
} else {
  arg = {}
}
$.log(`传入的 $argument: ${$.toStr(arg)}`)

arg = { ...arg, ...$.getjson(NAME, {}) }

$.log(`从持久化存储读取参数后: ${$.toStr(arg)}`)

if (!isRequest() && !isPanel()) {
  $.log(`参数为空 非请求, 非面板的情况下, 修正运行环境`)
  $.lodash_set(arg, 'TYPE', 'EVENT')
}

if (isRequest()) {
  arg = { ...arg, ...parseQueryString($request.url) }
  $.log(`从请求后读取参数后: ${$.toStr(arg)}`)
}

const keya = 'spe'
const keyb = 'ge'
const keyc = 'pin'
const keyd = 'gan'
const bay = 'edtest'

let result = {}
let proxy_policy = ''
let title = ''
let content = ''
!(async () => {
  if ($.lodash_get(arg, 'TYPE') === 'EVENT') {
    const eventDelay = parseFloat($.lodash_get(arg, 'EVENT_DELAY') || 3)
    $.log(`网络变化, 等待 ${eventDelay} 秒后开始查询`)
    if (eventDelay) {
      await $.wait(1000 * eventDelay)
    }
  }

  let SSID = ''
  let LAN = ''
  let LAN_IPv4 = ''
  let LAN_IPv6 = ''
  if (typeof $network !== 'undefined') {
    $.log($.toStr($network))
    const v4 = $.lodash_get($network, 'v4.primaryAddress')
    const v6 = $.lodash_get($network, 'v6.primaryAddress')
    if ($.lodash_get(arg, 'SSID') == 1) {
      SSID = $.lodash_get($network, 'wifi.ssid')
    }
    if (v4 && $.lodash_get(arg, 'LAN') == 1) {
      LAN_IPv4 = v4
    }
    if (v6 && $.lodash_get(arg, 'LAN') == 1 && $.lodash_get(arg, 'IPv6') == 1) {
      LAN_IPv6 = v6
    }
  }

  if (LAN_IPv4 || LAN_IPv6) {
    LAN = ['LAN:', LAN_IPv4, maskIP(LAN_IPv6)].filter(i => i).join(' ')
  }
  if (LAN) {
    LAN = `${LAN}\n\n`
  }
  if (SSID) {
    SSID = `SSID: ${SSID}\n\n`
  } else {
    SSID = ''
  }
  
  let { PROXIES = [] } = await getProxies()
  let [
    { CN_IP = '', CN_INFO = '', CN_POLICY = '' } = {},
    { PROXY_IP = '', PROXY_INFO = '', PROXY_PRIVACY = '', PROXY_POLICY = '', ENTRANCE_IP = '' } = {},
    { CN_IPv6 = '' } = {},
    { PROXY_IPv6 = '' } = {},
  ] = await Promise.all(
    $.lodash_get(arg, 'IPv6') == 1
      ? [getDirectRequestInfo({ PROXIES }), getProxyRequestInfo({ PROXIES }), getDirectInfoIPv6(), getProxyInfoIPv6()]
      : [getDirectRequestInfo({ PROXIES }), getProxyRequestInfo({ PROXIES })]
  )
  
  let continueFlag = true
  if ($.lodash_get(arg, 'TYPE') === 'EVENT') {
    const lastNetworkInfoEvent = $.getjson('lastNetworkInfoEvent')
    if (
      CN_IP !== $.lodash_get(lastNetworkInfoEvent, 'CN_IP') ||
      CN_IPv6 !== $.lodash_get(lastNetworkInfoEvent, 'CN_IPv6') ||
      PROXY_IP !== $.lodash_get(lastNetworkInfoEvent, 'PROXY_IP') ||
      PROXY_IPv6 !== $.lodash_get(lastNetworkInfoEvent, 'PROXY_IPv6')
    ) {
      $.setjson({ CN_IP, PROXY_IP, CN_IPv6, PROXY_IPv6 }, 'lastNetworkInfoEvent')
    } else {
      $.log('网络信息未发生变化, 不继续')
      continueFlag = false
    }
  }
  
  if (continueFlag) {
    if ($.lodash_get(arg, 'PRIVACY') == '1' && PROXY_PRIVACY) {
      PROXY_PRIVACY = `\n${PROXY_PRIVACY}`
    }
    let ENTRANCE = ''
    if (ENTRANCE_IP) {
      const { IP: resolvedIP } = await resolveDomain(ENTRANCE_IP)
      if (resolvedIP) {
        $.log(`入口域名解析: ${ENTRANCE_IP} ➟ ${resolvedIP}`)
        ENTRANCE_IP = resolvedIP
      }
    }
    if (ENTRANCE_IP && ENTRANCE_IP !== PROXY_IP) {
      const entranceDelay = parseFloat($.lodash_get(arg, 'ENTRANCE_DELAY') || 0)
      $.log(`入口: ${ENTRANCE_IP} 与落地 IP: ${PROXY_IP} 不一致, 等待 ${entranceDelay} 秒后查询入口`)
      if (entranceDelay) {
        await $.wait(1000 * entranceDelay)
      }
      let [{ CN_INFO: ENTRANCE_INFO1 = '', isCN = false } = {}, { PROXY_INFO: ENTRANCE_INFO2 = '' } = {}] =
        await Promise.all([
          getDirectInfo(ENTRANCE_IP, $.lodash_get(arg, 'DOMESTIC_IPv4')),
          getProxyInfo(ENTRANCE_IP, $.lodash_get(arg, 'LANDING_IPv4')),
        ])
      if (ENTRANCE_INFO1 && isCN) {
        ENTRANCE = `入口: ${maskIP(ENTRANCE_IP) || '-'}\n${maskAddr(ENTRANCE_INFO1)}`
      }
      if (ENTRANCE_INFO2) {
        if (ENTRANCE) {
          ENTRANCE = `${ENTRANCE.replace(/^(.*?):/gim, '$1¹:')}\n${maskAddr(
            ENTRANCE_INFO2.replace(/^(.*?):/gim, '$1²:')
          )}`
        } else {
          ENTRANCE = `入口: ${maskIP(ENTRANCE_IP) || '-'}\n${maskAddr(ENTRANCE_INFO2)}`
        }
      }
    }
    if (ENTRANCE) {
      ENTRANCE = `${ENTRANCE}\n\n`
    }

    if (CN_IPv6 && isIPv6(CN_IPv6) && $.lodash_get(arg, 'IPv6') == 1) {
      CN_IPv6 = `\n${maskIP(CN_IPv6)}`
    } else {
      CN_IPv6 = ''
    }
    if (PROXY_IPv6 && isIPv6(PROXY_IPv6) && $.lodash_get(arg, 'IPv6') == 1) {
      PROXY_IPv6 = `\n${maskIP(PROXY_IPv6)}`
    } else {
      PROXY_IPv6 = ''
    }
    
    if (CN_POLICY === 'DIRECT') {
      CN_POLICY = ``
    } else {
      CN_POLICY = `策略: ${maskAddr(CN_POLICY) || '-'}\n`
    }

    if (CN_INFO) {
      CN_INFO = `\n${CN_INFO}`
    }
    const policy_prefix = '代理策略: '
    if (PROXY_POLICY === 'DIRECT') {
      PROXY_POLICY = `${policy_prefix}直连`
    } else if (PROXY_POLICY) {
      PROXY_POLICY = `${policy_prefix}${maskAddr(PROXY_POLICY) || '-'}`
    } else {
      PROXY_POLICY = ''
    }
    if (PROXY_POLICY) {
      proxy_policy = PROXY_POLICY
    } else {
      proxy_policy = ''
    }

    if (PROXY_INFO) {
      PROXY_INFO = `\n${PROXY_INFO}`
    }
    title = `${PROXY_POLICY}`
    content = `${SSID}${LAN}${CN_POLICY}IP: ${maskIP(CN_IP) || '-'}${CN_IPv6}${maskAddr(
      CN_INFO
    )}\n\n${ENTRANCE}落地 IP: ${maskIP(PROXY_IP) || '-'}${PROXY_IPv6}${maskAddr(PROXY_INFO)}${PROXY_PRIVACY}`
    
    content = `${content}\n执行时间: ${new Date().toTimeString().split(' ')[0]}`

    title = title || '网络信息 𝕏'
    if (!isPanel()) {
      if ($.lodash_get(arg, 'TYPE') === 'EVENT') {
        await notify(
          `🄳 ${maskIP(CN_IP) || '-'} 🅿 ${maskIP(PROXY_IP) || '-'}`.replace(/\n+/g, '\n').replace(/\ +/g, ' ').trim(),
          `${maskAddr(CN_INFO.replace(/(位置|运营商).*?:/g, '').replace(/\n/g, ' '))}`
            .replace(/\n+/g, '\n')
            .replace(/\ +/g, ' ')
            .trim(),
          `${maskAddr(PROXY_INFO.replace(/(位置|运营商).*?:/g, '').replace(/\n/g, ' '))}${
            CN_IPv6 ? `\n🄳 ${CN_IPv6.replace(/\n+/g, '')}` : ''
          }${PROXY_IPv6 ? `\n🅿 ${PROXY_IPv6.replace(/\n+/g, '')}` : ''}${SSID ? `\n${SSID}` : '\n'}${LAN}`
            .replace(/\n+/g, '\n')
            .replace(/\ +/g, ' ')
            .trim()
        )
      } else {
        await notify('网络信息 𝕏', title, content)
      }
    }
  }
})()
  .catch(async e => {
    $.logErr(e)
    const msg = `${$.lodash_get(e, 'message') || $.lodash_get(e, 'error') || e}`
    title = `❌`
    content = msg
    await notify('网络信息 𝕏', title, content)
  })
  .finally(async () => {
    if (isRequest()) {
      result = {
        response: {
          status: 200,
          body: JSON.stringify({ title, content }, null, 2),
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST,GET,OPTIONS,PUT,DELETE',
          },
        },
      }
    } else {
      result = { title, content, ...arg }
    }
    $.log($.toStr(result))
    $.done(result)
  })

async function getDirectRequestInfo({ PROXIES = [] } = {}) {
  const { CN_IP, CN_INFO } = await getDirectInfo(undefined, $.lodash_get(arg, 'DOMESTIC_IPv4'))
  const { POLICY } = await getRequestInfo(
    new RegExp(
      `cip\\.cc|for${keyb}\\.${keya}${bay}\\.cn|rmb\\.${keyc}${keyd}\\.com\\.cn|api-v3\\.${keya}${bay}\\.cn|ipservice\\.ws\\.126\\.net|api\\.bilibili\\.com|api\\.live\\.bilibili\\.com|myip\\.ipip\\.net|ip\\.ip233\\.cn|ip\\.im|ips\\.market\\.alicloudapi\\.com|api\\.ip\\.plus|ip\\.qtfm\\.cn|dashi\\.163\\.com|api\\.zhuishushenqi\\.com|admin-app\\.edifier\\.com|foundation-ipv4\\.youdao\\.com|ipv4\\.netart\\.cn|ip\\.netart\\.cn`
    ),
    PROXIES
  )
  return { CN_IP, CN_INFO, CN_POLICY: POLICY }
}

async function getProxyRequestInfo({ PROXIES = [] } = {}) {
  const { PROXY_IP, PROXY_INFO, PROXY_PRIVACY } = await getProxyInfo(undefined, $.lodash_get(arg, 'LANDING_IPv4'))
  let result = await getRequestInfo(/ipinfo\.io|ipwho\.is|api\.ipapi\.is|ip-api\.com|api-ipv4\.ip\.sb/, PROXIES)
  return {
    PROXY_IP,
    PROXY_INFO,
    PROXY_PRIVACY,
    PROXY_POLICY: $.lodash_get(result, 'POLICY'),
    ENTRANCE_IP: $.lodash_get(result, 'IP'),
  }
}

async function getRequestInfo(regexp, PROXIES = []) {
  let POLICY = ''
  let IP = ''
  try {
    const { requests } = await httpAPI('/v1/requests/recent', 'GET')
    const request = requests.slice(0, 10).find(i => regexp.test(i.URL))
    if (request) {
      POLICY = request.policyName
      if (/\(Proxy\)/.test(request.remoteAddress)) {
        IP = request.remoteAddress.replace(/\s*\(Proxy\)\s*/, '')
      }
    }
  } catch (e) {
    $.logErr(`从最近请求中获取 ${regexp} 发生错误: ${e.message || e}`)
  }
  return { POLICY, IP }
}

async function getDirectInfo(ip, provider) {
  let CN_IP
  let CN_INFO
  let isCN
  const msg = `使用 ${provider || 'pingan'} 查询 ${ip ? ip : '分流'} 信息`
  if (provider == 'cip') {
    try {
      const res = await http({
        url: `http://cip.cc/${ip ? encodeURIComponent(ip) : ''}`,
        headers: { 'User-Agent': 'curl/7.16.3 (powerpc-apple-darwin9.0) libcurl/7.16.3' },
      })
      let body = String($.lodash_get(res, 'body'))
      const addr = body.match(/地址\s*(:|：)\s*(.*)/)[2]
      isCN = addr.includes('中国')
      CN_IP = ip || body.match(/IP\s*(:|：)\s*(.*?)\s/)[2]
      CN_INFO = [
        ['位置:', isCN ? getflag('CN') : undefined, addr.replace(/中国\s*/, '') || ''].filter(i => i).join(' '),
        ['运营商:', body.match(/运营商\s*(:|：)\s*(.*)/)[2].replace(/中国\s*/, '') || ''].filter(i => i).join(' '),
      ].filter(i => i).join('\n')
    } catch (e) {
      $.logErr(`${msg} 发生错误: ${e.message || e}`)
    }
  } else if (!ip && provider == 'qtfm') {
    try {
      const res = await http({
        url: `https://ip.qtfm.cn/ip`,
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/109.0.0.0 Safari/537.36' },
      })
      let body = String($.lodash_get(res, 'body'))
      try { body = JSON.parse(body) } catch (e) {}
      const data = body?.data
      const ip = data?.ip
      isCN = data?.country === '中国'
      CN_IP = ip
      CN_INFO = [
        ['位置:', isCN ? getflag('CN') : '', data?.region, data?.city].filter(i => i).join(' '),
        ['运营商:', data?.isp].filter(i => i).join(' '),
      ].filter(i => i).join('\n')
    } catch (e) {
      $.logErr(`${msg} 发生错误: ${e.message || e}`)
    }
  } else if (!ip && provider == '163') {
    try {
      const res = await http({
        url: `https://dashi.163.com/fgw/mailsrv-ipdetail/detail`,
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/109.0.0.0 Safari/537.36' },
      })
      let body = String($.lodash_get(res, 'body'))
      try { body = JSON.parse(body) } catch (e) {}
      let data = $.lodash_get(body, 'result')
      const ip = data?.ip
      const countryCode = data?.countryCode
      isCN = countryCode === 'CN'
      CN_IP = ip
      CN_INFO = [
        ['位置:', getflag(countryCode), data?.province, data?.city].filter(i => i).join(' '),
        ['运营商:', data?.isp || data?.org].filter(i => i).join(' '),
      ].filter(i => i).join('\n')
    } catch (e) {
      $.logErr(`${msg} 发生错误: ${e.message || e}`)
    }
  } else if (!ip && provider == 'ipip') {
    try {
      const res = await http({
        url: `https://myip.ipip.net/json`,
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/109.0.0.0 Safari/537.36' },
      })
      let body = String($.lodash_get(res, 'body'))
      try { body = JSON.parse(body) } catch (e) {}
      isCN = $.lodash_get(body, 'data.location.0') === '中国'
      CN_IP = $.lodash_get(body, 'data.ip')
      CN_INFO = [
        ['位置:', isCN ? getflag('CN') : undefined, $.lodash_get(body, 'data.location.0'), $.lodash_get(body, 'data.location.1'), $.lodash_get(body, 'data.location.2')].filter(i => i).join(' '),
        ['运营商:', $.lodash_get(body, 'data.location.4')].filter(i => i).join(' '),
      ].filter(i => i).join('\n')
    } catch (e) {
      $.logErr(`${msg} 发生错误: ${e.message || e}`)
    }
  } else if (!ip && provider == 'bilibili') {
    try {
      const res = await http({
        url: `https://api.bilibili.com/x/web-interface/zone`,
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/109.0.0.0 Safari/537.36' },
      })
      let body = String($.lodash_get(res, 'body'))
      try { body = JSON.parse(body) } catch (e) {}
      isCN = $.lodash_get(body, 'data.country') === '中国'
      CN_IP = $.lodash_get(body, 'data.addr')
      CN_INFO = [
        ['位置:', isCN ? getflag('CN') : undefined, $.lodash_get(body, 'data.country'), $.lodash_get(body, 'data.province'), $.lodash_get(body, 'data.city')].filter(i => i).join(' '),
        ['运营商:', $.lodash_get(body, 'data.isp')].filter(i => i).join(' '),
      ].filter(i => i).join('\n')
    } catch (e) {
      $.logErr(`${msg} 发生错误: ${e.message || e}`)
    }
  } else if (provider == 'netart') {
    try {
      const res = await netart(ip, 'ipv4')
      isCN = $.lodash_get(res, 'isCN')
      CN_IP = $.lodash_get(res, 'IP')
      CN_INFO = $.lodash_get(res, 'INFO')
    } catch (e) {
      $.logErr(`${msg} 发生错误: ${e.message || e}`)
    }
  } else if (!ip && provider == '126') {
    try {
      const res = await http({
        url: `https://ipservice.ws.126.net/locate/api/getLocByIp`,
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/109.0.0.0 Safari/537.36' },
      })
      let body = String($.lodash_get(res, 'body'))
      try { body = JSON.parse(body) } catch (e) {}
      const countryCode = $.lodash_get(body, 'result.countrySymbol')
      isCN = countryCode === 'CN'
      CN_IP = $.lodash_get(body, 'result.ip')
      CN_INFO = [
        ['位置:', getflag(countryCode), $.lodash_get(body, 'result.country'), $.lodash_get(body, 'result.province'), $.lodash_get(body, 'result.city')].filter(i => i).join(' '),
        ['运营商:', $.lodash_get(body, 'result.operator') || $.lodash_get(body, 'result.company')].filter(i => i).join(' '),
      ].filter(i => i).join('\n')
    } catch (e) {
      $.logErr(`${msg} 发生错误: ${e.message || e}`)
    }
  } else if (provider == 'ipim') {
    try {
      const res = await ipim(ip)
      isCN = $.lodash_get(res, 'isCN')
      CN_IP = $.lodash_get(res, 'IP')
      CN_INFO = $.lodash_get(res, 'INFO')
    } catch (e) {
      $.logErr(`${msg} 发生错误: ${e.message || e}`)
    }
  } else {
    try {
      const res = await http({
        url: `https://rmb.${keyc}${keyd}.com.cn/itam/mas/linden/ip/request`,
        params: { ip },
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36' },
      })
      let body = String($.lodash_get(res, 'body'))
      try { body = JSON.parse(body) } catch (e) {}

      const countryCode = $.lodash_get(body, 'data.countryIsoCode')
      isCN = countryCode === 'CN'
      CN_IP = ip || $.lodash_get(body, 'data.ip')
      CN_INFO = [
        ['位置:', getflag(countryCode), $.lodash_get(body, 'data.country').replace(/\s*中国\s*/, ''), $.lodash_get(body, 'data.region'), $.lodash_get(body, 'data.city')].filter(i => i).join(' '),
        ['运营商:', $.lodash_get(body, 'data.isp') || '-'].filter(i => i).join(' '),
        $.lodash_get(arg, 'ORG') == 1 ? ['组织:', $.lodash_get(body, 'org') || '-'].filter(i => i).join(' ') : undefined,
      ].filter(i => i).join('\n')
    } catch (e) {
      $.logErr(`${msg} 发生错误: ${e.message || e}`)
    }
  }
  return { CN_IP, CN_INFO: simplifyAddr(CN_INFO), isCN }
}

async function getDirectInfoIPv6() {
  let CN_IPv6
  const msg = `使用 ${$.lodash_get(arg, 'DOMESTIC_IPv6') || 'ddnspod'} 查询 IPv6 分流信息`
  if ($.lodash_get(arg, 'DOMESTIC_IPv6') == 'netart') {
    try {
      const res = await netart(undefined, 'ipv6')
      CN_IPv6 = $.lodash_get(res, 'IP')
    } catch (e) {
      $.logErr(`${msg} 发生错误: ${e.message || e}`)
    }
  } else {
    try {
      const res = await http({
        url: `https://ipv6.ddnspod.com`,
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/109.0.0.0' },
      })
      let body = String($.lodash_get(res, 'body'))
      CN_IPv6 = body.trim()
    } catch (e) {
      $.logErr(`${msg} 发生错误: ${e.message || e}`)
    }
  }
  return { CN_IPv6 }
}

async function getProxyInfo(ip, provider) {
  let PROXY_IP
  let PROXY_INFO
  let PROXY_PRIVACY

  const msg = `使用 ${provider || 'ipapi'} 查询 ${ip ? ip : '分流'} 信息`

  if (provider == 'ipinfo') {
    try {
      let token = $.lodash_get(arg, 'LANDING_IPv4_KEY')
      if (!token) throw new Error('请在 LANDING_IPv4_KEY 填写 ipinfo 的 token')
      token = token.split(/,|，/).map(i => i.trim()).filter(i => i)
      token = token[Math.floor(Math.random() * token.length)]
      const res = await http({
        url: ip ? `https://ipinfo.io/${encodeURIComponent(ip)}/json?token=${encodeURIComponent(token)}` : `https://ipinfo.io/json?token=${encodeURIComponent(token)}`,
        headers: { 'User-Agent': 'Mozilla/5.0 (iPhone CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1' },
      })
      let body = String($.lodash_get(res, 'body'))
      try { body = JSON.parse(body) } catch (e) {}
      PROXY_IP = ip || $.lodash_get(body, 'ip')
      PROXY_INFO = [
        ['位置:', getflag(body.country), body.country.replace(/\s*中国\s*/, ''), body.region, body.city].filter(i => i).join(' '),
        ['运营商:', $.lodash_get(body, 'org') || '-'].filter(i => i).join(' '),
      ].filter(i => i).join('\n')
    } catch (e) {
      $.logErr(`${msg} 发生错误: ${e.message || e}`)
    }
  } else if (provider == 'ipsb') {
    try {
      const res = await http({
        url: `https://api-ipv4.ip.sb/geoip${ip ? `/${encodeURIComponent(ip)}` : ''}`,
        headers: { 'User-Agent': 'Mozilla/5.0 (iPhone CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1' },
      })
      let body = String($.lodash_get(res, 'body'))
      try { body = JSON.parse(body) } catch (e) {}
      PROXY_IP = ip || $.lodash_get(body, 'ip')
      PROXY_INFO = [
        ['位置:', getflag($.lodash_get(body, 'country_code')), $.lodash_get(body, 'country'), $.lodash_get(body, 'region'), $.lodash_get(body, 'city')].filter(i => i).join(' '),
        ['运营商:', body.isp || body.organization].filter(i => i).join(' '),
        $.lodash_get(arg, 'ORG') == 1 ? ['组织:', $.lodash_get(body, 'asn_organization') || '-'].filter(i => i).join(' ') : undefined,
      ].filter(i => i).join('\n')
    } catch (e) {
      $.logErr(`${msg} 发生错误: ${e.message || e}`)
    }
  } else {
    try {
      const p = ip ? `/${encodeURIComponent(ip)}` : ''
      const res = await http({
        url: `http://ip-api.com/json${p}?lang=zh-CN`,
        headers: { 'User-Agent': 'Mozilla/5.0 (iPhone CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1' },
      })
      let body = String($.lodash_get(res, 'body'))
      try { body = JSON.parse(body) } catch (e) {}
      PROXY_IP = ip || $.lodash_get(body, 'query')
      PROXY_INFO = [
        ['位置:', getflag(body.countryCode), body.country.replace(/\s*中国\s*/, ''), body.regionName ? body.regionName.split(/\s+or\s+/)[0] : body.regionName, body.city].filter(i => i).join(' '),
        ['运营商:', body.isp || body.org || body.as].filter(i => i).join(' '),
        $.lodash_get(arg, 'ORG') == 1 ? ['组织:', $.lodash_get(body, 'org') || '-'].filter(i => i).join(' ') : undefined,
      ].filter(i => i).join('\n')
    } catch (e) {
      $.logErr(`${msg} 发生错误: ${e.message || e}`)
    }
  }

  return { PROXY_IP, PROXY_INFO: simplifyAddr(PROXY_INFO), PROXY_PRIVACY }
}

async function getProxyInfoIPv6(ip) {
  let PROXY_IPv6
  const msg = `使用 ${$.lodash_get(arg, 'LANDING_IPv6') || 'ipsb'} 查询 IPv6 分流信息`
  try {
    const res = await http({
      url: `https://api-ipv6.ip.sb/ip`,
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/109.0.0.0' },
    })
    let body = String($.lodash_get(res, 'body'))
    PROXY_IPv6 = body.trim()
  } catch (e) {
    $.logErr(`${msg} 发生错误: ${e.message || e}`)
  }
  return { PROXY_IPv6 }
}

async function ipim(ip) {
  let isCN, IP, INFO
  const res = await http({
    url: `https://ip.im/${ip ? encodeURIComponent(ip) : 'info'}`,
    headers: { 'User-Agent': 'curl/7.16.3 (powerpc-apple-darwin9.0) libcurl/7.16.3' },
  })
  let body = String($.lodash_get(res, 'body'))
  IP = body.match(/(^|\s+)Ip\s*(:|：)\s*(.*)/m)?.[3]
  const country = body.match(/(^|\s+)Country\s*(:|：)\s*(.*)/m)?.[3]
  const province = body.match(/(^|\s+)Province\s*(:|：)\s*(.*)/m)?.[3] || body.match(/(^|\s+)Region\s*(:|：)\s*(.*)/m)?.[3]
  const city = body.match(/(^|\s+)City\s*(:|：)\s*(.*)/m)?.[3]
  const district = body.match(/(^|\s+)Districts\s*(:|：)\s*(.*)/m)?.[3]
  const isp = body.match(/(^|\s+)Isp\s*(:|：)\s*(.*)/m)?.[3]
  const org = body.match(/(^|\s+)Org\s*(:|：)\s*(.*)/m)?.[3]

  isCN = country.includes('中国')
  INFO = [
    ['位置:', isCN ? getflag('CN') : getflag(country), country, province, city, district].filter(i => i).join(' '),
    ['运营商:', isp || '-'].filter(i => i).join(' '),
    $.lodash_get(arg, 'ORG') == 1 ? ['组织:', org || '-'].filter(i => i).join(' ') : undefined,
  ].filter(i => i).join('\n')
  return { IP, INFO, isCN }
}

async function netart(ip, version = 'ipv4') {
  let isCN, IP, INFO
  const res = await http({
    url: ip ? `https://ip.netart.cn?ip=${encodeURIComponent(ip)}` : `https://${version}.netart.cn`,
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36' },
  })
  let body = String($.lodash_get(res, 'body'))
  try { body = JSON.parse(body) } catch (e) {}

  IP = $.lodash_get(body, 'ip')
  const countryCode = $.lodash_get(body, 'country.code')
  const country = $.lodash_get(body, 'country.name') || ''
  isCN = countryCode === 'CN' || country === '中国'

  INFO = [
    ['位置:', getflag(countryCode), country.replace(/\s*中国\s*/, ''), $.lodash_get(body, 'geo_cn.division.short.0') || $.lodash_get(body, 'subdivision'), $.lodash_get(body, 'geo_cn.division.short.1') || $.lodash_get(body, 'city'), $.lodash_get(body, 'geo_cn.division.short.2') || $.lodash_get(body, 'area')].filter(i => i).join(' '),
    ['运营商:', $.lodash_get(body, 'geo_cn.isp') || $.lodash_get(body, 'as.info') || $.lodash_get(body, 'as.name') || '-'].filter(i => i).join(' '),
  ].filter(i => i).join('\n')
  return { IP, INFO, isCN }
}

function simplifyAddr(addr) {
  if (!addr) return ''
  return addr.split(/\n/).map(i => Array.from(new Set(i.split(/\ +/))).join(' ')).join('\n')
}

function maskAddr(addr) {
  if (!addr) return ''
  if ($.lodash_get(arg, 'MASK') == 1) {
    let result = ''
    const parts = addr.split(' ')
    if (parts.length >= 3) {
      result = [parts[0], '*', parts[parts.length - 1]].join(' ')
    } else {
      const third = Math.floor(addr.length / 3)
      result = addr.substring(0, third) + '*'.repeat(third) + addr.substring(2 * third)
    }
    return result
  } else {
    return addr
  }
}

function maskIP(ip) {
  if (!ip) return ''
  if ($.lodash_get(arg, 'MASK') == 1) {
    let result = ''
    if (ip.includes('.')) {
      let parts = ip.split('.')
      result = [...parts.slice(0, 2), '*', '*'].join('.')
    } else {
      let parts = ip.split(':')
      result = [...parts.slice(0, 4), '*', '*', '*', '*'].join(':')
    }
    return result
  } else {
    return ip
  }
}

function getflag(e) {
  if ($.lodash_get(arg, 'FLAG', 1) == 1) {
    try {
      const t = e.toUpperCase().split('').map(e => 127397 + e.charCodeAt())
      return String.fromCodePoint(...t).replace(/🇹🇼/g, '🇼🇸')
    } catch (e) {
      return ''
    }
  } else {
    return ''
  }
}

function parseQueryString(url) {
  const queryString = url.split('?')[1]
  const regex = /([^=&]+)=([^&]*)/g
  const params = {}
  let match
  while ((match = regex.exec(queryString))) {
    params[decodeURIComponent(match[1])] = decodeURIComponent(match[2])
  }
  return params
}

const DOMAIN_RESOLVERS = {
  ali: async function (domain, type) {
    const resp = await http({
      url: `http://223.6.6.6/resolve`,
      params: { edns_client_subnet: '223.6.6.6/24', name: domain, short: 1, type: type === 'IPv6' ? 'AAAA' : 'A' },
      headers: { accept: 'application/dns-json' },
    })
    const answers = JSON.parse(resp.body)
    if (answers.length === 0) throw new Error('域名解析无结果')
    return answers[answers.length - 1]
  }
}

async function resolveDomain(domain) {
  let IPv4, IPv6
  if (isIPv4(domain)) {
    IPv4 = domain
  } else if (isIPv6(domain)) {
    IPv6 = domain
  } else {
    let resolver = DOMAIN_RESOLVERS['ali']
    const res = await Promise.all([
      (async () => { try { return await resolver(domain, 'IPv4') } catch (e) {} })(),
      (async () => { try { return await resolver(domain, 'IPv6') } catch (e) {} })(),
    ])
    const [v4, v6] = res
    if (isIPv4(v4)) IPv4 = v4
    if (isIPv6(v6)) IPv6 = v6
  }
  return { IP: IPv4 || IPv6, IPv4, IPv6 }
}

const IPV4_REGEX = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)(\.(?!$)|$)){4}$/
const IPV6_REGEX = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/

function isIPv4(ip) { return IPV4_REGEX.test(ip) }
function isIPv6(ip) { return IPV6_REGEX.test(ip) }

async function getProxies() {
  return { PROXIES: [] }
}

async function httpAPI(path = '/v1/requests/recent', method = 'GET', body = null) {
  return new Promise((resolve) => {
    $httpAPI(method, path, body, result => { resolve(result) })
  })
}

function isRequest() { return typeof $request !== 'undefined' }
function isPanel() { return typeof $input != 'undefined' && $.lodash_get($input, 'purpose') === 'panel' }

async function http(opt = {}) {
  const TIMEOUT = parseFloat(opt.timeout || $.lodash_get(arg, 'TIMEOUT') || 5)
  const RETRIES = parseFloat(opt.retries || $.lodash_get(arg, 'RETRIES') || 1)
  const RETRY_DELAY = parseFloat(opt.retry_delay || $.lodash_get(arg, 'RETRY_DELAY') || 1)

  let timeout = TIMEOUT + 1

  let count = 0
  const fn = async () => {
    try {
      if (TIMEOUT) {
        return await Promise.race([
          $.http.get({ ...opt, timeout }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('HTTP TIMEOUT')), TIMEOUT * 1000)),
        ])
      }
      return await $.http.get(opt)
    } catch (e) {
      if (count < RETRIES) {
        count++
        $.log(`第 ${count} 次请求失败: ${e.message || e}, 等待 ${RERY_DELAY}s 后重试`)
        await $.wait(RETRY_DELAY * 1000)
        return await fn()
      }
    }
  }
  return await fn()
}

async function notify(title, subt, desc, opts) {
  if ($.lodash_get(arg, 'TYPE') === 'EVENT' || $.lodash_get(arg, 'notify') == 1) {
    $.msg(title, subt, desc, opts)
  } else {
    $.log('🔕', title, subt, desc, opts)
  }
}

// ============== 专为 Surge 极度精简的 Env 类 ==============
function Env(name) {
  class Http {
    constructor(env) { this.env = env; }
    send(opt, method = "GET") {
      opt = typeof opt === "string" ? { url: opt } : opt;
      return new Promise((resolve, reject) => {
        const action = method === "POST" ? this.env.post.bind(this.env) : this.env.get.bind(this.env);
        action(opt, (err, resp, body) => {
          if (err) reject(err);
          else resolve(resp);
        });
      });
    }
    get(opt) { return this.send(opt, "GET"); }
    post(opt) { return this.send(opt, "POST"); }
  }

  return new class {
    constructor(name) {
      this.name = name;
      this.http = new Http(this);
      this.logs = [];
      this.startTime = (new Date()).getTime();
      this.log('', `🔔${this.name}, 开始!`);
    }
    
    // 只保留 Surge，清理所有其他环境判断函数，避免错误执行
    isSurge() { return true; }

    toObj(t, e = null) { try { return JSON.parse(t); } catch { return e; } }
    toStr(t, e = null) { try { return JSON.stringify(t); } catch { return e; } }
    
    getjson(t, e) {
      let s = e;
      const a = this.getval(t);
      if (a) try { s = JSON.parse(a); } catch {}
      return s;
    }
    
    setjson(t, e) {
      try { return this.setval(JSON.stringify(t), e); } catch { return false; }
    }
    
    getval(t) { return $persistentStore.read(t); }
    setval(t, e) { return $persistentStore.write(t, e); }
    
    get(t, e) {
      t.headers = t.headers || {};
      Object.assign(t.headers, { "X-Surge-Skip-Scripting": false });
      $httpClient.get(t, (err, resp, body) => {
        if (!err && resp) { 
          resp.body = body; 
          resp.statusCode = resp.status ? resp.status : resp.statusCode; 
          resp.status = resp.statusCode; 
        }
        e(err, resp, body);
      });
    }
    
    post(t, e) {
      t.headers = t.headers || {};
      Object.assign(t.headers, { "X-Surge-Skip-Scripting": false });
      $httpClient.post(t, (err, resp, body) => {
        if (!err && resp) { 
          resp.body = body; 
          resp.statusCode = resp.status ? resp.status : resp.statusCode; 
          resp.status = resp.statusCode; 
        }
        e(err, resp, body);
      });
    }
    
    msg(title = this.name, subt = "", desc = "", opts) {
      $notification.post(title, subt, desc, opts?.url ? { url: opts.url } : {});
    }
    
    log(...t) { 
      t.length > 0 && (this.logs = [...this.logs, ...t]); 
      console.log(t.join('\n')); 
    }
    
    logErr(t) { this.log('', `❗️${this.name}, 错误!`, t); }
    wait(t) { return new Promise(e => setTimeout(e, t)); }
    
    done(t = {}) {
      const e = (new Date()).getTime(), s = (e - this.startTime) / 1000;
      this.log('', `🔔${this.name}, 结束! 🕛 ${s} 秒`);
      this.log();
      $done(t);
    }
    
    lodash_get(t, e, s) {
      const a = e.replace(/\[(\d+)\]/g, ".$1").split(".");
      let r = t;
      for (const t of a) if (r = Object(r)[t], void 0 === r) return s;
      return r;
    }
    
    lodash_set(t, e, s) {
      return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, a) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[a + 1]) >> 0 == +e[a + 1] ? [] : {}, t)[e[e.length - 1]] = s, t);
    }
  }(name);
}
