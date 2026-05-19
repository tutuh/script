const $ = new Env('network-speed')

$.isPanel = () => $.isSurge() && typeof $input != 'undefined' && $.lodash_get($input, 'purpose') === 'panel'
$.isTile = () => $.isStash() && typeof $script != 'undefined' && $.lodash_get($script, 'type') === 'tile'

const arg = parseArgs(typeof $argument !== 'undefined' ? $argument : '')

let title = ''
let content = ''
let icon = ''
let color = ''
let result = {}

!(async () => {
  try {
    if ($.isTile()) {
      await notify('网络速率', '面板', '开始查询')
    }

    const mb = Math.max(1, Number(arg.mb) || 1)
    const bytes = mb * 1024 * 1024

    const start = Date.now()
    await $.http.get({
      url: `https://speed.cloudflare.com/__down?bytes=${bytes}`,
      timeout: 15000
    })
    const duration = (Date.now() - start) / 1000
    const speedMbps = Math.max(0, round((mb / duration) * 8))

    const pingStart = Date.now()
    await $.http.get({
      url: 'http://cp.cloudflare.com/generate_204',
      timeout: 10000
    })
    const pingt = Date.now() - pingStart

    const speedTier = getTier(speedMbps, 30, 100)

    const presetMap = {
      1: {
        icon: arg.iconslow || '🐢',
        color: arg.colorlow || '#9E9E9E'
      },
      2: {
        icon: arg.iconmid || '🐰',
        color: arg.colormid || '#4CAF50'
      },
      3: {
        icon: arg.iconfast || '⚡',
        color: arg.colorhigh || '#FFC107'
      }
    }

    icon = presetMap[speedTier].icon
    color = presetMap[speedTier].color

    console.log(`网速档位: ${speedTier}, 图标: ${icon}, 颜色: ${color}`)
    console.log(`延迟: ${pingt} ms`)
    console.log(`耗时: ${duration} s`)

    title = 'NetSpeed'
    content = `下行速率: ${speedMbps} Mbps\n网络延迟: ${pingt} ms\n测试耗时: ${round(duration, 2)}s`

    result = {
      title,
      content,
      icon,
      'icon-color': color,
      ...arg
    }

    if ($.isTile()) {
      await notify('网络速率', '面板', '查询完成')
    } else if (!$.isPanel()) {
      await notify('网络速率', title, content)
    }
  } catch (e) {
    $.logErr(e)
    $.logErr($.toStr(e))

    const msg = `${$.lodash_get(e, 'message') || $.lodash_get(e, 'error') || e}`
    title = '❌'
    content = msg
    result = { title, content }

    await notify('网络速率', title, content)
  } finally {
    $.log($.toStr(result))
    $.done(result)
  }
})()

async function notify(title, subt, desc, opts) {
  if ($.lodash_get(arg, 'notify')) {
    $.msg(title, subt, desc, opts)
  }
}

function parseArgs(input) {
  if (!input) return {}

  return input.split('&').reduce((acc, item) => {
    if (!item) return acc

    const idx = item.indexOf('=')
    const rawKey = idx === -1 ? item : item.slice(0, idx)
    const rawVal = idx === -1 ? '' : item.slice(idx + 1)

    const key = safeDecode(rawKey)
    const val = safeDecode(rawVal)

    if (key) acc[key] = val
    return acc
  }, {})
}

function safeDecode(str) {
  try {
    return decodeURIComponent(String(str).replace(/\+/g, ' '))
  } catch {
    return String(str)
  }
}

function getTier(value, low, high) {
  if (value < low) return 1
  if (value < high) return 2
  return 3
}

function createRound(methodName) {
  const func = Math[methodName]
  return (number, precision) => {
    precision = precision == null ? 0 : precision >= 0 ? Math.min(precision, 292) : Math.max(precision, -292)
    if (precision) {
      let pair = `${number}e`.split('e')
      const value = func(`${pair[0]}e${+pair[1] + precision}`)
      pair = `${value}e`.split('e')
      return +`${pair[0]}e${+pair[1] - precision}`
    }
    return func(number)
  }
}

function round(...args) {
  return createRound('round')(...args)
}