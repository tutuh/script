// 安全地解析参数
const arg = {};
if (typeof $argument !== 'undefined' && $argument) {
  $argument.split('&').forEach(item => {
    const [k, v] = item.split('=');
    if (k && v) arg[k.trim().toLowerCase()] = v.trim();
  });
}

// 封装原生 Surge Promise 请求
function request(url, timeout) {
  return new Promise((resolve, reject) => {
    $httpClient.get({ url, timeout: timeout / 1000 }, (error, response, data) => {
      if (error) {
        reject(error);
      } else {
        resolve({ response, data });
      }
    });
  });
}

!(async () => {
  // 从 arguments 参数获取下载流量档位 (此处默认测试微软 CDN 文件)
  const timestamp = Date.now();

  // 1. 测试网络延迟 (Ping)
  const pingstart = Date.now();
  await request(`http://captive.apple.com/hotspot-detect.html?t=${timestamp}`, 5000);
  const pingt = Date.now() - pingstart;
  
  // 2. 测试下行速率 (Speed)
  const downloadUrl = `https://assets.fast.com/app-5.6.2.js?t=${timestamp}`;
  const fileMb = 1.25; // 文件真实大小 MB

  const start = Date.now();
  // 延长超时时间至 12 秒，照顾慢节点，防止直接抛出 Timeout 错误
  await request(downloadUrl, 12000);
  const end = Date.now();
  
  // 计算速率
  const duration = Math.max((end - start) / 1000, 0.001);
  const speedMbps = Math.round((fileMb / duration) * 8 * 100) / 100; // 转 Mbps 并保留两位小数

  console.log(`测速完成 -> 耗时: ${duration.toFixed(3)}s | 延迟: ${pingt}ms | 速率: ${speedMbps}Mbps`);

  // 图标与颜色动态映射
  let speedLevel = 1;
  if (speedMbps >= 100) speedLevel = 3;
  else if (speedMbps >= 30) speedLevel = 2;

  const icon = (speedLevel === 1 ? arg.iconslow : speedLevel === 2 ? arg.iconmid : arg.iconfast) 
    || (speedLevel === 1 ? 'tortoise' : speedLevel === 2 ? 'hare' : 'bolt');
  
  const color = (speedLevel === 1 ? arg.colorlow : speedLevel === 2 ? arg.colormid : arg.colorhigh) 
    || (speedLevel === 1 ? '#30D158' : speedLevel === 2 ? '#FF9F0A' : '#FF453A');

  const title = arg.title || `节点测速`;
  const content = `下行速率: ${speedMbps} Mbps\n网络延迟: ${pingt} ms\n测试耗时: ${duration.toFixed(2)}s`;
  
  $done({ 
    title, 
    content, 
    icon, 
    'icon-color': color 
  });

})().catch(e => {
  console.log('❌ 测速失败: ' + (e.message || String(e)));
  
  $done({ 
    title: arg.title || '节点测速', 
    content: '测速超时或节点断开连接', 
    icon: 'exclamationmark.triangle.fill', 
    'icon-color': '#FF3B30' 
  });
});
