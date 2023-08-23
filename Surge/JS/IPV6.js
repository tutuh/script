/*******************
By 小白脸大佬吐血作品
全新自动化IPv6切换

IPV6 = type=event,event-name=network-changed,script-path=https://raw.githubusercontent.com/tutuh/script/master/Surge/JS/IPV6.js,argument="ssid1,ssid2,fwo,wifi"

在argument处填写ssid名，多个ssid用,隔开，fwo表示“蜂窝开启”，填wifi表示所有ssid开启，同时会覆盖掉其他ssid名。
填写wifi,fwo,ssid 表示强制打开 v6
填写!wifi,!fwo,!sid 表示强制关闭v6
不填argument将自动判断当前ssid是否支持v6
------------------------------------------------
本地新建一个模块，需配合上面脚本使用
#!name=ipv6
#!desc=IPv6按需开启

[General]
ipv6 = true
ipv6-vif = auto

*********************/

(async () => {
   const moduleName = "ipv6"; //模块名

   const enabled = (await httpAPI("v1/modules")).enabled.includes(moduleName);

   const modules = typeof $argument === "string" && rule() || auot();

   `${enabled}` === `${modules}` || (await httpAPI("/v1/modules", "POST", { [moduleName]: `${modules}` }));
})().finally(() => $done());

function httpAPI(path, method = "GET", body = null) {
   return new Promise((resolve) => {
      $httpAPI(method, path, body, (result) => {
         resolve(result);
      });
   });
}

const rule = () => {
   const custom = $argument;
   const _ssid = $network.wifi.ssid;

   const r = (...s) => {
      for (var k of s) {
         const num = custom.indexOf(k);
         if (num > -1) return custom[num - 1] === "!" ? "false" : true;
         return false;
      }
   };
   return _ssid === null ? r("fwo") : r("wifi", _ssid);
};

const auot = () => {
   const ip = $network.v6.primaryAddress;
   return !!ip && !ip.includes("fe80:");
};
