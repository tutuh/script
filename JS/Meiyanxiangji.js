/*
#美颜相机 v9.6.20版本（by-黑黑酱）
QX:
^https:\/\/api\.meiyan\.com\/vip\/user_info url script-response-body Meiyanxiangji.js

MITM = api.meiyan.com
*/

var obj = JSON.parse($response.body); 
// 

obj = {
  "meta": {
    "code": 0,
    "msg": "",
    "error": "",
    "request_uri": "\/vip\/user_info"
  },
  "response": {
    "status": 1,
    "agreement_status": 2,
    "expire_date": "2099-11-27",
    "period_type": 3,
    "product_type": 2,
    "permission": [],
    "discount_status": 64
  }
}

$done({body:JSON.stringify(obj)});
// 