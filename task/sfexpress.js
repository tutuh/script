// 顺丰速运签到脚本 - Surge版
const $ = new Env('顺丰速运')
$.KEY_login = 'chavy_login_sfexpress'

!(async () => {
  // 检查是否有保存的登录会话
  const loginSession = $.getjson($.KEY_login)
  if (!loginSession) {
    $.msg($.name, '❌ 错误', '请先获取登录会话\n1. 打开顺丰速运APP\n2. 确保已登录账号\n3. 返回Surge查看捕获结果')
    return
  }

  console.log('开始执行顺丰签到...')
  
  // 从登录会话中提取Cookie和必要信息
  const headers = loginSession.headers || {}
  const cookie = headers.Cookie || headers.cookie || ''
  
  if (!cookie) {
    $.msg($.name, '❌ 错误', '未获取到Cookie信息，请重新获取登录会话')
    return
  }

  console.log('Cookie:', cookie.substring(0, 100) + '...')

  // 执行签到
  await sign(cookie)
  await $.wait('1000')
  
  // 查询并完成任务
  await queryAndDoTasks(cookie)
  
  // 显示结果
  showmsg()
})()
  .catch((e) => {
    console.log('脚本执行错误:', e)
    $.logErr(e)
  })
  .finally(() => $.done())

// 签到函数
function sign(cookie) {
  return $.http
    .post({
      url: 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~integralTaskSignPlusService~automaticSignFetchPackage',
      body: JSON.stringify({
        comeFrom: 'vioin',
        channelFrom: 'SFAPP'
      }),
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie,
        'User-Agent': 'SF-Express/5.0 (iPhone; iOS 15.0; Scale/3.0)',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Origin': 'https://mcs-mimp-web.sf-express.com',
        'Referer': 'https://mcs-mimp-web.sf-express.com/mcs-mimp/index.html'
      }
    })
    .then((resp) => {
      try {
        $.sign = JSON.parse(resp.body)
        console.log('签到结果:', $.sign)
      } catch (e) {
        console.log('解析签到结果失败:', resp.body)
        $.sign = { success: false, errorMessage: '解析失败' }
      }
    })
    .catch((err) => {
      console.log('签到请求失败:', err)
      $.sign = { success: false, errorMessage: '网络错误' }
    })
}

// 查询任务列表
function queryTasks(cookie) {
  return $.http
    .post({
      url: 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~integralTaskStrategyService~queryPointTaskAndSignFromES',
      body: JSON.stringify({
        channelType: '1'
      }),
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie,
        'User-Agent': 'SF-Express/5.0 (iPhone; iOS 15.0; Scale/3.0)',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Origin': 'https://mcs-mimp-web.sf-express.com',
        'Referer': 'https://mcs-mimp-web.sf-express.com/mcs-mimp/index.html'
      }
    })
    .then((resp) => {
      try {
        const data = JSON.parse(resp.body)
        console.log('查询任务返回:', data)
        
        if (!data.success) {
          console.log('查询任务失败:', data.errorMessage)
          return []
        }
        
        // 尝试多种可能的任务列表字段
        const tasks = data.obj?.taskTitleLevels || 
                     data.obj?.taskList || 
                     data.obj?.tasks || 
                     []
        
        if (tasks.length === 0) {
          console.log('未找到任务列表，完整数据:', JSON.stringify(data))
        }
        
        return tasks
      } catch (e) {
        console.log('解析任务列表失败:', resp.body)
        return []
      }
    })
    .catch((err) => {
      console.log('查询任务请求失败:', err)
      return []
    })
}

// 完成任务
function finishTask(taskCode, cookie) {
  return $.http
    .post({
      url: 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonRoutePost/memberEs/taskRecord/finishTask',
      body: JSON.stringify({
        taskCode: taskCode
      }),
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie,
        'User-Agent': 'SF-Express/5.0 (iPhone; iOS 15.0; Scale/3.0)'
      }
    })
    .then((resp) => {
      try {
        return JSON.parse(resp.body)
      } catch (e) {
        return { success: false }
      }
    })
}

