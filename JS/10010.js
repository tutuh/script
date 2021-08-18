// by blackmatrix7
const getLotteryCookieRegex = /^https?:\/\/m\.client\.10010\.com\/dailylottery\/static\/(integral|doubleball)\/firstpage/;
const unicomCookieKey = "unicom_user_cookie";
const mobileKey = "unicom_mobile";
const encryptMobileKey = "unicom_encrypt_mobile";
const cityCodeKey = "city_code";
const scriptName = "中国联通";

let magicJS = MagicJS(scriptName, "INFO");
magicJS.unifiedPushUrl = magicJS.read("unicom_unified_push_url") || magicJS.read("magicjs_unified_push_url");

// 用户登录
function UserLogin(cookie, encryptMobile) {
  // 联通App签到
  return new Promise((resolve) => {
    if (cookie) {
      let options = {
        url: "http://m.client.10010.com/dailylottery/static/textdl/userLogin?flag=1",
        headers: {
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Encoding": "gzip, deflate",
          "Accept-Language": "zh-cn",
          "Connection": "close",
          "Cookie": cookie,
          "Host": "m.client.10010.com",
          "Upgrade-Insecure-Requests": "1",
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:iphone_c@6.0201}{systemVersion:dis}",
        },
      };
      magicJS.get(options, (err, resp, data) => {
        if (err) {
          magicJS.logInfo("用户登录失败，http请求异常：" + err);
          resolve([false, "用户登录失败"]);
        } else {
          if (data.indexOf(encryptMobile) >= 0) {
            magicJS.logInfo("用户登录成功");
            resolve([true, "用户登录成功"]);
          } else if (data.indexOf("请稍后重试") >= 0) {
            magicJS.logInfo("用户登录失败");
            resolve([false, "用户登录失败"]);
          } else {
            magicJS.logInfo("用户登录失败，接口响应不合法：" + data);
            resolve([false, "用户登录失败"]);
          }
        }
      });
    } else {
      resolve([false, "请先获取token再登录"]);
      magicJS.logInfo("请先获取cookie再刷新token");
    }
  });
}

// 联通App签到
function AppSignin(cookie) {
  return new Promise((resolve, reject) => {
    let options = {
      url: "https://act.10010.com/SigninApp/signin/daySign?vesion=0.5630763707346611",
      headers: {
        "Accept": "application/json, text/plain, */*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-cn",
        "Connection": "keep-alive",
        "Cookie": cookie,
        "Host": "act.10010.com",
        "Origin": "https://img.client.10010.com",
        "Referer": "https://img.client.10010.com/SigininApp/index.html",
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:iphone_c@7.0402}{systemVersion:dis}{yw_code:}",
        "savedata": "false",
      },
      body: "",
    };
    magicJS.post(options, (err, resp, data) => {
      if (err) {
        magicJS.logError("签到失败，http请求异常：" + err);
        magicJS.notify(scriptName, "", "❌签到失败，http请求异常！！");
        reject("签到失败");
      } else {
        let obj = {};
        try {
          obj = JSON.parse(data);
          if (obj["status"] === "0000") {
            magicJS.logInfo("签到成功");
            resolve([true, "签到成功", obj.data.prizeCount, obj.data.growValue, obj.data.flowerCount]);
          } else if (obj["status"] == "0001") {
            magicJS.logWarning("尚未登录");
            resolve([false, "尚未登录", null, null, null]);
          } else if (obj["status"] == "0002") {
            magicJS.logWarning("重复签到");
            resolve([true, "重复签到", null, null, null]);
          } else {
            magicJS.logWarning("签到异常，接口返回数据不合法。" + data);
            reject("签到异常");
          }
        } catch (err) {
          magicJS.logError("签到异常，代码执行错误：" + err);
          reject("执行错误");
        }
      }
    });
  });
}

// 签到积分翻倍
function DoubleAdPlaying(cookie, mobile) {
  let options = {
    url: "https://act.10010.com/SigninApp/signin/bannerAdPlayingLogo",
    headers: {
      "Accept": "application/json, text/plain, */*",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "zh-cn",
      "Connection": "keep-alive",
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": cookie,
      "Host": "act.10010.com",
      "Origin": "https://img.client.10010.com",
      "Referer": `https://img.client.10010.com/SigininApp/index.html?version=iphone_c@8.0200&desmobile=${mobile}`,
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:iphone_c@8.0200}{systemVersion:dis}{yw_code:}"
    },
    body: { orderId: "24F051D47389A008A1161E17F92438EC", imei: "455baba549deb814f6c75395fbe2403f855aa6dbedb50bc2acbff0ef4aab96f9" },
  };
  return new Promise((resolve, reject) => {
    magicJS.post(options, (err, resp, data) => {
      if (err) {
        magicJS.logError("签到失败，http请求异常：" + err);
        reject("积分翻倍失败");
      } else {
        let obj = {};
        try {
          magicJS.logDebug(`积分翻倍，接口响应：${data}`);
          obj = JSON.parse(data);
          if (obj["status"] === "0000" && obj.data.returnStr.indexOf("失败") >= 0) {
            magicJS.logWarning(`积分翻倍失败：${obj.data.returnStr}`);
            reject("积分翻倍失败");
          } else if (obj["status"] === "0000") {
            magicJS.logInfo("积分翻倍成功");
            resolve(obj.data.prizeCount);
          } else if (obj["status"] === "0010") {
            magicJS.logWarning("积分重复翻倍");
            resolve(0);
          } else {
            magicJS.logWarning(`积分翻倍失败，接口返回数据不合法：\n${data}`);
            reject("积分翻倍失败");
          }
        } catch (err) {
          magicJS.logError("积分翻倍失败" + err);
          reject("积分翻倍失败");
        }
      }
    });
  });
}

// 获取连续签到天数
function GetContinueCount(cookie) {
  return new Promise((resolve, reject) => {
    let options = {
      url: "https://act.10010.com/SigninApp/signin/getContinuCount?vesion=0.35425159102265746",
      headers: {
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-cn",
        "Connection": "keep-alive",
        "Cookie": cookie,
        "Host": "act.10010.com",
        "Origin": "https://act.10010.com",
        "Referer": "https://act.10010.com/SigninApp/signin/querySigninActivity.htm?version=iphone_c@6.0201",
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
        "X-Requested-With": "XMLHttpRequest",
        "savedata": "false",
      },
      body: "",
    };
    magicJS.post(options, (err, resp, data) => {
      if (err) {
        ``;
        magicJS.logError("获取连续签到次数失败，http请求异常：" + err);
        reject("?");
      } else {
        if (data) {
          let number = "?";
          if (/^\d+$/.test(data)) {
            number = data;
          } else {
            magicJS.logWarning("获取连续签到次数失败，接口响应不合法。" + data);
          }
          resolve(number);
        } else {
          magicJS.logWarning("获取连续签到次数异常，没有获取到响应体。");
          reject("?");
        }
      }
    });
  });
}

