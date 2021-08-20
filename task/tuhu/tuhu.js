/*
配置说明:  
途虎养车签到脚本：
2条重写，app内手签一次获取cookie，下方日常任务领取获得cookie 。获取Cookie后注释重写
Quantumult X:
[rewrite_local]  
https:\/\/api\.tuhu\.cn\/User\/UserCheckInVersion1 url script-request-header https://raw.githubusercontent.com/tutuh/script/master/task/tuhu/tuhu.js

[task_local]  
#途虎养车  
0 8 * * * https://raw.githubusercontent.com/tutuh/script/master/task/tuhu/tuhu.js, tag=途虎养车, enabled=true  
 
[MITM]  
hostname= api.tuhu.cn
*/

var tt = "[途虎养车]";
const $tutuh = tutuh();
const thurlname = "thurlname";
const thhdname = "thhdname";
const thurl = $tutuh.read(thurlname);
const thhd = $tutuh.read(thhdname);
const thrcckhdname = "thrcckhdname";
const thrcckhd = $tutuh.read(thrcckhdname);


!(async () => {
  if ($tutuh.isRequest) {
    Getcookie()
  } else {
await tuhu_sign();
   }
})().finally(() =>  {
$tutuh.done();
})

function Getcookie() {
var rcurlval = $request.url;
var rcck_hd = $request.headers
var tuhuurlval = $request.url;
var th_hd = $request.headers
if (tuhuurlval.indexOf("User/UserCheckInVersion1") >= 0) {
var surl = $tutuh.write(tuhuurlval, thurlname)
var shd = $tutuh.write(JSON.stringify(th_hd), thhdname);
if (surl == true && shd == true)
$tutuh.notify(tt, "签到Cookie:获取成功🎉", "");
}

//签到
async function tuhu_sign() {
	return new Promise(resolve => {
	setTimeout(() => {
	const URL = {url: thurl,
		headers: JSON.parse(thhd),}
$tutuh.get(URL, function(error, response, data) {
	var obj = JSON.parse(data);
	console.log("tuhu" + data)
	if (obj.Code == "0") {
	subt = obj.Message
	detail = ""	
	} else {
	subt = "签到成功🎉"
	detail = "已签到" + obj.NeedDays + "天,获得:" + obj.AddIntegral + "积分"
	}
	tutu(tt,subt,detail)
	console.log(detail)
	resolve()
	})
}, 800)
});
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
			if (typeof options == "string") options = {
				url: options
			}
			options["method"] = "GET"
			$task.fetch(options)
				.then(response => {
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
			if (typeof options == "string") options = {
				url: options
			}
			options["method"] = "POST"
			$task.fetch(options)
				.then(response => {
					response["status"] = response.statusCode
					callback(null, response, response.body)
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
		isQuanX,
		isSurge,
		notify,
		write,
		read,
		get,
		log,
		post,
		done
	}
};
