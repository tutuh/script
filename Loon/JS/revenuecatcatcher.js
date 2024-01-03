// By leey668/pyer
// https://github.com/leey668/pyer/tree/main

if($response.body){
    $notification.post('', '已捕获', $request.url);
    console.log(JSON.parse($response.body));
}
$done({});