// 获取用户信息
function GetUserInfo(cookie, mobile) {
  let options = {
    url: `https://m.client.10010.com/mobileService/home/queryUserInfoSeven.htm?version=iphone_c@7.0402&desmobiel=${mobile}&showType=3`,
    headers: {
      "Accept": "*/*",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "zh-cn",
      "Connection": "close",
      "Cookie": cookie,
      "Host": "m.client.10010.com",
      "User-Agent": "ChinaUnicom4.x/240 CFNetwork/1121.2.2 Darwin/19.3.0",
    },
  };
  return new Promise((resolve, reject) => {
    magicJS.get(options, (err, resp, data) => {
      if (err) {
        magicJS.logError("获取用户信息失败，http请求异常：" + err);
        reject({});
      } else {
        let result = {};
        try {
          let obj = JSON.parse(data);
          if (obj.hasOwnProperty("data") && obj["data"].hasOwnProperty("dataList")) {
            obj["data"]["dataList"].forEach((element) => {
              if ("flow,fee,voice,point".indexOf(element["type"]) >= 0) {
                if (element["number"] != "-") {
                  result[element["type"]] = `${element["remainTitle"]}${element["number"]}${element["unit"]}`;
                } else {
                  magicJS.logWarning("获取用户信息异常：" + data);
                  reject("获取用户信息异常");
                }
              }
            });
            magicJS.logInfo("获取用户信息：" + JSON.stringify(result));
            resolve(result);
          } else {
            magicJS.logWarning("获取用户信息异常，接口响应不合法：" + data);
            reject("获取用户信息接口响应异常");
          }
        } catch (err) {
          magicJS.logError(`获取用户信息失败，代码执行异常：${err}，接口返回：${data}`);
          reject("获取用户信息执行异常");
        }
      }
    });
  });
}

// 美团外卖优惠券
function GetMeituanCoupon(cookie) {
  let options = {
    url: "https://m.client.10010.com/welfare-mall-front/mobile/api/bj2402/v1?reqdata=%7B%22saleTypes%22%3A%22TY%22%2C%22amount%22%3A0%2C%22goodsId%22%3A%228a29ac8a72be05a70172c067722600b8%22%2C%22sourceChannel%22%3A%22955000300%22%2C%22payWay%22%3A%22%22%2C%22imei%22%3A%22%22%2C%22proFlag%22%3A%22%22%2C%22points%22%3A0%2C%22scene%22%3A%22%22%2C%22promoterCode%22%3A%22%22%7D",
    headers: {
      "Accept": "application/json, text/plain, */*",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "zh-cn",
      "Connection": "keep-alive",
      "Cookie": cookie,
      "Host": "m.client.10010.com",
      "Origin": "https://img.client.10010.com",
      "Referer": "https://img.client.10010.com/jifenshangcheng/meituan?whetherFriday=YES&from=955000006&from=955000006&idx=1&idx=1",
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:iphone_c@7.0402}{systemVersion:dis}{yw_code:}"
    },
  };
  return new Promise((resolve, reject) => {
    magicJS.get(options, (err, resp, data) => {
      if (err) {
        magicJS.logError("领取美团外卖优惠券异常，http请求异常：" + err);
        reject("美团外卖优惠券:请求异常");
      } else {
        let obj = {};
        try {
          magicJS.logDebug(`领取美团外卖优惠券，接口返回：\n${data}`);
          obj = JSON.parse(data);
          if (obj.hasOwnProperty("code")) {
            if (obj["code"] == "0" && obj["msg"] == "下单成功") {
              magicJS.logInfo("领取美团外卖优惠券，领取成功");
              resolve("美团外卖优惠券：领取成功");
            } else if (obj["code"] == "1") {
              magicJS.logWarning("领取美团外卖优惠券，达到领取上限");
              resolve("美团外卖优惠券：达到领取上限");
            } else if (obj["code"] == "200" && obj["msg"].indexOf("太火爆") >= 0) {
              magicJS.logWarning("领取美团外卖优惠券，活动太火爆");
              resolve("美团外卖优惠券：活动太火爆领取失败");
            } else if (obj["code"] == "200" && obj["msg"].indexOf("开小差") >= 0) {
              magicJS.logWarning("领取美团外卖优惠券，账号可能已黑");
              resolve("美团外卖优惠券：系统开小差，账号可能已黑");
            } else {
              magicJS.logWarning("领取美团外卖优惠券，接口响应不合法：" + data);
              reject("接口响应不合法");
            }
          } else {
            magicJS.logWarning("领取美团外卖优惠券，接口响应不合法：" + data);
            reject("美团外卖优惠券：接口响应不合法");
          }
        } catch (err) {
          magicJS.logError("领取美团外卖优惠券，代码执行异常：" + err);
          reject("美团外卖优惠券：代码执行异常");
        }
      }
    });
  });
}

// ---------------- 签到任务，领取1G日流量包 ----------------

// 获取签到任务列表
function GetSigninTasks(cookie, mobile) {
  let options = {
    url: "https://act.10010.com/SigninApp/doTask/getTaskInfo",
    headers: {
      "Accept": "application/json, text/plain, */*",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "zh-cn",
      "Connection": "keep-alive",
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": cookie,
      "Host": "act.10010.com",
      "Origin": "https://img.client.10010.com",
      "Referer":  `https://img.client.10010.com/SigininApp/index.html?version=iphone_c@8.0200&desmobile=${mobile}`,
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:iphone_c@8.0200}{systemVersion:dis}{yw_code:}"
    },
    body: "",
  };
  return new Promise((resolve, reject) => {
    magicJS.post(options, (err, resp, data) => {
      if (err) {
        magicJS.logError("获取签到任务列表失败，http请求异常：" + err);
        reject();
      } else {
        magicJS.logDebug("获取签到任务列表，接口响应数据：" + data);
        let obj = JSON.parse(data);
        if (obj.status === "0000") {
          magicJS.logInfo("获取签到任务成功");
          resolve();
        } else if (obj.status === "9999") {
          magicJS.logError(obj.msg);
          reject(obj.msg);
        } else {
          magicJS.logWarning(`获取签到任务失败，接口响应不合法：\n${data}`);
          reject("接口响应不合法");
        }
      }
    });
  }).catch((err) => {
    magicJS.logError(err);
  });
}

// 完成观看视频任务
function FinishVideo(cookie, mobile) {
  let options = {
    url: "https://act.10010.com/SigninApp/doTask/finishVideo",
    headers: {
      "Accept": "application/json, text/plain, */*",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "zh-cn",
      "Connection": "keep-alive",
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": cookie,
      "Host": "act.10010.com",
      "Origin": "https://img.client.10010.com",
      "Referer":  `https://img.client.10010.com/SigininApp/index.html?version=iphone_c@8.0200&desmobile=${mobile}`,
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:iphone_c@8.0200}{systemVersion:dis}{yw_code:}"
    },
    body: { orderId: "3E28C3BFBEB825F5FCD2F01DF9DB5141", imei: "5d58683de1d5d3b383a2e228cff935028a2399195f343cfe122eab1ddf90ee17" }
  };
  return new Promise((resolve, reject) => {
    magicJS.post(options, (err, resp, data) => {
      if (err) {
        magicJS.logError("完成观看视频任务失败，http请求异常：" + err);
        reject();
      } else {
        magicJS.logDebug("观看视频任务，接口响应数据：" + data);
        let obj = JSON.parse(data);
        if (obj.status === "0000") {
          resolve();
        }
        if (obj.status === "9999") {
          magicJS.logWarning(`观看视频任务失败，异常信息：\n${obj.msg}`);
          reject(obj.msg);
        } else {
          magicJS.logWarning(`观看视频任务失败，接口响应不合法：\n${data}`);
          reject("接口响应不合法");
        }
      }
    });
  });
}

