/*
QX
配置说明:  
微信小程序"太平洋车生活" 手签一次获取cookie
[rewrite_local]  
https:\/\/auto\.chediandian\.com\/activity\/tb-sign\/sign-handle url script-request-body https://raw.githubusercontent.com/tutuh/script/master/task/cpic/cpic.js

[task_local]  
#太平洋车生活  
0 8 * * * cpic.js, tag=太平洋车生活, enabled=true  

[MITM]  
hostname= auto.chediandian.com

*/
var tt="[太平洋车生活]";
const $tutuh = tutuh();
const tpyurlname="tpyurlname";
const tpyhdname="tpyhdname";
const tpybdname="tpybdname";
const tpyurl=$tutuh.read(tpyurlname);
const tpyhd=$tutuh.read(tpyhdname);
const tpybd=$tutuh.read(tpybdname);


//++++++++++++++++++++++++++++++++

//3.需要执行的函数都写这里
function main()
{
cpic_sign();
}

//++++++++++++++++++++++++++++++++++++
//4.基础模板
if ($tutuh.isRequest) {
  Getcookie()
  $tutuh.end()
} else {
  main();
  $tutuh.end()
}



function Getcookie() {
  
 var tpyurlval = $request.url;
var tpy_bd=$request.body;
var tpy_hd=$request.headers;
if(tpyurlval.indexOf("activity/tb-sign/")>=0){
 var surl=$tutuh.write(tpyurlval,tpyurlname)
var shd= $tutuh.write(JSON.stringify(tpy_hd),tpyhdname);
var sbd=$tutuh.write(tpy_bd,tpybdname)
if (surl==true&&shd==true&&sbd==true) 
 tutu(tt,"获取Cookie:成功🎉","");}  
}




function cpic_sign(){
  var subt="";
var detail="";
  const URL =
  {url:tpyurl,
  headers:tpyhd,
  body:tpybd,
  }
     $tutuh.post(URL, function(error, response, data) {
      var obj=JSON.parse(data);
      log("测试"+data)
      if(obj.Suc==true){
      subt+="签到成功🎉"
      detail+="获得:"+obj.Money
      }else if(obj.Suc==false){
        subt+=obj.Msg
        detail+=""
      }else{
        subt+="签到失败❌"
        detail+="请重新获取Cookie⁉️"
      }
      log(tt+subt+detail)
      tutu(tt,subt,detail)

})
} 



function tutu(x,y,z){

 $tutuh.notify(x,y,z);}

function tutuh() {
    const isRequest = typeof $request != "undefined"
    const isSurge = typeof $httpClient != "undefined"
    const isQuanX = typeof $task != "undefined"
    log = (message) => console.log(message)
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
        if (isSurge) $httpClient.get(options, callback)
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
    const end = () => {
        if (isQuanX) isRequest ? $done({}) : ""
        if (isSurge) isRequest ? $done({}) : $done()
    }
    return { isRequest, isQuanX, isSurge, notify, write, read, get, log, post, end }
};





