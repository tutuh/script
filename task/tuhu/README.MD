配置说明:    
## 途虎养车签到脚本：  
2条重写，app内手签一次获取cookie，下方日常任务领取获得cookie 。获取Cookie后注释重写  
Quantumult X:  
```
[rewrite_local]    
https:\/\/api\.tuhu\.cn\/User\/UserCheckInVersion1 url script-request-header https://raw.githubusercontent.com/tutuh/script/master/task/tuhu/tuhu.js  
https:\/\/cl-gateway\.tuhu\.cn\/cl-common-api\/api\/member\/addTask url script-request-header https://raw.githubusercontent.com/tutuh/script/master/task/tuhu/tuhu.js  
[task_local]   
#途虎养车   
0 8 * * * https://raw.githubusercontent.com/tutuh/script/master/task/tuhu/tuhu.js, tag=途虎养车, enabled=true   

[MITM]    
hostname= api.tuhu.cn, cl-gateway.tuhu.cn
```
