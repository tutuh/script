/***********************************************
2023-02-22 18:20
By kokoryh

QX:
[rewrite_local]
^https?:\/\/ad\.12306\.cn\/ad\/ser\/getAdList url script-analyze-echo-response https://raw.githubusercontent.com/tutuh/script/master/JS/12306.js
[mitm]
hostname = ad.12306.cn

Surge：
[Script]
12306去广告 = type=http-request,pattern=^https?:\/\/ad\.12306\.cn\/ad\/ser\/getAdList,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/tutuh/script/master/JS/12306.js

[MITM]
hostname = %APPEND% ad.12306.cn

***********************************************/





!function(){let e,a=JSON.parse($request.body);e="0007"===a.placementNo?'{"materialsList":[{"billMaterialsId":"255","filePath":"h","creativeType":1}],"advertParam":{"skipTime":1}}':"G0054"===a.placementNo?'{"code":"00","materialsList":[{}]}':'{"code":"00","message":"无广告返回"}';"undefined"!=typeof $task?$done({body:e}):$done({response:{body:e}})}();
