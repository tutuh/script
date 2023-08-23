## 悦刻签到  
打开悦刻app，点开“21天签到”获取cookie， 
```
Quanmutult X：
[rewrite_local]
https:\/\/app\.relxtech\.com\/dianziyan-api\/api\/v3\/community\/check-in url script-request-header https://raw.githubusercontent.com/tutuh/script/master/task/relx/relx.js
[task_local]
#悦刻
0 8 * * * https://raw.githubusercontent.com/tutuh/script/master/task/relx/relx.js, tag=Relx悦刻, enabled=true
hostname = app.relxtech.com
```
```
Surge:
悦刻cookie = script-path=https://raw.githubusercontent.com/tutuh/script/master/task/relx/relx.js,type=http-request,pattern=https:\/\/app\.relxtech\.com\/dianziyan-api\/api\/v3\/community\/check-in
悦刻 = type=cron,cronexp=0 9 0 * * *,script-path=https://raw.githubusercontent.com/tutuh/script/master/task/relx/relx.js
hostname = app.relxtech.com
```