// 领取奖励
function GetSigninTaskPirze(cookie, mobile) {
  let options = {
    url: "https://act.10010.com/SigninApp/doTask/getPrize",
    headers: {
      "Accept": "application/json, text/plain, */*",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "zh-cn",
      "Connection": "keep-alive",
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": cookie,
      "Host": "act.10010.com",
      "Origin": "https://img.client.10010.com",
      "Referer":  `https://img.client.10010.com/SigininApp/index.html?version=iphone_c@8.0200&desmobile=${mobile}`,
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:iphone_c@8.0200}{systemVersion:dis}{yw_code:}"
    },
    body: "",
  };
  return new Promise((resolve, reject) => {
    magicJS.post(options, (err, resp, data) => {
      if (err) {
        magicJS.logError("领取签到任务奖励失败，http请求异常：" + err);
        reject();
      } else {
        magicJS.logDebug("领取签到任务奖励，接口响应数据：\n" + data);
        let obj = JSON.parse(data);
        if (obj.status === "0000" && obj.data.returnStr.indexOf("网络拥堵") < 0) {
          resolve(obj.data.returnStr);
        } else if (obj.status === "0000" && obj.data.returnStr.indexOf("网络拥堵") >= 0) {
          magicJS.logDebug(`领取签到任务奖励失败，网络拥堵：\n${data}`);
          reject("网络拥堵");
        } else {
          magicJS.logWarning(`领取签到任务奖励失败，接口响应不合法：\n${data}`);
          reject("接口响应不合法");
        }
      }
    });
  });
}

// ---------------- 旧版抽奖废弃 ----------------

// 获取抽奖次数
function GetLotteryCountDisable(cookie, encryptMobile) {
  let options = {
    url: "http://m.client.10010.com/dailylottery/static/active/findActivityInfojifen?areaCode=031&groupByType=&mobile=",
    headers: {
      "Accept": "*/*",
      "Accept-Encoding": "gzip, deflate",
      "Accept-Language": "zh-cn",
      "Connection": "close",
      "Cookie": cookie,
      "Host": "m.client.10010.com",
      "Origin": "https://m.client.10010.com",
      "Referer": `http://m.client.10010.com/dailylottery/static/integral/firstpage?encryptmobile=${encryptMobile}`,
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
      "X-Requested-With": "XMLHttpRequest",
      "savedata": "false",
    },
    body: "",
  };
  return new Promise((resolve) => {
    magicJS.get(options, (err, resp, data) => {
      if (err) {
        magicJS.logError("获取抽奖次数失败，http请求异常：" + err);
        resolve(0);
      } else {
        try {
          let obj = JSON.parse(data);
          if (obj.hasOwnProperty("acFrequency")) {
            let lotteryCount = Number(obj["acFrequency"]["totalAcFreq"]);
            magicJS.logInfo("获取抽奖次数：" + lotteryCount);
            resolve(lotteryCount);
          } else {
            magicJS.logWarning("获取抽奖次数异常，接口响应不合法：" + data);
            resolve(0);
          }
        } catch (err) {
          magicJS.logError(`获取抽奖次数异常，代码执行异常：${err}，接口响应：${data}`);
          resolve(0);
        }
      }
    });
  });
}

// 新版获取抽奖次数
function GetLotteryCountNewVersionDisable(cookie, encryptMobile, cityCode) {
  let options = {
    url: `http://m.client.10010.com/dailylottery/static/active/findActivityInfo?areaCode=${cityCode}&groupByType=&mobile=${encryptMobile}`,
    headers: {
      "Accept": "*/*",
      "Accept-Encoding": "gzip, deflate",
      "Accept-Language": "zh-cn",
      "Connection": "close",
      "Cookie": cookie,
      "Host": "m.client.10010.com",
      "Origin": "https://m.client.10010.com",
      "Referer": "http://m.client.10010.com/dailylottery/static/integral/firstpage?encryptmobile=",
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
      "X-Requested-With": "XMLHttpRequest",
      "savedata": "false",
    },
    body: "",
  };
  return new Promise((resolve) => {
    magicJS.get(options, (err, resp, data) => {
      if (err) {
        magicJS.logError("获取新版抽奖次数失败，http请求异常：" + err);
        resolve(0);
      } else {
        let obj = JSON.parse(data);
        if (obj.hasOwnProperty("acFrequency")) {
          let lotteryCount = Number(obj["acFrequency"]["totalAcFreq"]);
          magicJS.logInfo("获取新版抽奖次数：" + lotteryCount);
          resolve(lotteryCount);
        } else {
          magicJS.logWarning("获取新版抽奖次数异常，接口响应不合法：" + data);
          resolve(0);
        }
      }
    });
  });
}

// 单次免费抽奖
function DailyLotteryDisable(cookie, encryptMobile) {
  let options = {
    url: `http://m.client.10010.com/dailylottery/static/integral/choujiang?usernumberofjsp=${encryptMobile}`,
    headers: {
      "Accept": "application/json, text/javascript, */*; q=0.01",
      "Accept-Encoding": "gzip, deflate",
      "Accept-Language": "zh-cn",
      "Connection": "close",
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
      "Cookie": cookie,
      "Host": "m.client.10010.com",
      "Origin": "https://m.client.10010.com",
      "Referer": `http://m.client.10010.com/dailylottery/static/integral/firstpage?encryptmobile=${encryptMobile}`,
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
      "X-Requested-With": "XMLHttpRequest",
      "savedata": "false",
    },
    body: "",
  };
  return new Promise((resolve) => {
    magicJS.post(options, (err, resp, data) => {
      if (err) {
        magicJS.logError("每日免费抽奖，http请求异常：" + err);
        resolve("请求异常");
      } else {
        magicJS.logDebug("每日免费抽奖，接口响应数据：" + data);
        let obj = JSON.parse(data);
        if (obj.hasOwnProperty("Rsptype") && obj["Rsptype"] == "6666") {
          resolve("次数不足");
        } else if (obj.hasOwnProperty("Rsptype") && obj["Rsptype"] == "3333") {
          resolve("请求无效");
        } else if (obj.hasOwnProperty("RspMsg")) {
          resolve(obj["RspMsg"]);
        } else {
          magicJS.logWarning("每日免费抽奖，接口响应不合法：" + data);
          resolve("接口响应不合法");
        }
      }
    });
  });
}

// 新版单次免费抽奖
function DailyLotteryNewVersionDisable(cookie, encryptMobile) {
  let options = {
    url: `https://m.client.10010.com/dailylottery/static/doubleball/choujiang?usernumberofjsp=${encryptMobile}`,
    headers: {
      "Accept": "application/json, text/javascript, */*; q=0.01",
      "Accept-Encoding": "gzip, deflate",
      "Accept-Language": "zh-cn",
      "Connection": "close",
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
      "Cookie": cookie,
      "Host": "m.client.10010.com",
      "Origin": "https://m.client.10010.com",
      "Referer": `http://m.client.10010.com/dailylottery/static/integral/firstpage?encryptmobile=${encryptMobile}`,
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
      "X-Requested-With": "XMLHttpRequest",
      "savedata": "false",
    },
    body: "",
  };
  return new Promise((resolve) => {
    magicJS.post(options, (err, resp, data) => {
      if (err) {
        magicJS.logError("新版每日免费抽奖，http请求异常：" + err);
        resolve("请求异常");
      } else {
        magicJS.logDebug("新版每日免费抽奖，接口响应数据：" + data);
        let obj = JSON.parse(data);
        if (obj.hasOwnProperty("Rsptype") && obj["Rsptype"] == "6666") {
          resolve("次数不足");
        } else if (obj.hasOwnProperty("Rsptype") && obj["Rsptype"] == "3333") {
          resolve("请求无效");
        } else if (obj.hasOwnProperty("RspMsg")) {
          resolve(obj["RspMsg"]);
        } else {
          magicJS.logWarning("新版每日免费抽奖，接口响应不合法：" + data);
          resolve("接口响应不合法");
        }
      }
    });
  });
}

