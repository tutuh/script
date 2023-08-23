/***********
[Script]
Dayone = type=http-response,pattern=^https:\/\/dayone\.(me|app)\/api\/(users|v2\/users\/(account-status|receipt))$,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/langkhach270389/Surge-LK/main/scripts/langkhach/dayone.js

[MITM]
hostname = %APPEND% dayone.*

************/

if ($response.status == 200) {
  if ($request.url.endsWith("account-status")) {
$done({body: JSON.stringify({
  "expirationDate": 1893427199000,
  "startDate": 1546272000000,
  "subscriptionPlan": "com.bloombuilt.dayoneios.subscription.premium.yearly_discounted_trial",
  "lastRenewalDate": 1546531200000,
  "subscriptionName": "premium",
  "bundleReason": "purchase",
  "cancellationDate": 0
} )});
} 
else { let body= $response.body;
	     let obj= JSON.parse(body);
	     const feature= {"bundleName":"premium","features":[{"name":"imagesPerEntry","limit":30,"canUpgrade":false},{"name":"printingDiscount","canUpgrade":false},{"name":"syncMac","canUpgrade":false},{"name":"prioritySupport","canUpgrade":false},{"name":"sync","canUpgrade":false},{"name":"journalLimit","limit":100,"canUpgrade":false},{"name":"audioPerEntry","limit":10,"canUpgrade":false}]};
    if(body.indexOf("featureBundle") !=-1)
      {
      obj["featureBundle"]= feature;
      }
       else {
	    	obj["bundle"]= feature;
	    }
	    $done({body: JSON.stringify(obj)});
        }
} else {
	$done({});
}
