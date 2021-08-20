# cookie时效变短了
## 联想智选App签到脚本：  
只能签到，连续签到任务需手动加入  
联想智选app---我的---签到，获取cookie  
获取Cookie后注释：  
QuantumultX:  
```
[rewrite_local]
https:\/\/api\.club\.lenovo\.cn\/common\/signin\/add url script-request-body https://raw.githubusercontent.com/tutuh/script/master/task/lenovo/lenovo.js
[task_local]
#联想智选
0 8 * * * https://raw.githubusercontent.com/tutuh/script/master/task/lenovo/lenovo.js, tag=联想智选, enabled=true
[mitm] 
hostname=api.club.lenovo.cn
```
```
Surge：
[Script]
联想智选 Cookie = script-path=https://raw.githubusercontent.com/tutuh/script/master/task/lenovo/lenovo.js,requires-body=true,type=http-request,pattern=https:\/\/api\.club\.lenovo\.cn\/common\/signin\/add
联想智选 = type=cron,cronexp=0 9 * * *,script-path=https://raw.githubusercontent.com/tutuh/script/master/task/lenovo/lenovo.js
[mitm] 
hostname=api.club.lenovo.cn
```
