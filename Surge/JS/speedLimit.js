/*

作者：小白脸
版本：1.10
日期：2023.06.10 21:50

Surge配置参考注释

Apple下载示例↓↓↓ 
----------------------------------------

[Rule]
AND,((DOMAIN,iosapps.itunes.apple.com), (SCRIPT,策略优选)),Apple

[Script]
策略优选 = type=rule,timeout=60,script-path=https://raw.githubusercontent.com/githubdulong/Script/master/speedLimit.js,argument="Return=10min,Group=Apple&policy=DIRECT,PROXY,Support&time=15&minSpeed=20"

----------------------------------------

• 支持监控多个策略组，每个策略组可以监控多个域名，and 套 or 规则 or 可以放多个域名 and最下面放脚本规则；
• Group 填 "策略组"是填策略组重要事情说3遍；
• policy填 "策略" 第一个是填默认策略，默认策略可以是DIRECT，可以是其他策略，后面填你要跳转的策略，多个用英文的逗号 , 隔开；
• 默认策略可以只填一个，表示循环跳转这个策略组的所有策略；
• Return 表示策略组返回默认策略时间，单位可以定义 ms s min h 表示 毫秒 秒 分钟 小时；
• time 表示要监控的时间，单位为秒；
• minSpeed 表示低于这个速度就会触发跳转策略，单位MB/s；
• 兼容了16以下的系统；
• 多策略跳转顺序就是你填的顺序；
• 只到速度达标或策略跳转完结束,Return设定的时间后自动跳转默认策略；
• 如果所有策略轮询后都未达到监控需求则自动选择记录中最优策略；

----------------------------------------
*/

const policyGroupName = (Group, policyStrategies = "decisions") => {
   return $surge.selectGroupDetails()[policyStrategies][Group];
};

const tomilli = (String = $argument) => {
   const obj = {
      ms: 1,
      s: 1000,
      min: 60 * 1000,
      h: 60 * 60 * 1000,
   };
   const [, num, unit] = String.match(/([\d\.]+)(ms|s|min|h)/) || [, "1", "h"];
   return num * obj[unit];
};

const speed = (includes = "inCurrentSpeed") => {
   return new Promise((r, j) => {
      $httpAPI("GET", "/v1/requests/active", null, (data) => {
         try {
            const Data = data.requests
               .filter((item) => item.URL.includes(host))
               .reduce((prev, current) => (prev.speed > current.speed ? prev : current))[includes];
            r(Data);
         } catch (error) {
            j();
         }
      });
   });
};

const speed_unit = (speed) => {
   for (units of ["B/s", "KB/s", "MB/s", "GB/s", "TB/s"]) {
      if (speed < 1000 || !(speed = parseFloat(speed / 1024))) return `${speed.toFixed(2)} ${units}`;
   }
};

const write = (num, obj = {}) => {
   const targetObj = num ? cache : JSON.parse($persistentStore.read("last_update_time") || "{}");
   const _obj = { [host]: num, ...obj };
   Object.keys(_obj).forEach((key) => (targetObj[Group][key] = _obj[key]));
   return $persistentStore.write(JSON.stringify(targetObj), "last_update_time");
};

const findParentKey = (obj, value) => {
   for (let key in obj) {
      if (obj[key].hasOwnProperty(value)) return key;
   }
   return null;
};

const startTime = (_policy0, lastUpdateTime) => {
   return new Promise((r) =>
      $httpAPI("GET", "v1/traffic", null, (data) => {
         const { startTime } = data;
         const { _startTime_ } = cache;
         const bool = startTime == _startTime_;

         if (bool) {
            if (Group && _policy0 && Date.now() - lastUpdateTime >= tomilli()) {
               if (policyGroupName(Group) !== _policy0 || cache[Group]?.mix?.mix_end)
                  $surge.setSelectGroupPolicy(Group, _policy0), fn();
            }
         } else {
            cache._startTime_ = startTime;
            fn();
         }

         function fn() {
            Object.entries(cache).forEach(([key, value]) => {
               if (bool ? key === Group : key !== "_startTime_") {
                  Object.keys(value).forEach((prop) => {
                     if (prop !== "policy0" && prop !== "time") {
                        value[prop] = 0;
                     }
                  });
               }
            });
         }

         r();
      }),
   );
};

