/*
联想智选App签到脚本：
只能签到，连续签到任务需手动加入

联想智选app---我的---签到，获取cookie
获取Cookie后注释：
QuantumultX:
[rewrite_local]
https:\/\/api\.club\.lenovo\.cn\/common\/signin\/add url script-request-body https://raw.githubusercontent.com/tutuh/script/master/task/lenovo/lenovo.js

[task_local]
#联想智选
0 8 * * * https://raw.githubusercontent.com/tutuh/script/master/task/lenovo/lenovo.js, tag=联想智选, enabled=true
[mitm] 
hostname=api.club.lenovo.cn

Surge：
[Script]
联想智选 Cookie = script-path=https://raw.githubusercontent.com/tutuh/script/master/task/lenovo/lenovo.js,requires-body=true,type=http-request,pattern=https:\/\/api\.club\.lenovo\.cn\/common\/signin\/add

联想智选 = type=cron,cronexp=0 9 * * *,script-path=https://raw.githubusercontent.com/tutuh/script/master/task/lenovo/lenovo.js
[mitm] 
hostname=api.club.lenovo.cn

以上是配置说明
*/

//var id=task_id=9;
//加入连续签到任务task_id=7,三天;id=8,七天;id=9,十天;
//+++++++++++++++++++
var tt="联想智选";
const $tutuh = tutuh();
const lxheader="lxheader";
const lxbody="lxbody";
const lxhd=$tutuh.read(lxheader);
const lxbd=$tutuh.read(lxbody);


(async () => {
if ($tutuh.isRequest) {
  lx_getck()
} else {
//await challenge_task();
await lenovo_sign();
}
})().finally(() => {
  $tutuh.end();
})

//cookie获取
function lx_getck() {
 if ($request.headers) {
 var urlval = $request.url;
 var lx_bd=$request.body;
 var lx_hd=$request.headers;
 if(urlval.indexOf("common/signin/add")>-1){
 var sl= $tutuh.write(JSON.stringify(lx_hd),lxheader);
 var sm= $tutuh.write(lx_bd,lxbody);
 if (sl==true&&sm==true) 
 $tutuh.notify(tt,"获取签到Cookie:成功🎉","");}  
}}

//签到
function lenovo_sign() { 
  return new Promise((resolve) =>{
  const URL =
  {url:"https://api.club.lenovo.cn/common/signin/add",
  headers:JSON.parse(lxhd),
  body:lxbd,
  }
  $tutuh.post(URL, function(error, response, data) {
      var obj=JSON.parse(data);
      console.log(data)
      if(obj.status==0 & obj.res.add_yb_succ==true){     
       var subt="签到成功✅";
       var detail="获得:"+obj.res.add_yb_tip+".";
       }else if(obj.status==0 & obj.res.add_yb_succ==false){
       var subt="签到成功✅";
       var detail=obj.res.add_yb_err_reason
       }else if(obj.res.error_code == 20813){
       var subt="今日已签到，请勿重复签到!" ;
       var detail="";
       } else if(obj.res.error_code == 10050){
       var subt="签到失败❎";
       var detail="请重新登入获取Cookie⁉️";
        }
       console.log(subt+detail)
       resolve()
       $tutuh.notify(tt,subt,detail)
})
})   
}
/*
//连签任务
function challenge_task() {
 return new Promise((resolve) =>{
  const URL =
  {url:"https://api.club.lenovo.cn/common/signin/challenge_task/join",
  headers:JSON.parse(lxhd),
  body: JSON.stringify(id),
 }    
   $tutuh.post(URL, function(error, response, data) {
      var obj=JSON.parse(data);
      console.log('连签任务\n'+data)
      if(obj.status==0){
        result="参加连续签到任务:成功🎉" ;       
        }else if(obj.status==1) {
        result="已加入连签任务✅";    
       }else{
        result="";
         }
       console.log(result)
       resolve()
})
})
}
*/

function tutuh() {
  const isRequest = typeof $request != "undefined"
  const isSurge = typeof $httpClient != "undefined"
  const isQuanX = typeof $task != "undefined"
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
  const adapterStatus = (response) => {
    if (response) {
      if (response.status) {
        response["statusCode"] = response.status
      } else if (response.statusCode) {
        response["status"] = response.statusCode
      }
    }
    return response
  }
  const get = (options, callback) => {
    if (isQuanX) {
      if (typeof options == "string") options = {
        url: options
      }
      options["method"] = "GET"
      $task.fetch(options).then(response => {
        callback(null, adapterStatus(response), response.body)
      }, reason => callback(reason.error, null, null))
    }
    if (isSurge) $httpClient.get(options, (error, response, body) => {
      callback(error, adapterStatus(response), body)
    })
  }
  const post = (options, callback) => {
    if (isQuanX) {
      if (typeof options == "string") options = {
        url: options
      }
      options["method"] = "POST"
      $task.fetch(options).then(response => {
        callback(null, adapterStatus(response), response.body)
      }, reason => callback(reason.error, null, null))
    }
    if (isSurge) {
      $httpClient.post(options, (error, response, body) => {
        callback(error, adapterStatus(response), body)
      })
    }
  }
  const done = (value = {}) => {
    if (isQuanX) return $done(value)
    if (isSurge) isRequest ? $done(value) : $done()
  }
  return {
    isRequest,
    notify,
    write,
    read,
    get,
    post,
    done
  }
};
