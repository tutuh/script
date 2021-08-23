/*
打开悦刻app，点开“21天签到”获取cookie，
Quanmutult X：
[rewrite_local]
https:\/\/app\.relxtech\.com\/dianziyan-api\/api\/v3\/community\/check-in url script-request-header https://raw.githubusercontent.com/tutuh/script/master/task/relx/relx.js
[task_local]
#悦刻
0 8 * * * https://raw.githubusercontent.com/tutuh/script/master/task/relx/relx.js, tag=Relx悦刻, enabled=true

Surge:
悦刻cookie = script-path=https://raw.githubusercontent.com/tutuh/script/master/task/relx/relx.js,type=http-request,pattern=https:\/\/app\.relxtech\.com\/dianziyan-api\/api\/v3\/community\/check-in


悦刻 = type=cron,cronexp=0 9 0 * * *,script-path=https://raw.githubusercontent.com/tutuh/script/master/task/relx/relx.js


[mitm]: app.relxtech.com

以上是配置说明
*/

var tt="[RELX ME悦刻]";
const $tutuh = tutuh();
var nickname='';var detail=''; var subtc='';
var signcoin='';var detail1='';
const ckurlname="ckurlname";
const ckhdname="ckhdname";
const ckbdname="ckbdname";
const ckurl=$tutuh.read(ckurlname);
const ckhd=$tutuh.read(ckhdname);
const ckbd=$tutuh.read(ckbdname);

//++++++++++++++++++++++++++++++++

//3.需要执行的函数都写这里

(async () => {
if ($tutuh.isRequest) {
  getck()
} else {
await sign();
await name();
await showmsg();
}
})().finally(() => {
  $tutuh.done();
})


function getck() {
   if ($request.headers) {
   var urlval = $request.url;
   var ck_bd=$request.body;
   var ck_hd=$request.headers
   if(urlval.indexOf("dianziyan-api/api/v3/community/check-in")>=0){
   var shd= $tutuh.write(JSON.stringify(ck_hd),ckhdname);
   if (shd==true) 
   $tutuh.notify(tt,"获取Cookie:成功🎉","");}  
   }
}

function sign() {
return new Promise((resolve) =>{
  const signUrl =
  {url:"https://app.relxtech.com/dianziyan-api/api/v3/community/check-in",
  headers:JSON.parse(ckhd),
}    
     $tutuh.post(signUrl, function(error, response, data) {
    var obj=JSON.parse(data);
//console.log(data)
    if(obj.code==200){
      signcoin="签到成功🌹"+"21天签到活动:已连续签到"+obj.data.continuation_days+"天,获得:"+obj.data.coins+"嗨币!"+"还剩签到"+obj.data.remaining_days+"天"
      }else if(obj.code==500){
      signcoin=obj.msg+",请勿重复签到"   
      } else {
      signcoin="cookies失效...请重新获取...⁉️"
      detail1=obj.msg
}   
      console.log(signcoin+"\n"+detail1)
      resolve()
})
})
}

function name() {
return new Promise((resolve) =>{
  const nickUrl =
  {url:"https://app.relxtech.com/dianziyan-api/api/v1/user-info?access",
  headers:JSON.parse(ckhd),
}
     $tutuh.get(nickUrl, function(error, response, data) {
     var obj=JSON.parse(data);
     //console.log(data)
       if(obj.code==202){
       subt=""
       }else{
       nickname="昵称:"+obj.data.nickName;
       detail="当前共有"+obj.data.integral+"嗨币";}
       console.log(nickname+"\n"+detail)
resolve()
})      
})
}

function showmsg() {
    subt=nickname+"."+detail+subtc;
    desc=signcoin+detail1;
    $tutuh.notify(tt,subt,desc)
    }


function tutuh() {
    const isRequest = typeof $request != "undefined"
    const isSurge = typeof $httpClient != "undefined"
    const isQuanX = typeof $task != "undefined"
    const isLoon = typeof $loon != "undefined"
    const log = (message) => console.log(message)
    const notify = (title, subtitle, message) => {
        if (isQuanX) $notify(title, subtitle, message)
        if (isSurge) $notification.post(title, subtitle, message)
    }
    const write = (value, key) => {
        if (isQuanX) return $prefs.setValueForKey(value, key)
        if (isSurge) return $persistentStore.write(value, key)
    }
    const read = (key) => {
        if (isQuanX) return $prefs.valueForKey(key)
        if (isSurge) return $persistentStore.read(key)
    }
    const get = (options, callback) => {
        if (isQuanX) {
            if (typeof options == "string") options = { url: options }
            options["method"] = "GET"
            $task.fetch(options).then(response => {
                response["status"] = response.statusCode
                callback(null, response, response.body)
            }, reason => callback(reason.error, null, null))
        }
        if (isSurge) $httpClient.get(options, (error, response, body) => {
              callback(error, adapterStatus(response), body)
            })
          }
     const post = (options, callback) => {
        if (isQuanX) {
            if (typeof options == "string") options = { url: options }
            options["method"] = "POST"
            $task.fetch(options).then(response => {
                response["status"] = response.statusCode
                callback(null, response, response.body)
            }, reason => callback(reason.error, null, null))
        }
        if (isSurge) $httpClient.post(options, callback)
    }
  const done = (value = {}) => {
      if (isQuanX) return $done(value)
      if (isSurge) isRequest ? $done(value) : $done()
    }
    return { isRequest, isQuanX, isSurge, notify, write, read, get, log, post, done }
};