// 领取积分
function fetchPoint(strategyId, taskId, taskCode, cookie) {
  return $.http
    .post({
      url: 'https://mcs-mimp-web.sf-express.com/mcs-mimp/commonPost/~memberNonactivity~integralTaskStrategyService~fetchIntegral',
      body: JSON.stringify({
        strategyId: strategyId,
        taskId: taskId,
        taskCode: taskCode,
        channelType: '1'
      }),
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie,
        'User-Agent': 'SF-Express/5.0 (iPhone; iOS 15.0; Scale/3.0)'
      }
    })
    .then((resp) => {
      try {
        return JSON.parse(resp.body)
      } catch (e) {
        return { success: false, errorMessage: '解析失败' }
      }
    })
}

// 查询并完成任务
async function queryAndDoTasks(cookie) {
  console.log('开始查询任务列表...')
  $.tasks = await queryTasks(cookie)
  
  if (!$.tasks || $.tasks.length === 0) {
    console.log('没有获取到任务列表')
    $.tasks = []
    return
  }
  
  console.log(`获取到 ${$.tasks.length} 个任务`)
  
  for (let i = 0; i < $.tasks.length; i++) {
    const task = $.tasks[i]
    console.log(`处理任务 ${i+1}/${$.tasks.length}:`, task.title || task.taskName)
    
    try {
      if (task.status === 1) {
        // 可以直接领取
        const result = await fetchPoint(task.strategyId, task.taskId, task.taskCode, cookie)
        task.result = result.success ? '✅ 积分领取成功' : `❌ ${result.errorMessage || '领取失败'}`
        console.log('领取结果:', task.result)
        
      } else if (task.status === 2) {
        // 需要先完成再领取
        console.log('完成任务:', task.taskCode)
        await finishTask(task.taskCode, cookie)
        await $.wait('500')
        
        const result = await fetchPoint(task.strategyId, task.taskId, task.taskCode, cookie)
        task.result = result.success ? '✅ 完成并领取成功' : `❌ ${result.errorMessage || '领取失败'}`
        console.log('完成并领取结果:', task.result)
        
      } else if (task.status === 3) {
        task.result = '✅ 积分已领取'
      } else {
        task.result = '⏸️ 未完成'
      }
    } catch (e) {
      console.log('处理任务出错:', e)
      task.result = '❌ 处理异常'
    }
    
    await $.wait('500') // 任务间延时，避免请求过快
  }
}

// 显示结果
function showmsg() {
  const subtasks = []
  
  // 签到结果
  if ($.sign) {
    if ($.sign.success) {
      if ($.sign.obj?.hasFinishSign) {
        subtasks.push(`📅 签到: 今日已签 (连续${$.sign.obj.countDay || 0}天)`)
      } else {
        subtasks.push(`📅 签到: 成功 (连续${$.sign.obj.countDay || 0}天)`)
      }
    } else {
      subtasks.push(`📅 签到: 失败 (${$.sign.errorMessage || '未知错误'})`)
    }
  } else {
    subtasks.push('📅 签到: 未执行')
  }
  
  subtasks.push('') // 空行
  subtasks.push('📋 每日任务:')
  
  // 任务结果
  if ($.tasks && $.tasks.length > 0) {
    for (let i = 0; i < $.tasks.length; i++) {
      const task = $.tasks[i]
      const name = task.title || task.taskName || `任务${i+1}`
      const result = task.result || '⏸️ 未处理'
      subtasks.push(`${i+1}. ${name}: ${result}`)
    }
  } else {
    subtasks.push('暂无任务或获取失败')
  }
  
  // 发送通知
  $.msg($.name, '顺丰签到结果', subtasks.join('\n'))
}

// Env类定义
function Env(name) {
  this.name = name
  this.log = console.log
  this.logErr = console.error
  
  this.getjson = function(key) {
    try {
      const val = $persistentStore.read(key)
      return val ? JSON.parse(val) : null
    } catch (e) {
      return null
    }
  }
  
  this.setdata = function(val, key) {
    try {
      $persistentStore.write(val, key)
      return true
    } catch (e) {
      return false
    }
  }
  
  this.msg = function(title, subt, desc) {
    try {
      $notification.post(title, subt, desc)
    } catch (e) {
      this.log('通知发送失败:', e)
    }
  }
  
  this.wait = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
  
  this.done = function() {
    $done({})
  }
}

