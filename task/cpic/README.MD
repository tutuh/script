没什么用的小脚本
QX
配置说明:  
微信小程序"太平洋车生活" 手签一次获取cookie
```
[rewrite_local]  
https:\/\/auto\.chediandian\.com\/activity\/tb-sign\/sign-handle url script-request-body https://raw.githubusercontent.com/tutuh/script/master/task/cpic/cpic.js
[task_local]  
#太平洋车生活  
0 8 * * * cpic.js, tag=太平洋车生活, enabled=true  
[MITM]  
hostname= auto.chediandian.com
```
