
const NAME = 'network-info'
const $ = Env(NAME)

// 获取 ASN 或 ORG 的辅助函数
function getAsnOrOrg(data) {
  if (data.as) return data.as.split(' ')[0] // 通常 IP-API 的 'as' 格式为 "AS12345 Name"
  return data.org || data.isp || ''
}

// 核心执行逻辑
!(async () => {
  let title = '网络信息 𝕏'
  let ssid = $.lodash_get($network, 'wifi.ssid', '蜂窝网络')
  let localV4 = $.lodash_get($network, 'v4.primaryAddress', '-')

  // 并行获取入口与落地信息
  let [entrance, landing] = await Promise.all([getEntranceInfo(), getLandingInfo()])

  let content = [
    `SSID: ${ssid}`,
    `本地: ${maskIP(localV4)}`,
    `---`,
    `入口: ${entrance.ip}`,
    entrance.info ? `位置: ${entrance.info}` : '',
    entrance.asn ? `ASN: ${entrance.asn}` : '',
    `---`,
    `落地: ${landing.ip}`,
    landing.info ? `位置: ${landing.info}` : '',
    landing.asn ? `ASN: ${landing.asn}` : ''
  ].filter(i => i !== '').join('\n')

  $.done({ title, content })
})()

// 获取代理节点入口信息
async function getEntranceInfo() {
  try {
    const { requests = [] } = await httpAPI('/v1/requests/recent', 'GET')
    const req = requests.find(i => /\(Proxy\)/.test(i.remoteAddress))
    if (!req) return { ip: '直连模式' }
    
    const ip = req.remoteAddress.replace(/\s*\(Proxy\)\s*/, '')
    const res = await http({ url: `http://ip-api.com/json/${ip}?lang=zh-CN` })
    const data = JSON.parse(res.body)
    return { 
      ip: maskIP(ip), 
      info: `${getflag(data.countryCode)} ${data.country} ${data.city}`,
      asn: getAsnOrOrg(data)
    }
  } catch (e) { return { ip: '获取中...' } }
}

// 获取落地服务器信息
async function getLandingInfo() {
  try {
    const res = await http({ url: `http://ip-api.com/json/?lang=zh-CN` })
    const data = JSON.parse(res.body)
    return { 
      ip: data.query, 
      info: `${getflag(data.countryCode)} ${data.country} ${data.city}`,
      asn: getAsnOrOrg(data)
    }
  } catch (e) { return { ip: '查询失败' } }
}

// 辅助工具
function maskIP(ip) {
  if (ip === '-') return '-'
  return ip.replace(/(\d+)\.(\d+)\.(\d+)\.(\d+)/, '$1.$2.*.*')
}

function getflag(e) {
  try {
    const t = e?.toUpperCase().split('').map(e => 127397 + e.charCodeAt())
    return String.fromCodePoint(...t)
  } catch (e) { return '' }
}

async function http(opt) {
  return new Promise((resolve) => {
    $httpClient.get(opt, (err, resp, body) => {
      resp.body = body
      resolve(resp)
    })
  })
}

async function httpAPI(path, method) {
  return new Promise((resolve) => {
    $httpAPI(method, path, null, (res) => resolve(res || {}))
  })
}

function Env(name) {
  return new class {
    constructor(name) { this.name = name }
    log(t) { console.log(t) }
    done(t) { $done(t) }
    lodash_get(t, e, s) { 
      const a = e.replace(/\[(\d+)\]/g, ".$1").split(".");
      let r = t;
      for (const t of a) if (r = Object(r)[t], void 0 === r) return s;
      return r;
    }
  }(name)
}