/******************************
来自TG-Surge大佬

#!name=网络连通性测试
#!desc=Network Connectivity Test

[Panel]
Connectivity_Test = script-name=Connectivity_Test,update-interval=1

[Script]
Connectivity_Test = type=generic,timeout=3,script-path=https://raw.githubusercontent.com/tutuh/script/master/Surge/JS/panel/Network_Connectivity.js,argument=icon=icloud.and.arrow.down&color=#FF9F0A&server=false
*******************************/

let $ = {
Bilibili:'https://www.bilibili.com',
Baidu:'https://www.baidu.com',
Youtube:'https://www.youtube.com/',
Google:'https://www.google.com/generate_204',
Github:'https://www.github.com'
}

!(async () => {
await Promise.all([http('Baidu'),http('Bilibili'),http('Github'),http('Google'),http('Youtube')]).then((x)=>{
	$done({
    title: 'Network Connectivity Test',
    content: x.join('\n'),
    icon: 'timer',
    'icon-color': '#FF5A9AF9',
  })
})
})();

function http(req) {
    return new Promise((r) => {
			let time = Date.now();
        $httpClient.post($[req], (err, resp, data) => {
            r(req +
						'\xa0\xa0\xa0\t: ' +
						(Date.now() - time)+' ms');
        });
    });
}