// 批量免费抽奖
async function StartDailyLottery(cookie, encryptMobile) {
  let lotteryCount = await GetLotteryCount(cookie, encryptMobile);
  let lotteryList = "";
  if (lotteryCount > 0) {
    for (let i = 0; i < lotteryCount; i++) {
      // 开始抽奖
      magicJS.logInfo(`第${i + 1}次免费抽奖开始`);
      if (lotteryList) {
        lotteryList += "\n";
      }
      lotteryList += `第${i + 1}次抽奖：${await DailyLottery(cookie, encryptMobile)}`;
    }
  }
  return [lotteryCount, lotteryList];
}

// 批量新版免费抽奖
async function StartDailyLotteryNewVersionDisable(cookie, encryptMobile, cityCode, lotteryCount) {
  let lotteryNewVersionCount = await GetLotteryCountNewVersion(cookie, encryptMobile, cityCode);
  let lotteryNewVersionList = "";
  if (lotteryNewVersionCount > 0) {
    for (let i = 0; i < lotteryNewVersionCount; i++) {
      // 开始抽奖
      magicJS.logInfo(`新版第${i + 1}次免费抽奖开始`);
      if (lotteryNewVersionList) {
        lotteryNewVersionList += "\n";
      }
      lotteryNewVersionList += `第${lotteryCount + i + 1}次抽奖：${await DailyLotteryNewVersion(cookie, encryptMobile)}`;
    }
  }
  return [lotteryNewVersionCount, lotteryNewVersionList];
}

// ---------------- 2021.07.09 新版抽奖 ----------------

// 获取抽奖次数
function GetLotteryCountNewVersion(cookie, areaCode, encryptMobile) {
  let options = {
    url: `https://m.client.10010.com/dailylottery/static/active/findActivityInfo?areaCode=${areaCode}&groupByType=&mobile=${encryptMobile}`,
    headers: {
      "Accept": "application/json, text/javascript, */*; q=0.01",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "zh-cn",
      "Connection": "keep-alive",
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
      "Cookie": cookie,
      "Host": "m.client.10010.com",
      "Origin": "https://m.client.10010.com",
      "Referer": `https://m.client.10010.com/dailylottery/static/doubleball/firstpage?encryptmobile=${encryptMobile}`,
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:iphone_c@8.0601}{systemVersion:dis}{yw_code:}",
      "X-Requested-With": "XMLHttpRequest"
    },
    body: "",
  };
  return new Promise((resolve) => {
    magicJS.get(options, (err, resp, data) => {
      if (err) {
        magicJS.logError("获取抽奖次数失败，http请求异常：" + err);
        resolve(0);
      } else {
        try {
          let obj = JSON.parse(data);
          if (obj.hasOwnProperty("acFrequency")) {
            let lotteryCount = Number(obj["acFrequency"]["totalAcFreq"]);
            magicJS.logInfo("获取抽奖次数：" + lotteryCount);
            resolve(lotteryCount);
          } else {
            magicJS.logWarning("获取抽奖次数异常，接口响应不合法：" + data);
            resolve(0);
          }
        } catch (err) {
          magicJS.logError(`获取抽奖次数异常，代码执行异常：${err}，接口响应：${data}`);
          resolve(0);
        }
      }
    });
  });
}

// 新版单次免费抽奖
function DailyLotteryNewVersion(cookie, encryptMobile) {
  let options = {
    url: `https://m.client.10010.com/dailylottery/static/doubleball/choujiang?usernumberofjsp=${encryptMobile}`,
    headers: {
      "Accept": "application/json, text/javascript, */*; q=0.01",
      "Accept-Encoding": "gzip, deflate",
      "Accept-Language": "zh-cn",
      "Connection": "close",
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
      "Cookie": cookie,
      "Host": "m.client.10010.com",
      "Origin": "https://m.client.10010.com",
      "Referer": `http://m.client.10010.com/dailylottery/static/integral/firstpage?encryptmobile=${encryptMobile}`,
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
      "X-Requested-With": "XMLHttpRequest",
      "savedata": "false",
    },
    body: "",
  };
  return new Promise((resolve) => {
    magicJS.post(options, (err, resp, data) => {
      if (err) {
        magicJS.logError("新版每日免费抽奖，http请求异常：" + err);
        resolve("请求异常");
      } else {
        magicJS.logDebug("新版每日免费抽奖，接口响应数据：" + data);
        let obj = JSON.parse(data);
        if (obj.hasOwnProperty("Rsptype") && obj["Rsptype"] == "6666") {
          resolve("次数不足");
        } else if (obj.hasOwnProperty("Rsptype") && obj["Rsptype"] == "3333") {
          resolve("请求无效");
        } else if (obj.hasOwnProperty("RspMsg")) {
          resolve(obj["RspMsg"]);
        } else {
          magicJS.logWarning("新版每日免费抽奖，接口响应不合法：" + data);
          resolve("接口响应不合法");
        }
      }
    });
  });
}

// 批量新版免费抽奖
async function StartDailyLotteryNewVersion(cookie, encryptMobile, cityCode, lotteryCount) {
  let lotteryNewVersionCount = await GetLotteryCountNewVersion(cookie, cityCode, encryptMobile);
  let lotteryNewVersionList = "";
  if (lotteryNewVersionCount > 0) {
    for (let i = 0; i < lotteryNewVersionCount; i++) {
      // 开始抽奖
      magicJS.logInfo(`新版第${i + 1}次免费抽奖开始`);
      if (lotteryNewVersionList) {
        lotteryNewVersionList += "\n";
      }
      lotteryNewVersionList += `第${lotteryCount + i + 1}次抽奖：${await DailyLotteryNewVersion(cookie, encryptMobile)}`;
    }
  }
  return [lotteryNewVersionCount, lotteryNewVersionList];
}