const mixspeed = (speed, policy) => {
   const mix = cache[Group]?.mix || {};
   mix.mix_speed ??= 0;
   return speed > mix.mix_speed
      ? {
           mix_speed: speed,
           mix_policy: policy,
           mix_end: false,
        }
      : mix;
};

const parameters = (arg, obj = {}) => {
   arg.split("&").forEach((value, index) => {
      const [key, val] = value.split("=");
      if (!val) throw `${key} 不能为空`;
      else if (index >= 2 && isNaN(val)) throw `${key} 必须为数字`;
      obj[key] = val;
   });
   return obj;
};

const optimizePolicyCode = (policy, Group) => {
   let ar = policy.split(",").filter((x) => !!x);
   const index = ar.length;

   if (index < 1) throw "policy必须至少包含一个默认策略";

   if (index === 1) {
      ar = policyGroupName(Group, "groups");
      const n = ar.indexOf(policy);
      if (n !== -1) {
         [ar[0], ar[n]] = [ar[n], ar[0]];
      } else throw `在${Group}策略组中未找到默认策略${policy}`;
   }

   return ar;
};

const findArg = async (G, isFound) => {
   let args = $argument.match(`=${G}.+?minSpeed=[0-9]+`);

   if (args) {
      return args[0].replace(/\s+/g, "");
   } else if (isFound) {
      throw "策略组匹配失败,不要加空格什么的";
   }

   const parent = (await speed("notes")).find((x) => x.includes("->"));

   if (!parent) throw "Group策略组不存在";

   Group = parent.match(/path\:\s(.+?)\s->/)[1];

   if (G in cache) {
      cache[Group] = cache[G];
      delete cache[G];
   }

   return await findArg(Group, true);
};

const cache = JSON.parse($persistentStore.read("last_update_time") || "{}");

const host = $request.hostname || $request.url;

let Group = findParentKey(cache, host);

const lastUpdateTime = cache[Group]?.time ?? 0;

const _policy0 = cache[Group]?.policy0;

(async () => {
   await startTime(_policy0, lastUpdateTime);

   $done({ matched: true });

   // 主逻辑循环
   try {
      // 获取参数并确定当前所在的策略组
      const arg = await findArg(Group);
      // 初始化缓存对象
      cache[Group] ||= {};

      // 检查是否存在正在处理的请求
      if (cache[Group]?.[host]) return;
      // 标记当前请求正在处理中
      write(1);

      // 解析参数,校验参数
      const { policy, time, minSpeed } = parameters(arg);
      // 对策略进行优化处理
      const arr_policy = optimizePolicyCode(policy, Group);
      // 获取当前使用的策略
      const policy1 = policyGroupName(Group);
      // 获取默认策略
      const policy0 = arr_policy[0];
      // 获取当前循环speed最快策略和结束条件
      const { mix_end, mix_policy } = cache[Group].mix || {};
      // 判断是否达到结束循环条件
      const End = mix_end && policy1 === mix_policy;

      let current_speed;
      let count = 0;

      // 循环监测下载速度和策略切换条件
      for (let i = 0; i < Math.ceil(time / 3); i++) {
         // 等待3秒
         await new Promise((r) => setTimeout(r, 3000));

         // 获取当前下载速度
         current_speed = await speed();

         // 判断两次下载速度为0
         if (current_speed === 0) count++;

         //结束循环条件
         if ((End || count >= 2 || current_speed >= minSpeed * 1048576) && write(0)) return;
      }
      //记录当前最快策略信息
      const Endjson = mixspeed(current_speed, policy1);
      // 计算下一个要切换的策略，如果策略循环结束未达到条件则退回速度最快的策略并结束循环
      const p = arr_policy[arr_policy.indexOf(policy1) + 1] || ((Endjson.mix_end = true), Endjson.mix_policy);

      // 执行策略切换
      if (p !== policy1) {
      if ($surge.setSelectGroupPolicy(`${Group}`, `${p}`))
         $notification.post(
      `策略切换 监控时长${time}秒`,
      `当前下载速度 ➟ ${speed_unit(current_speed)}`,
      `下载速度低于${minSpeed} MB/s 已切换至${p}`,
         );
	   else throw `${p}在策略组中不存在`;
      }

      // 更新缓存信息
      write(0, {
         time: Date.now(),
         policy0: policy0,
         mix: Endjson,
      });
   } catch (err) {
      // 处理错误情况
      write(0);
      $notification.post("错误: ⚠️", "策略切换失败", err || err.message);
   }
})();
