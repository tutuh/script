/**
---by songyangzz---
https://github.com/songyangzz/QuantumultX/blob/master/ulike/ulike.js
 * QX
 * rewrite:
 * ^https:\/\/commerce-.*api\.faceu\.mobi\/commerce\/v1\/subscription\/user_info url script-response-body ulike.js
 * hostname:commerce-i18n-api.faceu.mobi,commerce-api.faceu.mobi
 */
var obj = JSON.parse($response.body);

obj= {
  "data": {
    "flag": true,
    "start_time": 1572760027,
    "end_time": 4097368706
  },
  "systime": "",
  "errmsg": "Success",
  "ret": "0"
};

$done({body: JSON.stringify(obj)});

//轻颜相机