(async () => {
  if (magicJS.isRequest) {
    // 从天天抽奖中获取Cookie等四件套信息
    if (getLotteryCookieRegex.test(magicJS.request.url)) {
      try {
        // 获取cookie
        let cookie = magicJS.request.headers["Cookie"];
        let hisCookie = magicJS.read(unicomCookieKey);
        // 多种方法获取手机号
        let mobile01 = /c_mobile=(\d{11})/.exec(cookie);
        let mobile02 = /mobileServiceAll=(\d{11})/.exec(cookie);
        let mobile03 = /u_account=(\d{11})/.exec(cookie);
        let mobile04 = /desmobile==(\d{11})/.exec(magicJS.request.headers["Referer"]);
        let mobile = "";
        if (!!mobile01) {
          mobile = mobile01[1];
        } else if (!!mobile02) {
          mobile = mobile02[1];
        } else if (!!mobile03) {
          mobile = mobile03[1];
        } else {
          mobile = mobile04[1];
        }
        let hisMobile = magicJS.read(mobileKey);
        // 获取加密手机号
        let encryptMobile = /encryptmobile=([a-zA-Z0-9]*)/.exec(magicJS.request.url)[1];
        let hisEncryptMobile = magicJS.read(encryptMobileKey);
        let cityCode = /city=(\d*)/.exec(magicJS.request.headers["Cookie"])[1];
        // 获取城市代码
        let hisCityCode = magicJS.read(cityCodeKey);
        let notifyContent = "";
        magicJS.logInfo(`新的cookie：${cookie}\n\n旧的cookie：${hisCookie}`);
        magicJS.logInfo(`新的手机号：${mobile}\n旧的手机号：${hisMobile}`);
        magicJS.logInfo(`新的手机号密文：${encryptMobile}\n旧的手机号密文：${hisEncryptMobile}`);
        magicJS.logInfo(`新的城市代码：${cityCode}\n旧的城市代码：${hisCityCode}`);
        // cookie
        if (cookie != hisCookie) {
          magicJS.write(unicomCookieKey, cookie);
          if (!hisCookie) {
            magicJS.logInfo("首次获取联通cookie成功：" + cookie);
            notifyContent += "🍩联通cookie:获取成功";
          } else {
            magicJS.logInfo("更新联通cookie成功：" + cookie);
            notifyContent += "🍩联通cookie:更新成功";
          }
        } else {
          magicJS.logInfo("联通cookie没有变化，无需更新");
          notifyContent += "🍩联通cookie:没有变化";
        }
        // 手机号
        if (mobile != hisMobile) {
          magicJS.write(mobileKey, mobile);
          if (!hisMobile) {
            notifyContent += " 📱手机号:获取成功";
          } else {
            notifyContent += " 📱手机号:更新成功";
          }
        } else {
          magicJS.logInfo("手机号码没有变化，无需更新");
          notifyContent += " 📱手机号:没有变化";
        }
        // 手机号密文
        if (hisEncryptMobile != encryptMobile) {
          magicJS.write(encryptMobileKey, encryptMobile);
          if (!hisEncryptMobile) {
            notifyContent += "\n🗳手机号密文:获取成功";
          } else {
            notifyContent += "\n🗳手机号密文:更新成功";
          }
        } else {
          magicJS.logInfo("手机号码密文没有变化，无需更新");
          notifyContent += "\n🗳手机号密文:没有变化";
        }
        if (cityCode != hisCityCode) {
          magicJS.write(cityCodeKey, cityCode);
          if (!hisCityCode) {
            magicJS.logInfo("首次获取联通城市代码成功：" + cityCode);
            notifyContent += " 🌃城市:获取成功";
          } else {
            magicJS.logInfo("更新联通城市代码成功：" + cityCode);
            notifyContent += " 🌃城市:更新成功";
          }
        } else {
          magicJS.logInfo("城市代码没有变化，无需更新");
          notifyContent += " 🌃城市:没有变化";
        }
        magicJS.notify(scriptName, "", notifyContent);
      } catch (err) {
        magicJS.logError(`获取联通手机营业厅Cookie出现异常，异常信息：${err}`);
      }
    }
  } else {
    magicJS.logInfo("签到与抽奖开始执行！");
    let cookie = magicJS.read(unicomCookieKey);
    let mobile = magicJS.read(mobileKey);
    let encryptMobile = magicJS.read(encryptMobileKey);
    let cityCode = magicJS.read(cityCodeKey);
    if (!!!cookie) {
      magicJS.logError("没有获取到联通手机营业厅Cookie，请在App中搜索天天抽奖获取。");
      magicJS.notify("❌没有获取到Cookie\n请在手机营业厅中搜索“天天抽奖”获取");
    } else if (cookie.hasOwnProperty("default") || cookie.indexOf("default") >= 0) {
      magicJS.notify("❌新版签到需要重新获取Cookie\n请在App中搜索“天天抽奖”获取");
      magicJS.read(unicomCookieKey, "");
      magicJS.read(mobileKey, "");
      magicJS.read(encryptMobileKey, "");
      magicJS.read(cityCodeKey, "");
    } else {
      // 生成签到结果的通知
      let notifyTitle = scriptName;
      let notifySubTtile = "";
      let notifyContent = "";

      // 用户登录
      let [errUserLogin, [loginResult, loginStr] = [false, "用户登录失败"]] = await magicJS.attempt(magicJS.retry(UserLogin, 5, 1000)(cookie, encryptMobile));
      if (errUserLogin || loginResult === false) {
        notifySubTtile = "❌用户登录出现异常，请查阅日志！";
      } else {
        // 用户签到，如失败重试10次
        let AppSigninPromise = magicJS.retry(AppSignin, 10, 100)(cookie);
        let [, [signinResult, siginiResultStr, prizeCount, growthV, flowerCount] = [false, "签到异常", null, null, null]] = await magicJS.attempt(AppSigninPromise);
        if (signinResult === true) {
          // let [, doublePrizeCount] = await magicJS.attempt(magicJS.retry(DoubleAdPlaying, 5, 200)(cookie, mobile));
          notifySubTtile = siginiResultStr;
          let doublePrizeCount = null;
          if (doublePrizeCount) prizeCount += doublePrizeCount;
          if (prizeCount) notifyContent += `积分+${prizeCount} `;
          if (growthV) notifyContent += `成长值+${growthV} `;
          if (flowerCount) notifyContent += `鲜花+${flowerCount} `;
        }

        // 查询连续签到天数
        let genContinueCountPromise = magicJS.retry(GetContinueCount, 10, 100)(cookie);
        let [, contineCount] = await magicJS.attempt(genContinueCountPromise);
        if (contineCount) {
          notifySubTtile += ` 连续签到${contineCount}天`;
        }

        // 查询用户信息
        let getUserInfoPromise = magicJS.retry(GetUserInfo, 10, 100)(cookie, mobile);
        let [, userInfo] = await magicJS.attempt(getUserInfoPromise);
        if (userInfo && userInfo.hasOwnProperty("flow") && userInfo.hasOwnProperty("fee")) {
          let userInfoStr = `${userInfo["flow"]} ${userInfo["fee"]}\n${userInfo["voice"]} ${userInfo["point"]}`;
          notifyContent += notifyContent ? `\n${userInfoStr}` : userInfoStr;
        }

        // 领取美团外卖优惠券
        let getMeituanCouponPromise = magicJS.retry(GetMeituanCoupon, 3, 100)(cookie);
        let [, meituanResult = null] = await magicJS.attempt(getMeituanCouponPromise);
        if (meituanResult) {
          notifyContent += notifyContent ? `\n${meituanResult}` : meituanResult;
        }

        // 抽奖
        let lotteryCount = 0; // 总计抽奖次数
        let [errLottery, [lotteryNewVersionCount, lotteryResult] = []] = await magicJS.attempt(StartDailyLotteryNewVersion(cookie, encryptMobile, cityCode, lotteryCount));
        if (errLottery) magicJS.logError("抽奖出现异常：" + errLottery);
        if (lotteryResult) {
          notifyContent += notifyContent ? `\n${lotteryResult}` : lotteryResult;
        }
      }

      // 通知与结束脚本
      magicJS.logInfo("签到与抽奖执行完毕！");
      magicJS.notify(notifyTitle, notifySubTtile, notifyContent);
      magicJS.done();
    }
  }
  magicJS.done();
})();

