[URL Rewrite]   
"reject" 策略会返回 HTTP 状态码 404，不附带任何额外内容  
>   “- reject ”

[Map Local]   
"reject-200" 策略会返回 HTTP 状态码 200，不附带任何额外内容  
>  data-type=text data=" "
> data="https://raw.githubusercontent.com/tutuh/script/master/Surge/Map_Local/reject-200.txt"

 "reject-dict" 策略返回 HTTP 状态码 200，同时附带一个空的 JSON 对象    
data-type=text data="{}"
data="https://raw.githubusercontent.com/tutuh/script/master/Surge/Map_Local/reject-dict.json"   

 "reject-img" 策略返回 HTTP 状态码 200，同时附带 1px gif    
>   data-type=tiny-gif data=""
> data="https://raw.githubusercontent.com/tutuh/script/master/Surge/Map_Local/reject-img.gif"   

"reject-array" 策略返回 HTTP 状态码 200，同时附带一个空的 JSON 数组      
>   data="https://raw.githubusercontent.com/tutuh/script/master/Surge/Map_Local/reject-array.json"    

reject-img Surge中使用URL-REGEX

