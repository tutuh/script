// By leey668/pyer
// https://github.com/leey668/pyer/tree/main

const pyer1 = {};
const pyer2 = JSON.parse(typeof $response != "undefined" && $response.body || null);
const name = $persistentStore.read("name");
const appid = $persistentStore.read("appid");
if (typeof $response == "undefined") {
  delete $request.headers["x-revenuecat-etag"];
  delete $request.headers["X-RevenueCat-ETag"];
  pyer1.headers = $request.headers;
} else if (pyer2 && pyer2.subscriber) {
  pyer2.subscriber.subscriptions = pyer2.subscriber.subscriptions || {};
  pyer2.subscriber.entitlements = pyer2.subscriber.entitlements || {};
  const data = {
	"product_identifier": (appid),
	"expires_date": "2099-09-09T09:09:09Z",
	"purchase_date": "2023-09-09T09:09:09Z"
	};
  pyer2.subscriber.entitlements[(name)] = (data);
  pyer2.subscriber.subscriptions[(appid)] = {  ...data,	"original_purchase_date": "2023-09-09T09:09:09Z",	"store": "app_store",	"ownership_type": "PURCHASED"};
  pyer1.body = JSON.stringify(pyer2);
}
$done(pyer1);
