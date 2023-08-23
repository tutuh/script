/*
Craft Pro解锁
Surge:
[Script]
Craft_解锁 = type=http-response,pattern=^https:\/\/api\.craft\.do\/auth\/v2\/profile,requires-body=1,max-size=0,timeout=10,script-path=Craft.js

[MITM]
hostname = %APPEND% api.craft.do

*/

let obj = JSON.parse($response.body);
obj["subscription"]={
	"tier":"Pro",
  "subscriptionActive":true
  },
$done({body: JSON.stringify(obj)});
