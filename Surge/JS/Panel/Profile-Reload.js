/*
*By Pysta \ TributePaulWalker
*脚本地址：https://raw.githubusercontent.com/TributePaulWalker/Profiles/main/JavaScript/Surge/Profile-Reload.js

[Panel]
配置重载 = title=配置重载,content=配置重载,style=info,script-name=配置重载,update-interval=-1
[Script]
配置重载 = type=generic,script-path=https://raw.githubusercontent.com/tutuh/script/master/Surge/JS/panel/Profile-Reload.js

*/

$httpAPI("POST", "/v1/profiles/reload", {}, data => {
    $notification.post("配置重载","配置重载成功","")
    $done({
        title: "配置重载",
        content: "配置重载成功",
        icon: "terminal",
        "icon-color": "#5AC8FA",
     })
    });