// prettier-ignore
function Env(e,t){class s{constructor(e){this.env=e}send(e,t="GET"){e="string"==typeof e?{url:e}:e;let s=this.get;"POST"===t&&(s=this.post);const i=new Promise(((t,i)=>{s.call(this,e,((e,s,o)=>{e?i(e):t(s)}))}));return e.timeout?((e,t=1e3)=>Promise.race([e,new Promise(((e,s)=>{setTimeout((()=>{s(new Error("请求超时"))}),t)}))]))(i,e.timeout):i}get(e){return this.send.call(this.env,e)}post(e){return this.send.call(this.env,e,"POST")}}return new class{constructor(e,t){this.logLevels={debug:0,info:1,warn:2,error:3},this.logLevelPrefixs={debug:"[DEBUG] ",info:"[INFO] ",warn:"[WARN] ",error:"[ERROR] "},this.logLevel="info",this.name=e,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,t),this.log("",`🔔${this.name}, 开始!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(e,t=null){try{return JSON.parse(e)}catch{return t}}toStr(e,t=null,...s){try{return JSON.stringify(e,...s)}catch{return t}}getjson(e,t){let s=t;if(this.getdata(e))try{s=JSON.parse(this.getdata(e))}catch{}return s}setjson(e,t){try{return this.setdata(JSON.stringify(e),t)}catch{return!1}}getScript(e){return new Promise((t=>{this.get({url:e},((e,s,i)=>t(i)))}))}runScript(e,t){return new Promise((s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let o=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");o=o?1*o:20,o=t&&t.timeout?t.timeout:o;const[r,a]=i.split("@"),n={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:e,mock_type:"cron",timeout:o},headers:{"X-Key":r,Accept:"*/*"},policy:"DIRECT",timeout:o};this.post(n,((e,t,i)=>s(i)))})).catch((e=>this.logErr(e)))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const e=this.path.resolve(this.dataFile),t=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(e),i=!s&&this.fs.existsSync(t);if(!s&&!i)return{};{const i=s?e:t;try{return JSON.parse(this.fs.readFileSync(i))}catch(e){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const e=this.path.resolve(this.dataFile),t=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(e),i=!s&&this.fs.existsSync(t),o=JSON.stringify(this.data);s?this.fs.writeFileSync(e,o):i?this.fs.writeFileSync(t,o):this.fs.writeFileSync(e,o)}}lodash_get(e,t,s){const i=t.replace(/\[(\d+)\]/g,".$1").split(".");let o=e;for(const e of i)if(o=Object(o)[e],void 0===o)return s;return o}lodash_set(e,t,s){return Object(e)!==e||(Array.isArray(t)||(t=t.toString().match(/[^.[\]]+/g)||[]),t.slice(0,-1).reduce(((e,s,i)=>Object(e[s])===e[s]?e[s]:e[s]=Math.abs(t[i+1])>>0==+t[i+1]?[]:{}),e)[t[t.length-1]]=s),e}getdata(e){let t=this.getval(e);if(/^@/.test(e)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(e),o=s?this.getval(s):"";if(o)try{const e=JSON.parse(o);t=e?this.lodash_get(e,i,""):t}catch(e){t=""}}return t}setdata(e,t){let s=!1;if(/^@/.test(t)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(t),r=this.getval(i),a=i?"null"===r?null:r||"{}":"{}";try{const t=JSON.parse(a);this.lodash_set(t,o,e),s=this.setval(JSON.stringify(t),i)}catch(t){const r={};this.lodash_set(r,o,e),s=this.setval(JSON.stringify(r),i)}}else s=this.setval(e,t);return s}getval(e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(e);case"Quantumult X":return $prefs.valueForKey(e);case"Node.js":return this.data=this.loaddata(),this.data[e];default:return this.data&&this.data[e]||null}}setval(e,t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(e,t);case"Quantumult X":return $prefs.setValueForKey(e,t);case"Node.js":return this.data=this.loaddata(),this.data[t]=e,this.writedata(),!0;default:return this.data&&this.data[t]||null}}initGotEnv(e){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,e&&(e.headers=e.headers?e.headers:{},e&&(e.headers=e.headers?e.headers:{},void 0===e.headers.cookie&&void 0===e.headers.Cookie&&void 0===e.cookieJar&&(e.cookieJar=this.ckjar)))}get(e,t=(()=>{})){switch(e.headers&&(delete e.headers["Content-Type"],delete e.headers["Content-Length"],delete e.headers["content-type"],delete e.headers["content-length"]),e.params&&(e.url+="?"+this.queryStr(e.params)),void 0===e.followRedirect||e.followRedirect||((this.isSurge()||this.isLoon())&&(e["auto-redirect"]=!1),this.isQuanX()&&(e.opts?e.opts.redirection=!1:e.opts={redirection:!1})),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(e.headers=e.headers||{},Object.assign(e.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(e,((e,s,i)=>{!e&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),t(e,s,i)}));break;case"Quantumult X":this.isNeedRewrite&&(e.opts=e.opts||{},Object.assign(e.opts,{hints:!1})),$task.fetch(e).then((e=>{const{statusCode:s,statusCode:i,headers:o,body:r,bodyBytes:a}=e;t(null,{status:s,statusCode:i,headers:o,body:r,bodyBytes:a},r,a)}),(e=>t(e&&e.error||"UndefinedError")));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(e),this.got(e).on("redirect",((e,t)=>{try{if(e.headers["set-cookie"]){const s=e.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),t.cookieJar=this.ckjar}}catch(e){this.logErr(e)}})).then((e=>{const{statusCode:i,statusCode:o,headers:r,rawBody:a}=e,n=s.decode(a,this.encoding);t(null,{status:i,statusCode:o,headers:r,rawBody:a,body:n},n)}),(e=>{const{message:i,response:o}=e;t(i,o,o&&s.decode(o.rawBody,this.encoding))}));break}}post(e,t=(()=>{})){const s=e.method?e.method.toLocaleLowerCase():"post";switch(e.body&&e.headers&&!e.headers["Content-Type"]&&!e.headers["content-type"]&&(e.headers["content-type"]="application/x-www-form-urlencoded"),e.headers&&(delete e.headers["Content-Length"],delete e.headers["content-length"]),void 0===e.followRedirect||e.followRedirect||((this.isSurge()||this.isLoon())&&(e["auto-redirect"]=!1),this.isQuanX()&&(e.opts?e.opts.redirection=!1:e.opts={redirection:!1})),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(e.headers=e.headers||{},Object.assign(e.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](e,((e,s,i)=>{!e&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),t(e,s,i)}));break;case"Quantumult X":e.method=s,this.isNeedRewrite&&(e.opts=e.opts||{},Object.assign(e.opts,{hints:!1})),$task.fetch(e).then((e=>{const{statusCode:s,statusCode:i,headers:o,body:r,bodyBytes:a}=e;t(null,{status:s,statusCode:i,headers:o,body:r,bodyBytes:a},r,a)}),(e=>t(e&&e.error||"UndefinedError")));break;case"Node.js":let i=require("iconv-lite");this.initGotEnv(e);const{url:o,...r}=e;this.got[s](o,r).then((e=>{const{statusCode:s,statusCode:o,headers:r,rawBody:a}=e,n=i.decode(a,this.encoding);t(null,{status:s,statusCode:o,headers:r,rawBody:a,body:n},n)}),(e=>{const{message:s,response:o}=e;t(s,o,o&&i.decode(o.rawBody,this.encoding))}));break}}time(e,t=null){const s=t?new Date(t):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(e)&&(e=e.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let t in i)new RegExp("("+t+")").test(e)&&(e=e.replace(RegExp.$1,1==RegExp.$1.length?i[t]:("00"+i[t]).substr((""+i[t]).length)));return e}queryStr(e){let t="";for(const s in e){let i=e[s];null!=i&&""!==i&&("object"==typeof i&&(i=JSON.stringify(i)),t+=`${s}=${i}&`)}return t=t.substring(0,t.length-1),t}msg(t=e,s="",i="",o={}){const r=e=>{const{$open:t,$copy:s,$media:i,$mediaMime:o}=e;switch(typeof e){case void 0:return e;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:e};case"Loon":case"Shadowrocket":return e;case"Quantumult X":return{"open-url":e};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{const r={};let a=e.openUrl||e.url||e["open-url"]||t;a&&Object.assign(r,{action:"open-url",url:a});let n=e["update-pasteboard"]||e.updatePasteboard||s;n&&Object.assign(r,{action:"clipboard",text:n});let h=e.mediaUrl||e["media-url"]||i;if(h){let e,t;if(h.startsWith("http"));else if(h.startsWith("data:")){const[s]=h.split(";"),[,i]=h.split(",");e=i,t=s.replace("data:","")}else{e=h,t=(e=>{const t={JVBERi0:"application/pdf",R0lGODdh:"image/gif",R0lGODlh:"image/gif",iVBORw0KGgo:"image/png","/9j/":"image/jpg"};for(var s in t)if(0===e.indexOf(s))return t[s];return null})(h)}Object.assign(r,{"media-url":h,"media-base64":e,"media-base64-mime":o??t})}return Object.assign(r,{"auto-dismiss":e["auto-dismiss"],sound:e.sound}),r}case"Loon":{const s={};let o=e.openUrl||e.url||e["open-url"]||t;o&&Object.assign(s,{openUrl:o});let r=e.mediaUrl||e["media-url"]||i;return r&&Object.assign(s,{mediaUrl:r}),console.log(JSON.stringify(s)),s}case"Quantumult X":{const o={};let r=e["open-url"]||e.url||e.openUrl||t;r&&Object.assign(o,{"open-url":r});let a=e.mediaUrl||e["media-url"]||i;a&&Object.assign(o,{"media-url":a});let n=e["update-pasteboard"]||e.updatePasteboard||s;return n&&Object.assign(o,{"update-pasteboard":n}),console.log(JSON.stringify(o)),o}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(t,s,i,r(o));break;case"Quantumult X":$notify(t,s,i,r(o));break;case"Node.js":break}if(!this.isMuteLog){let e=["","==============📣系统通知📣=============="];e.push(t),s&&e.push(s),i&&e.push(i),console.log(e.join("\n")),this.logs=this.logs.concat(e)}}debug(...e){this.logLevels[this.logLevel]<=this.logLevels.debug&&(e.length>0&&(this.logs=[...this.logs,...e]),console.log(`${this.logLevelPrefixs.debug}${e.map((e=>e??String(e))).join(this.logSeparator)}`))}info(...e){this.logLevels[this.logLevel]<=this.logLevels.info&&(e.length>0&&(this.logs=[...this.logs,...e]),console.log(`${this.logLevelPrefixs.info}${e.map((e=>e??String(e))).join(this.logSeparator)}`))}warn(...e){this.logLevels[this.logLevel]<=this.logLevels.warn&&(e.length>0&&(this.logs=[...this.logs,...e]),console.log(`${this.logLevelPrefixs.warn}${e.map((e=>e??String(e))).join(this.logSeparator)}`))}error(...e){this.logLevels[this.logLevel]<=this.logLevels.error&&(e.length>0&&(this.logs=[...this.logs,...e]),console.log(`${this.logLevelPrefixs.error}${e.map((e=>e??String(e))).join(this.logSeparator)}`))}log(...e){e.length>0&&(this.logs=[...this.logs,...e]),console.log(e.map((e=>e??String(e))).join(this.logSeparator))}logErr(e,t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,t,e);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,t,void 0!==e.message?e.message:e,e.stack);break}}wait(e){return new Promise((t=>setTimeout(t,e)))}done(e={}){const t=((new Date).getTime()-this.startTime)/1e3;switch(this.log("",`🔔${this.name}, 结束! 🕛 ${t} 秒`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(e);break;case"Node.js":process.exit(1)}}}(e,t)}