function MagicJS(scriptName = "MagicJS", logLevel = "INFO") {
  return new (class {
    constructor() {
      this.version = "2.2.3.2";
      this.scriptName = scriptName;
      this.logLevels = { DEBUG: 5, INFO: 4, NOTIFY: 3, WARNING: 2, ERROR: 1, CRITICAL: 0, NONE: -1 };
      this.isLoon = typeof $loon !== "undefined";
      this.isQuanX = typeof $task !== "undefined";
      this.isJSBox = typeof $drive !== "undefined";
      this.isNode = typeof module !== "undefined" && !this.isJSBox;
      this.isSurge = typeof $httpClient !== "undefined" && !this.isLoon;
      this.node = { request: undefined, fs: undefined, data: {} };
      this.iOSUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.5 Mobile/15E148 Safari/604.1";
      this.pcUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36 Edg/84.0.522.59";
      this.logLevel = logLevel;
      this._barkUrl = "";
      if (this.isNode) {
        this.node.fs = require("fs");
        this.node.request = require("request");
        try {
          this.node.fs.accessSync("./magic.json", this.node.fs.constants.R_OK | this.node.fs.constants.W_OK);
        } catch (err) {
          this.node.fs.writeFileSync("./magic.json", "{}", { encoding: "utf8" });
        }
        this.node.data = require("./magic.json");
      } else if (this.isJSBox) {
        if (!$file.exists("drive://MagicJS")) {
          $file.mkdir("drive://MagicJS");
        }
        if (!$file.exists("drive://MagicJS/magic.json")) {
          $file.write({
            data: $data({ string: "{}" }),
            path: "drive://MagicJS/magic.json",
          });
        }
      }
    }

    /**
     * @param {string} url
     */
    set barkUrl(url) {
      this._barkUrl = url.replace(/\/+$/g, "");
    }

    set logLevel(level) {
      this._logLevel = typeof level === "string" ? level.toUpperCase() : "DEBUG";
    }

    get logLevel() {
      return this._logLevel;
    }

    get isRequest() {
      return typeof $request !== "undefined" && typeof $response === "undefined";
    }

    get isResponse() {
      return typeof $response !== "undefined";
    }

    get request() {
      return typeof $request !== "undefined" ? $request : undefined;
    }

    get response() {
      if (typeof $response !== "undefined") {
        if ($response.hasOwnProperty("status")) $response["statusCode"] = $response["status"];
        if ($response.hasOwnProperty("statusCode")) $response["status"] = $response["statusCode"];
        return $response;
      } else {
        return undefined;
      }
    }

    get platform() {
      if (this.isSurge) return "Surge";
      else if (this.isQuanX) return "Quantumult X";
      else if (this.isLoon) return "Loon";
      else if (this.isJSBox) return "JSBox";
      else if (this.isNode) return "Node.js";
      else return "unknown";
    }

    read(key, session = "") {
      let val = "";
      // 读取原始数据
      if (this.isSurge || this.isLoon) {
        val = $persistentStore.read(key);
      } else if (this.isQuanX) {
        val = $prefs.valueForKey(key);
      } else if (this.isNode) {
        val = this.node.data;
      } else if (this.isJSBox) {
        val = $file.read("drive://MagicJS/magic.json").string;
      }
      try {
        // Node 和 JSBox数据处理
        if (this.isNode) val = val[key];
        if (this.isJSBox) val = JSON.parse(val)[key];
        // 带Session的情况
        if (!!session) {
          if (typeof val === "string") val = JSON.parse(val);
          val = !!val && typeof val === "object" ? val[session] : null;
        }
      } catch (err) {
        this.logError(err);
        val = !!session ? {} : null;
        this.del(key);
      }
      if (typeof val === "undefined") val = null;
      try {
        if (!!val && typeof val === "string") val = JSON.parse(val);
      } catch (err) {}
      this.logDebug(`READ DATA [${key}]${!!session ? `[${session}]` : ""}(${typeof val})\n${JSON.stringify(val)}`);
      return val;
    }

    write(key, val, session = "") {
      let data = !!session ? {} : "";
      // 读取原先存储的JSON格式数据
      if (!!session && (this.isSurge || this.isLoon)) {
        data = $persistentStore.read(key);
      } else if (!!session && this.isQuanX) {
        data = $prefs.valueForKey(key);
      } else if (this.isNode) {
        data = this.node.data;
      } else if (this.isJSBox) {
        data = JSON.parse($file.read("drive://MagicJS/magic.json").string);
      }
      if (!!session) {
        // 有Session，所有数据都是Object
        try {
          if (typeof data === "string") data = JSON.parse(data);
          data = typeof data === "object" && !!data ? data : {};
        } catch (err) {
          this.logError(err);
          this.del(key);
          data = {};
        }
        if (this.isJSBox || this.isNode) {
          // 构造数据
          if (!data.hasOwnProperty(key) || typeof data[key] != "object") {
            data[key] = {};
          }
          if (!data[key].hasOwnProperty(session)) {
            data[key][session] = null;
          }
          // 写入或删除数据
          if (typeof val === "undefined") {
            delete data[key][session];
          } else {
            data[key][session] = val;
          }
        } else {
          // 写入或删除数据
          if (typeof val === "undefined") {
            delete data[session];
          } else {
            data[session] = val;
          }
        }
      }
      // 没有Session时
      else {
        if (this.isNode || this.isJSBox) {
          // 删除数据
          if (typeof val === "undefined") {
            delete data[key];
          } else {
            data[key] = val;
          }
        } else {
          // 删除数据
          if (typeof val === "undefined") {
            data = null;
          } else {
            data = val;
          }
        }
      }
      // 数据回写
      if (typeof data === "object") data = JSON.stringify(data);
      if (this.isSurge || this.isLoon) {
        $persistentStore.write(data, key);
      } else if (this.isQuanX) {
        $prefs.setValueForKey(data, key);
      } else if (this.isNode) {
        this.node.fs.writeFileSync("./magic.json", data);
      } else if (this.isJSBox) {
        $file.write({ data: $data({ string: data }), path: "drive://MagicJS/magic.json" });
      }
      this.logDebug(`WRITE DATA [${key}]${!!session ? `[${session}]` : ""}(${typeof val})\n${JSON.stringify(val)}`);
    }

    del(key, session = "") {
      this.logDebug(`DELETE KEY [${key}]${!!session ? `[${session}]` : ""}`);
      this.write(key, null, session);
    }

    /**
     * iOS系统通知
     * @param {*} title 通知标题
     * @param {*} subTitle 通知副标题
     * @param {*} body 通知内容
     * @param {*} opts 通知选项，目前支持传入超链接或Object
     * Surge不支持通知选项，Loon和QuantumultX支持打开URL和多媒体通知
     * opts "applestore://" 打开Apple Store
     * opts "https://www.apple.com.cn/" 打开Apple.com.cn
     * opts {'open-url': 'https://www.apple.com.cn/'} 打开Apple.com.cn
     * opts {'open-url': 'https://www.apple.com.cn/', 'media-url': 'https://raw.githubusercontent.com/Orz-3/mini/master/Apple.png'} 打开Apple.com.cn，显示一个苹果Logo
     */
    notify(title = this.scriptName, subTitle = "", body = "", opts = "") {
      let convertOptions = (_opts) => {
        let newOpts = {};
        if (typeof _opts === "string") {
          if (this.isLoon) newOpts = { openUrl: _opts };
          else if (this.isQuanX) newOpts = { "open-url": _opts };
        } else if (typeof _opts === "object") {
          if (this.isLoon) {
            newOpts["openUrl"] = !!_opts["open-url"] ? _opts["open-url"] : "";
            newOpts["mediaUrl"] = !!_opts["media-url"] ? _opts["media-url"] : "";
          } else if (this.isQuanX) newOpts = !!_opts["open-url"] || !!_opts["media-url"] ? _opts : {};
        }
        return newOpts;
      };
      opts = convertOptions(opts);
      // 支持单个参数通知
      if (arguments.length == 1) {
        title = this.scriptName;
        (subTitle = ""), (body = arguments[0]);
      }
      // 生成通知日志
      this.logNotify(`title:${title}\nsubTitle:${subTitle}\nbody:${body}\noptions:${typeof opts === "object" ? JSON.stringify(opts) : opts}`);
      if (this.isSurge) {
        $notification.post(title, subTitle, body);
      } else if (this.isLoon) {
        if (!!opts) $notification.post(title, subTitle, body, opts);
        else $notification.post(title, subTitle, body);
      } else if (this.isQuanX) {
        $notify(title, subTitle, body, opts);
      } else if (this.isNode) {
        if (!!this._barkUrl) {
          let content = encodeURI(`${title}/${subTitle}\n${body}`);
          this.get(`${this._barkUrl}/${content}`, () => {});
        }
      } else if (this.isJSBox) {
        let push = {
          title: title,
          body: !!subTitle ? `${subTitle}\n${body}` : body,
        };
        $push.schedule(push);
      }
    }

    log(msg, level = "INFO") {
      if (!(this.logLevels[this._logLevel] < this.logLevels[level.toUpperCase()])) console.log(`[${level}] [${this.scriptName}]\n${msg}\n`);
    }

    logDebug(msg) {
      this.log(msg, "DEBUG");
    }

    logInfo(msg) {
      this.log(msg, "INFO");
    }

    logNotify(msg) {
      this.log(msg, "NOTIFY");
    }

    logWarning(msg) {
      this.log(msg, "WARNING");
    }

    logError(msg) {
      this.log(msg, "ERROR");
    }

    logRetry(msg) {
      this.log(msg, "RETRY");
    }

    /**
     * 对传入的Http Options根据不同环境进行适配
     * @param {*} options
     */
    adapterHttpOptions(options, method) {
      let _options = typeof options === "object" ? Object.assign({}, options) : { url: options, headers: {} };

      if (_options.hasOwnProperty("header") && !_options.hasOwnProperty("headers")) {
        _options["headers"] = _options["header"];
        delete _options["header"];
      }

      // 规范化的headers
      const headersMap = {
        "accept": "Accept",
        "accept-ch": "Accept-CH",
        "accept-charset": "Accept-Charset",
        "accept-features": "Accept-Features",
        "accept-encoding": "Accept-Encoding",
        "accept-language": "Accept-Language",
        "accept-ranges": "Accept-Ranges",
        "access-control-allow-credentials": "Access-Control-Allow-Credentials",
        "access-control-allow-origin": "Access-Control-Allow-Origin",
        "access-control-allow-methods": "Access-Control-Allow-Methods",
        "access-control-allow-headers": "Access-Control-Allow-Headers",
        "access-control-max-age": "Access-Control-Max-Age",
        "access-control-expose-headers": "Access-Control-Expose-Headers",
        "access-control-request-method": "Access-Control-Request-Method",
        "access-control-request-headers": "Access-Control-Request-Headers",
        "age": "Age",
        "allow": "Allow",
        "alternates": "Alternates",
        "authorization": "Authorization",
        "cache-control": "Cache-Control",
        "connection": "Connection",
        "content-encoding": "Content-Encoding",
        "content-language": "Content-Language",
        "content-length": "Content-Length",
        "content-location": "Content-Location",
        "content-md5": "Content-MD5",
        "content-range": "Content-Range",
        "content-security-policy": "Content-Security-Policy",
        "content-type": "Content-Type",
        "cookie": "Cookie",
        "dnt": "DNT",
        "date": "Date",
        "etag": "ETag",
        "expect": "Expect",
        "expires": "Expires",
        "from": "From",
        "host": "Host",
        "if-match": "If-Match",
        "if-modified-since": "If-Modified-Since",
        "if-none-match": "If-None-Match",
        "if-range": "If-Range",
        "if-unmodified-since": "If-Unmodified-Since",
        "last-event-id": "Last-Event-ID",
        "last-modified": "Last-Modified",
        "link": "Link",
        "location": "Location",
        "max-forwards": "Max-Forwards",
        "negotiate": "Negotiate",
        "origin": "Origin",
        "pragma": "Pragma",
        "proxy-authenticate": "Proxy-Authenticate",
        "proxy-authorization": "Proxy-Authorization",
        "range": "Range",
        "referer": "Referer",
        "retry-after": "Retry-After",
        "sec-websocket-extensions": "Sec-Websocket-Extensions",
        "sec-websocket-key": "Sec-Websocket-Key",
        "sec-websocket-origin": "Sec-Websocket-Origin",
        "sec-websocket-protocol": "Sec-Websocket-Protocol",
        "sec-websocket-version": "Sec-Websocket-Version",
        "server": "Server",
        "set-cookie": "Set-Cookie",
        "set-cookie2": "Set-Cookie2",
        "strict-transport-security": "Strict-Transport-Security",
        "tcn": "TCN",
        "te": "TE",
        "trailer": "Trailer",
        "transfer-encoding": "Transfer-Encoding",
        "upgrade": "Upgrade",
        "user-agent": "User-Agent",
        "variant-vary": "Variant-Vary",
        "vary": "Vary",
        "via": "Via",
        "warning": "Warning",
        "www-authenticate": "WWW-Authenticate",
        "x-content-duration": "X-Content-Duration",
        "x-content-security-policy": "X-Content-Security-Policy",
        "x-dnsprefetch-control": "X-DNSPrefetch-Control",
        "x-frame-options": "X-Frame-Options",
        "x-requested-with": "X-Requested-With",
        "x-surge-skip-scripting": "X-Surge-Skip-Scripting",
      };
      if (typeof _options.headers === "object") {
        for (let key in _options.headers) {
          if (headersMap[key]) {
            _options.headers[headersMap[key]] = _options.headers[key];
            delete _options.headers[key];
          }
        }
      }

      // 自动补完User-Agent，减少请求特征
      if (!!!_options.headers || typeof _options.headers !== "object" || !!!_options.headers["User-Agent"]) {
        if (!!!_options.headers || typeof _options.headers !== "object") _options.headers = {};
        if (this.isNode) _options.headers["User-Agent"] = this.pcUserAgent;
        else _options.headers["User-Agent"] = this.iOSUserAgent;
      }

      // 判断是否跳过脚本处理
      let skipScripting = false;
      if ((typeof _options["opts"] === "object" && (_options["opts"]["hints"] === true || _options["opts"]["Skip-Scripting"] === true)) || (typeof _options["headers"] === "object" && _options["headers"]["X-Surge-Skip-Scripting"] === true)) {
        skipScripting = true;
      }
      if (!skipScripting) {
        if (this.isSurge) _options.headers["X-Surge-Skip-Scripting"] = false;
        else if (this.isLoon) _options.headers["X-Requested-With"] = "XMLHttpRequest";
        else if (this.isQuanX) {
          if (typeof _options["opts"] !== "object") _options.opts = {};
          _options.opts["hints"] = false;
        }
      }

      // 对请求数据做清理
      if (!this.isSurge || skipScripting) delete _options.headers["X-Surge-Skip-Scripting"];
      if (!this.isQuanX && _options.hasOwnProperty("opts")) delete _options["opts"];
      if (this.isQuanX && _options.hasOwnProperty("opts")) delete _options["opts"]["Skip-Scripting"];

      // GET请求将body转换成QueryString(beta)
      if (method === "GET" && !this.isNode && !!_options.body) {
        let qs = Object.keys(_options.body)
          .map((key) => {
            if (typeof _options.body === "undefined") return "";
            return `${encodeURIComponent(key)}=${encodeURIComponent(_options.body[key])}`;
          })
          .join("&");
        if (_options.url.indexOf("?") < 0) _options.url += "?";
        if (_options.url.lastIndexOf("&") + 1 != _options.url.length && _options.url.lastIndexOf("?") + 1 != _options.url.length) _options.url += "&";
        _options.url += qs;
        delete _options.body;
      }

      // 适配多环境
      if (this.isQuanX) {
        if (_options.hasOwnProperty("body") && typeof _options["body"] !== "string") _options["body"] = JSON.stringify(_options["body"]);
        _options["method"] = method;
      } else if (this.isNode) {
        delete _options.headers["Accept-Encoding"];
        if (typeof _options.body === "object") {
          if (method === "GET") {
            _options.qs = _options.body;
            delete _options.body;
          } else if (method === "POST") {
            _options["json"] = true;
            _options.body = _options.body;
          }
        }
      } else if (this.isJSBox) {
        _options["header"] = _options["headers"];
        delete _options["headers"];
      }

      return _options;
    }

    /**
     * Http客户端发起GET请求
     * @param {*} options
     * @param {*} callback
     * options可配置参数headers和opts，用于判断由脚本发起的http请求是否跳过脚本处理。
     * 支持Surge和Quantumult X两种配置方式。
     * 以下几种配置会跳过脚本处理，options没有opts或opts的值不匹配，则不跳过脚本处理
     * {opts:{"hints": true}}
     * {opts:{"Skip-Scripting": true}}
     * {headers: {"X-Surge-Skip-Scripting": true}}
     */
    get(options, callback) {
      let _options = this.adapterHttpOptions(options, "GET");
      this.logDebug(`HTTP GET: ${JSON.stringify(_options)}`);
      if (this.isSurge || this.isLoon) {
        $httpClient.get(_options, callback);
      } else if (this.isQuanX) {
        $task.fetch(_options).then(
          (resp) => {
            resp["status"] = resp.statusCode;
            callback(null, resp, resp.body);
          },
          (reason) => callback(reason.error, null, null)
        );
      } else if (this.isNode) {
        return this.node.request.get(_options, callback);
      } else if (this.isJSBox) {
        _options["handler"] = (resp) => {
          let err = resp.error ? JSON.stringify(resp.error) : undefined;
          let data = typeof resp.data === "object" ? JSON.stringify(resp.data) : resp.data;
          callback(err, resp.response, data);
        };
        $http.get(_options);
      }
    }

    /**
     * Http客户端发起POST请求
     * @param {*} options
     * @param {*} callback
     * options可配置参数headers和opts，用于判断由脚本发起的http请求是否跳过脚本处理。
     * 支持Surge和Quantumult X两种配置方式。
     * 以下几种配置会跳过脚本处理，options没有opts或opts的值不匹配，则不跳过脚本处理
     * {opts:{"hints": true}}
     * {opts:{"Skip-Scripting": true}}
     * {headers: {"X-Surge-Skip-Scripting": true}}
     */
    post(options, callback) {
      let _options = this.adapterHttpOptions(options, "POST");
      this.logDebug(`HTTP POST: ${JSON.stringify(_options)}`);
      if (this.isSurge || this.isLoon) {
        $httpClient.post(_options, callback);
      } else if (this.isQuanX) {
        $task.fetch(_options).then(
          (resp) => {
            resp["status"] = resp.statusCode;
            callback(null, resp, resp.body);
          },
          (reason) => {
            callback(reason.error, null, null);
          }
        );
      } else if (this.isNode) {
        return this.node.request.post(_options, callback);
      } else if (this.isJSBox) {
        _options["handler"] = (resp) => {
          let err = resp.error ? JSON.stringify(resp.error) : undefined;
          let data = typeof resp.data === "object" ? JSON.stringify(resp.data) : resp.data;
          callback(err, resp.response, data);
        };
        $http.post(_options);
      }
    }

    done(value = {}) {
      if (typeof $done !== "undefined") {
        $done(value);
      }
    }

    isToday(day) {
      if (day == null) {
        return false;
      } else {
        let today = new Date();
        if (typeof day == "string") {
          day = new Date(day);
        }
        if (today.getFullYear() == day.getFullYear() && today.getMonth() == day.getMonth() && today.getDay() == day.getDay()) {
          return true;
        } else {
          return false;
        }
      }
    }

    isNumber(val) {
      return parseFloat(val).toString() === "NaN" ? false : true;
    }

    /**
     * 对await执行中出现的异常进行捕获并返回，避免写过多的try catch语句
     * 示例：let [err,val] = await magicJS.attempt(func(), 'defaultvalue');
     * 或者：let [err, [val1,val2]] = await magicJS.attempt(func(), ['defaultvalue1', 'defaultvalue2']);
     * @param {*} promise Promise 对象
     * @param {*} defaultValue 出现异常时返回的默认值
     * @returns 返回两个值，第一个值为异常，第二个值为执行结果
     */
    attempt(promise, defaultValue = null) {
      return promise
        .then((args) => {
          return [null, args];
        })
        .catch((ex) => {
          this.logError(ex);
          return [ex, defaultValue];
        });
    }

    /**
     * 重试方法
     * @param {*} fn 需要重试的函数
     * @param {number} [retries=5] 重试次数
     * @param {number} [interval=0] 每次重试间隔
     * @param {function} [callback=null] 函数没有异常时的回调，会将函数执行结果result传入callback，根据result的值进行判断，如果需要再次重试，在callback中throw一个异常，适用于函数本身没有异常但仍需重试的情况。
     * @returns 返回一个Promise对象
     */
    retry(fn, retries = 5, interval = 0, callback = null) {
      return (...args) => {
        return new Promise((resolve, reject) => {
          function _retry(...args) {
            Promise.resolve()
              .then(() => fn.apply(this, args))
              .then((result) => {
                if (typeof callback === "function") {
                  Promise.resolve()
                    .then(() => callback(result))
                    .then(() => {
                      resolve(result);
                    })
                    .catch((ex) => {
                      if (retries >= 1) {
                        if (interval > 0) setTimeout(() => _retry.apply(this, args), interval);
                        else _retry.apply(this, args);
                      } else {
                        reject(ex);
                      }
                      retries--;
                    });
                } else {
                  resolve(result);
                }
              })
              .catch((ex) => {
                this.logRetry(ex);
                if (retries >= 1 && interval > 0) {
                  setTimeout(() => _retry.apply(this, args), interval);
                } else if (retries >= 1) {
                  _retry.apply(this, args);
                } else {
                  reject(ex);
                }
                retries--;
              });
          }
          _retry.apply(this, args);
        });
      };
    }

    formatTime(time, fmt = "yyyy-MM-dd hh:mm:ss") {
      var o = {
        "M+": time.getMonth() + 1,
        "d+": time.getDate(),
        "h+": time.getHours(),
        "m+": time.getMinutes(),
        "s+": time.getSeconds(),
        "q+": Math.floor((time.getMonth() + 3) / 3),
        "S": time.getMilliseconds(),
      };
      if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (time.getFullYear() + "").substr(4 - RegExp.$1.length));
      for (let k in o) if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
      return fmt;
    }

    now() {
      return this.formatTime(new Date(), "yyyy-MM-dd hh:mm:ss");
    }

    today() {
      return this.formatTime(new Date(), "yyyy-MM-dd");
    }

    sleep(time) {
      return new Promise((resolve) => setTimeout(resolve, time));
    }
  })(scriptName);
}
