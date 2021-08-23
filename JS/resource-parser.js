/** By KOP-XIAO
☑️ 资源解析器 ©𝐒𝐡𝐚𝐰𝐧  ⟦2021-08-22 19:25⟧
----------------------------------------------------------
🛠 发现 𝐁𝐔𝐆 请反馈: @Shawn_KOP_bot
⛳️ 关注 🆃🅶 相关频道: https://t.me/QuanX_API
🗣 🆃🄷🄰🄽🄺🅂 🆃🄾  @Jamie CHIEN, @M**F**, @c0lada, @Peng-YM

🤖 主要功能: 
❶ 将其它格式的服务器订阅解析成 𝐐𝐮𝐚𝐧𝐭𝐮𝐦𝐮𝐥𝐭 𝐗 格式
☑︎ 支持 𝗩𝗺𝗲𝘀𝘀/𝗦𝗦(𝗥/𝗗)/𝗛𝗧𝗧𝗣(𝗦)/𝗧𝗿𝗼𝗷𝗮𝗻/𝗤𝘂𝗮𝗻𝘁𝘂𝗺𝘂𝗹𝘁(𝗫)/𝗦𝘂𝗿𝗴𝗲/𝐂𝐥𝐚𝐬𝐡/𝐒𝐡𝐚𝐝𝐨𝐰𝐫𝐨𝐜𝐤𝐞𝐭/𝐋𝐨𝐨𝐧 格式
☑︎ 提供说明 1⃣️ 中的可选个性化参数(筛选、重命名 等)
❷ 𝗿𝗲𝘄𝗿𝗶𝘁𝗲(重写) & 𝗳𝗶𝗹𝘁𝗲𝗿(分流) 的 转换 & 筛选 
☑︎ 用于禁用远程引用中某(几)项 𝗿𝗲𝘄𝗿𝗶𝘁𝗲/𝗵𝗼𝘀𝘁𝗻𝗮𝗺𝗲/𝗳𝗶𝗹𝘁𝗲𝗿
☑︎ 𝐒𝐮𝐫𝐠𝐞/𝐂𝐥𝐚𝐬𝐡 类型规则 𝗹𝗶𝘀𝘁 与 模块 𝐦𝐨𝐝𝐮𝐥𝐞 的解析使用
----------------------------------------------------------
0️⃣ ⟦原始链接⟧ 后加 "#" 使用, 不同参数用 "&" 连接: 
⚠️ ☞ https://mysub.com#emoji=1&tfo=1&in=香港+台湾
❖ 本地资源片段引用, 请将参数 "#𝗶𝗻=𝘅𝘅𝘅." 填入文件第 ① 行 ❖
❖ 🚦 支持中文, "操作" 以下特殊字符时请先替换 🚦
  ∎ "+"⇒"%2B", 空格⇒"%20", "@"⇒"%40", "&"⇒"%26", "."⇒"\."

1️⃣ ⟦𝐬𝐞𝐫𝐯𝐞𝐫 节点⟧ ➠ 参数说明:
⦿ info=1, 开启通知提示机场 ✈️ 流量信息(如有提供);
⦿ emoji=1(国行设备用2)/-1, 添加/删除节点名内地区旗帜;
⦿ udp=1/-1, tfo=1/-1, 分别强制开启(关闭) 𝐮𝐝𝐩-𝐫𝐞𝐥𝐚𝐲/𝐟𝐚𝐬𝐭-𝐨𝐩𝐞𝐧;
⦿ tls13=1, cert=1, 分别开启 𝐭𝐥𝐬1.3 及 𝐭𝐥𝐬 证书验证(默认关闭);
⦿ in, out, regex 分别为 保留、删除、正则筛选 节点;
  ❖ in, out 中多参数(逻辑"或")用 "+", 逻辑"与"用 "." 表示;
  ❖ in/out/regex 均对节点的完整信息进行匹配(类型、端口、加密等);
  ❖ 示范: "in=香港.0\.2倍率+台湾&out=香港%20BGP&regex=(?i)iplc"
⦿ rename 重命名, "旧名@新名", "前缀@", "@后缀", 用 "+" 连接多个参数;
  ❖ 删除字段: "字段1.字段2☠️", 想删除 "." 时用 "\." 替代
  ❖ 示范: "rename=香港@𝐇𝐊+[𝐒𝐒]@+@[1𝐗]+流量.0\.2☠️"
  ❖ 默认 emoji 先生效, 如想调换顺序, 请用 𝗿𝗿𝗻𝗮𝗺𝗲 参数
  ❖ $type0/1/2/3/4/5 占位符，将节点类型(ss/ssr/vmess 等)作为可操作参数，如
    ∎ rename=@|$type2
    ∎ 样式分别为 "𝐬𝐬","𝐒𝐒","🅢🅢","🆂🆂","ⓢⓢ","🅂🅂"
  ❖ $emoji1/2 占位符，将节点地区emoji(🇭🇰 🇯🇵 等)作为可操作参数，如
    ∎ rename=@「$emoji1」
  ❖ $tag 占位符，将订阅的 tag 作为可操作参数，如
    ∎ rename=@「$tag」
⦿ suffix=-1/1 将节点类型做为前缀/后缀 添加在节点名中, 如 「𝗌𝗌」 「𝖵𝗆𝖾𝗌𝗌」
⦿ ptn=1-6, 分别将节点名中的英文替换成花样字 ⇒ 🅰/🄰/𝐀/𝗮/𝔸/𝕒
⦿ npt=1-6, 分别将节点名中的数字替换成花样数字 ⇒ ①\❶\⓵\𝟙\¹\₁
⦿ delreg, 利用正则表达式来删除 "节点名" 中的字段(⚠️ 慎用)
⦿ replace 参数, 正则替换节点中内容, 可用于重命名/更改加密方式等
  ❖ replace=regex1@𝘀𝘁𝗿1+regex2@𝘀𝘁𝗿2
  ❖ replace=𝗿𝗲𝗴𝗲𝘅1@ 则等效于 𝗱𝗲𝗹𝗿𝗲𝗴 参数
⦿ sort=1/-1/x/指定规则, 分别按节点名 正/逆/随机/指定规则 排序
  ❖ 指定规则是正则表达式或简单关键词, 用"<" 或 ">" 连接
  ❖ sort=🇭🇰>🇸🇬>🇯🇵>🇺🇸 , 靠前排序
  ❖ sort=IEPL<IPLC<BGP , 靠后排序
⦿ del=1, 当有重名节点时, 用此参数删除重复节点(默认改名并保留)
⦿ ⟦进阶参数⟧: 𝘀𝗳𝗶𝗹𝘁𝗲𝗿/𝘀𝗿𝗲𝗻𝗮𝗺𝗲, 传入一段 base64 编码的脚本, 可用于更为复杂的[过滤/重命名] 需求
  ❖ 说明: https://github.com/KOP-XIAO/QuantumultX/pull/9

2⃣️ ⟦𝐫𝐞𝐰𝐫𝐢𝐭𝐞 重写⟧/⟦𝐟𝐢𝐥𝐭𝐞𝐫 分流⟧ ➠ 参数说明:
⦿ in, out, 根据关键词 保留/禁用 相关分流、重写规则;
⦿ inhn, outhn, “保留/删除”主机名(𝒉𝒐𝒔𝒕𝒏𝒂𝒎𝒆);
  ❖ 示范: 禁用 "淘宝比价" 及 "weibo" 的 js 同主机名
  𝐡𝐭𝐭𝐩𝐬://𝐦𝐲𝐥𝐢𝐬𝐭#𝒐𝒖𝒕=tb_price.js+wb_ad.js&outhn=weibo
⦿ regex, 正则筛选, 请自行折腾正则表达式;
  ❖ 可与 in(hn)/out(hn) 一起使用，in(hn)/out(hn) 会优先执行;
  ❖ 对 𝒉𝒐𝒔𝒕𝒏𝒂𝒎𝒆 & 𝐫𝐞𝐰𝐫𝐢𝐭𝐞/𝐟𝐢𝐥𝐭𝐞𝐫 同时生效(⚠️ 慎用)
⦿ policy 参数, 用于直接指定策略组，或为 𝐒𝐮𝐫𝐠𝐞 类型 𝗿𝘂𝗹𝗲-𝘀𝗲𝘁 生成策略组(默认"𝐒𝐡𝐚𝐰𝐧"策略组);
⦿ pset=regex1@policy1+regex2@policy2, 为同一分流规则中不同关键词(允许正则表达式)指定不同策略组;
⦿ replace 参数, 正则替换 𝐟𝐢𝐥𝐭𝐞𝐫/𝐫𝐞𝐰𝐫𝐢𝐭𝐞 内容, regex@newregex;
  ❖ 将淘宝比价中脚本替换成 lite 版本, tiktok 中 JP 换成 KR
    ∎ replace=(price)(.*)@$1_lite$2+jp@kr 
⦿ dst=rewrite/filter，分别为将 𝐦𝐨𝐝𝐮𝐥𝐞&𝗿𝘂𝗹𝗲-𝘀𝗲𝘁 转换成 重写/分流;
  ❖ ⚠️ 默认将 𝐦𝐨𝐝𝐮𝐥𝐞 转换到重写, 𝗿𝘂𝗹𝗲-𝘀𝗲𝘁 转成分流
  ❖ ⚠️ 把 𝗿𝘂𝗹𝗲-𝘀𝗲𝘁 中 𝐮𝐫𝐥-𝐫𝐞𝐠𝐞𝐱 转成重写时, 必须要加 dst=rewrite;
  ❖ ⚠️ 把 𝐦𝐨𝐝𝐮𝐥𝐞 中的分流规则转换时, 必须要加 dst=filter
⦿ cdn=1, 将 github 脚本的地址转换成免翻墙cdn.jsdelivr.net

3⃣️ 其他参数
⦿ 通知参数 ntf=0/1, 用于 关闭/打开 资源解析器的提示通知
  ❖ 𝗿𝗲𝘄𝗿𝗶𝘁𝗲/𝗳𝗶𝗹𝘁𝗲𝗿 默认“开启”通知提示, 以防规则误删除
  ❖ 𝘀𝗲𝗿𝘃𝗲𝗿 资源解析则默认”关闭“通知提示
⦿ 类型参数 type=domain-set/rule/module/list/nodes
  ❖ 当解析器未能正确识别类型时, 可尝试使用此参数强制指定
⦿ 隐藏参数 hide=1, 隐藏筛除的分流/重写，默认方式为禁用
----------------------------------------------------------
*/


/**
* 使用说明，
0️⃣ 在QuantumultX 配置文件中[general] 部分，加入 
resource_parser_url = https://raw.githubusercontent.com/KOP-XIAO/QuantumultX/master/Scripts/resource-parser.js
⚠️⚠️如提示"没有自定义解析器"，请长按右下角图标后点击左侧刷新按钮，更新资源，后台退出 app，直到出现解析器说明
1️⃣ 假设原始订阅连接为: https://raw.githubusercontent.com/crossutility/Quantumult-X/master/server-complete.txt , 
2️⃣ 假设你想要保留的参数为 in=tls+ss, 想要过滤的参数为 out=http+2, 请注意下面订阅链接后一定要加 ”#“ 符号
3️⃣ 则填入 Quanx 节点引用的的总链接为  https://raw.githubusercontent.com/crossutility/Quantumult-X/master/server-complete.txt#in=tls+ss&out=http+2
4️⃣ 填入上述链接, 并打开的资源解析器开关
------------------------------
*/


//beginning 解析器正常使用，調試註釋此部分

let [link0, content0, subinfo] = [$resource.link, $resource.content, $resource.info]
const subtag = $resource.tag != undefined ? $resource.tag : "";
////// 非 raw 链接的沙雕情形
content0 = content0.indexOf("DOCTYPE html") != -1 && link0.indexOf("github.com") != -1 ? ToRaw(content0) : content0 ;
//ends 正常使用部分，調試註釋此部分


var para = /^(http|https)\:\/\//.test(link0) ? link0 : content0.split("\n")[0];
var para1 = para.slice(para.indexOf("#") + 1).replace(/\$type/g,"node_type_para_prefix").replace(/\$emoji/g,"node_emoji_flag_prefix").replace(/\$tag/g,"node_tag_prefix") //防止参数中其它位置也存在"#"
var mark0 = para.indexOf("#") != -1 ? true : false; //是否有參數需要解析
var Pinfo = mark0 && para1.indexOf("info=") != -1 ? para1.split("info=")[1].split("&")[0] : 0;
var ntf_flow = 0;
//常用量
const Base64 = new Base64Code();
const escapeRegExp = str => str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'); //处理特殊符号以便正则匹配使用
var link1 = link0.split("#")[0]
const qxpng = "https://raw.githubusercontent.com/crossutility/Quantumult-X/master/quantumult-x.png" // server sub-info link
const subinfo_link = { "open-url": "https://t.me/QuanX_API", "media-url": "https://shrtm.nu/ebAr" };
const subinfo_link1 = { "open-url": link1, "media-url": "https://shrtm.nu/uo13" } // server sub-info link(fake-nodes)
const rwrite_link = { "open-url": link1, "media-url": "https://shrtm.nu/x3o2" } // rewrite filter link
const rwhost_link = { "open-url": link1, "media-url": "https://shrtm.nu/0n5J" } // hostname filter link
const rule_link = { "open-url": link1, "media-url": "https://shrtm.nu/cpHD" } // rule filter link
const nan_link = { "open-url": link1, "media-url": qxpng } // nan error link
const bug_link = { "open-url": "https://t.me/Shawn_KOP_bot", "media-url": "https://shrtm.nu/obcB" } // bug link
const sub_link = { "open-url": link1, "media-url": "https://shrtm.nu/ebAr" } // server link


SubFlow() //流量通知


// 参数获取
var Pin0 = mark0 && para1.indexOf("in=") != -1 ? (para1.split("in=")[1].split("&")[0].split("+")).map(decodeURIComponent) : null;
var Pout0 = mark0 && para1.indexOf("out=") != -1 ? (para1.split("out=")[1].split("&")[0].split("+")).map(decodeURIComponent) : null;
var Psfilter = mark0 && para1.indexOf("sfilter=") != -1 ? Base64.decode(para1.split("sfilter=")[1].split("&")[0]) : null; // script filter
var Preg = mark0 && para1.indexOf("regex=") != -1 ? decodeURIComponent(para1.split("regex=")[1].split("&")[0]).replace(/\，/g,",") : null; //server正则过滤参数
var Pregdel = mark0 && para1.indexOf("delreg=") != -1 ? decodeURIComponent(para1.split("delreg=")[1].split("&")[0]).replace(/\，/g,",") : null; // 正则删除参数
var Phin0 = mark0 && para1.indexOf("inhn=") != -1 ? (para1.split("inhn=")[1].split("&")[0].split("+")).map(decodeURIComponent) : null; //hostname 
var Phout0 = mark0 && para1.indexOf("outhn=") != -1 ? (para1.split("outhn=")[1].split("&")[0].split("+")).map(decodeURIComponent) : null; //hostname
var Preplace = mark0 && para1.indexOf("replace=") != -1 ? para1.split("replace=")[1].split("&")[0] : null; //filter/rewrite 正则替换
var Pemoji = mark0 && para1.indexOf("emoji=") != -1 ? para1.split("emoji=")[1].split("&")[0] : null;
var Pdbg = mark0 && para1.indexOf("dbg=") != -1 ? para1.split("dbg=")[1].split("&")[0] : null;
var Pudp0 = mark0 && para1.indexOf("udp=") != -1 ? para1.split("udp=")[1].split("&")[0] : 0;
var Ptfo0 = mark0 && para1.indexOf("tfo=") != -1 ? para1.split("tfo=")[1].split("&")[0] : 0;
var Prname = mark0 && para1.indexOf("rename=") != -1 ? para1.split("rename=")[1].split("&")[0].split("+") : null;
var Psrename = mark0 && para1.indexOf("srename=") != -1 ? Base64.decode(para1.split("srename=")[1].split("&")[0]) : null; // script rename
var Prrname = mark0 && para1.indexOf("rrname=") != -1 ? para1.split("rrname=")[1].split("&")[0].split("+") : null;
var Psuffix = mark0 && para1.indexOf("suffix=") != -1 ? para1.split("suffix=")[1].split("&")[0] : 0;
var Ppolicy = mark0 && para1.indexOf("policy=") != -1 ? decodeURIComponent(para1.split("policy=")[1].split("&")[0]) : "Shawn";
var Ppolicyset = mark0 && para1.indexOf("pset=") != -1 ? decodeURIComponent(para1.split("pset=")[1].split("&")[0]) : "";
var Pcert0 = mark0 && para1.indexOf("cert=") != -1 ? para1.split("cert=")[1].split("&")[0] : 0;
var Psort0 = mark0 && para1.indexOf("sort=") != -1 ? para1.split("sort=")[1].split("&")[0] : 0;
var PsortX = mark0 && para1.indexOf("sortx=") != -1 ? para1.split("sortx=")[1].split("&")[0] : 0;
var PTls13 = mark0 && para1.indexOf("tls13=") != -1 ? para1.split("tls13=")[1].split("&")[0] : 0;
var Pntf0 = mark0 && para1.indexOf("ntf=") != -1 ? para1.split("ntf=")[1].split("&")[0] : 2;
var Phide = mark0 && para1.indexOf("hide=") != -1 ? para1.split("hide=")[1].split("&")[0] : 0;
var Pb64 = mark0 && para1.indexOf("b64=") != -1 ? para1.split("b64=")[1].split("&")[0] : 0;
var emojino = [" 0️⃣ ", " 1⃣️ ", " 2⃣️ ", " 3⃣️ ", " 4⃣️ ", " 5⃣️ ", " 6⃣️ ", " 7⃣️ ", " 8⃣️ ", " 9⃣️ ", " 🔟 "]
var pfi = Pin0 ? "in=" + Pin0.join(", ") + ",  " : ""
var pfo = Pout0 ? "out=" + Pout0.join(", ") : ""
var pfihn = Phin0 ? "inhn=" + Phin0.join(", ") + ",  " : ""
var pfohn = Phout0 ? "outhn=" + Phout0.join(", ") : ""
var Pcnt =  para1.indexOf("cnt=") != -1 ? para1.split("cnt=")[1].split("&")[0] : 0;
var Pcap = para1.indexOf("cap=") != -1 ? para1.split("cap=")[1].split("&")[0] : "";
var Pptn = para1.indexOf("ptn=") != -1 ? para1.split("ptn=")[1].split("&")[0] : ""; //花式英文字符
var Pnptn = para1.indexOf("npt=") != -1 ? para1.split("npt=")[1].split("&")[0] : ""; //花式数字
var Pcdn = para1.indexOf("cdn=") != -1 ? para1.split("cdn=")[1].split("&")[0] : "";
let [flow, exptime, errornode, total] = "";
var Pdel = mark0 && para1.indexOf("del=") != -1 ? para1.split("del=")[1].split("&")[0] : 0; //删除重复节点
var typeU = para1.indexOf("type=") != -1 ? para1.split("type=")[1].split("&")[0] : "";

//花漾字 pattern
var pat=[]
pat[0] = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","k","r","s","t","u","v","w","x","y","z"]
pat[1] = ["🅰","🅱","🅲","🅳","🅴","🅵","🅶","🅷","🅸","🅹","🅺","🅻","🅼","🅽","🅾","🅿","🅺","🆁","🆂","🆃","🆄","🆅","🆆","🆇","🆈","🆉"]
pat[2] = ["🄰","🄱","🄲","🄳","🄴","🄵","🄶","🄷","🄸","🄹","🄺","🄻","🄼","🄽","🄾","🄿","🄺","🅁","🅂","🅃","🅄","🅅","🅆","🅇","🅈","🅉"]
pat[3] = ["𝐀","𝐁","𝐂","𝐃","𝐄","𝐅","𝐆","𝐇","𝐈","𝐉","𝐊","𝐋","𝐌","𝐍","𝐎","𝐏","𝐊","𝐑","𝐒","𝐓","𝐔","𝐕","𝐖","𝐗","𝐘","𝐙"]
pat[4] = ["𝗮","𝗯","𝗰","𝗱","𝗲","𝗳","𝗴","𝗵","𝗶","𝗷","𝗸","𝗹","𝗺","𝗻","𝗼","𝗽","𝗸","𝗿","𝘀","𝐭","𝘂","𝘃","𝘄","𝘅","𝘆","𝘇"]
pat[5] = ["𝔸","𝔹","ℂ","𝔻","𝔼","𝔽","𝔾","ℍ","𝕀","𝕁","𝕂","𝕃","𝕄","ℕ","𝕆","ℙ","𝕂","ℝ","𝕊","𝕋","𝕌","𝕍","𝕎","𝕏","𝕐","ℤ"]
pat[6] = ["𝕒","𝕓","𝕔","𝕕","𝕖","𝕗","𝕘","𝕙","𝕚","𝕛","𝕜","𝕝","𝕞","𝕟","𝕠","𝕡","𝕜","𝕣","𝕤","𝕥","𝕦","𝕧","𝕨","𝕩","𝕪","𝕫"]

// 花式数字
var patn=[]
patn[0] = ["0","1","2","3","4","5","6","7","8","9"]
patn[1] = [ '⓪', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨' ]
patn[2] = [ '⓪', '❶', '❷', '❸', '❹', '❺', '❻', '❼', '❽', '❾' ]
patn[3] = [ '⓪', '⓵', '⓶', '⓷', '⓸', '⓹', '⓺', '⓼', '⓻', '⓽' ]
patn[4] = [ '𝟘', '𝟙', '𝟚', '𝟛', '𝟜', '𝟝', '𝟞', '𝟟', '𝟠', '𝟡' ]
patn[5] = [ '⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹' ]
patn[6] = [ '₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉' ]

var type0=""
//flag=1,2,3分别为 server、rewrite、rule 类型
var flag = 1

function Parser() {
  type0 = Type_Check(content0); //  类型判断
  if (type0 != "web"){
    try {
      //$notify(type0,"hh")
      if (Pdbg){
        $notify(link0,type0,content0)
      }
      total = ResourceParse();
      
    } catch (err) {
      $notify("❌ 解析出现错误", "⚠️ 请点击发送链接反馈", err, bug_link);
    }
  } else {
    total=""
  }
    //$notify("","",total)
    $done({ content: total });
}

if (typeof($resource)!=="undefined") {
  Parser()
  $done({ content: total })
}


/**
# 以下为具体的 function

*/

function ParseUnknown(cnt){
  try {
    cnt = JSON.parse(cnt)
    if(cnt) {
      $notify("⚠️ 链接返回内容并非有效订阅"+ "⟦" + subtag + "⟧","⁉️ 请自行检查原始链接，返回内容 👇️👇️",JSON.stringify(cnt), bug_link)
    }
    
  } catch(err) {
    $notify("😭 未能识别该订阅格式：  " + "⟦" + subtag + "⟧",  "⚠️ 将直接导入Quantumult X \n 如认为是 BUG, 请点通知跳转反馈", "链接返回内容:\n"+cnt, bug_link);
  }
}



function ResourceParse() {
  //预处理，分流/重写等处理完成
  if (type0 == "Subs-B64Encode") {
    total = Subs2QX(Base64.decode(content0), Pudp0, Ptfo0, Pcert0, PTls13);
  } else if (type0 == "Subs") {
    total = Subs2QX(content0, Pudp0, Ptfo0, Pcert0, PTls13);
  } else if (type0 == "QuanX" || type0 == "Clash" || type0 == "Surge") {
    total = Subs2QX(isQuanX(content0).join("\n"), Pudp0, Ptfo0, Pcert0, PTls13);
  } else if (type0 == "sgmodule") { // surge module 模块/含 url-regex 的 rule-set
    flag = 2 
    total = SGMD2QX(content0) // 转换 
    total = Rewrite_Filter(total, Pin0, Pout0,Preg); // 筛选过滤
    if (Preplace) { total = ReplaceReg(total, Preplace) }
    if (Pcdn) {total = CDN(total)
    } else { total = total.join("\n")}
  } else if (type0 == "rewrite") { // rewrite 类型
    flag = 2;
    total = Rewrite_Filter(isQuanXRewrite(content0.split("\n")), Pin0, Pout0,Preg);
    if (Preplace) { total = ReplaceReg(total, Preplace) }
    if (Pcdn) {total = CDN(total)
    } else {total = total.join("\n")}
  } else if (type0 == "Rule") {  // rule 类型, 已处理完毕
    flag = 3;
    total = Rule_Handle(content0.split("\n"), Pout0, Pin0).filter(Boolean);
    if (Preg && total.length!=0) { // 正则筛选规则 filter
    total = total.map(Regex).filter(Boolean).join("\n") 
    RegCheck(total, "分流引用", Preg)} 
    if (Preplace) { total = ReplaceReg(total, Preplace) }
    if (Ppolicyset) {total = policy_sets(total, Ppolicyset)}
    total = total.join("\n")
  } else if (content0.trim() == "") {
    $notify("‼️ 引用" + "⟦" + subtag + "⟧" + " 返回內容为空", "⁉️ 点通知跳转以确认链接是否失效", para.split("#")[0], nan_link);
    flag = 0;
  } else if (type0 == "unknown") {
    ParseUnknown(content0)
    flag = -1;
  }
  
  //开始处理
  if (flag == 1) { //server 类型统一处理
    total = total.filter(Boolean)
    if (Pinfo == 1 && ntf_flow == 0) { //假节点类型的流量通知
      flowcheck(total)
    }
    if (Pin0 || Pout0) { total = Filter(total, Pin0, Pout0) } // in & out 
    if (Preg) { total = total.map(Regex).filter(Boolean)  // regex
      RegCheck(total, "节点订阅", Preg)} 
    if (Psfilter) { total = FilterScript(total, Psfilter) }
    if (Prrname) {
      Prn = Prrname;
      total = total.map(Rename);
    }
    if (Pemoji) { total = emoji_handle(total, Pemoji); }
    if (Pregdel) {
      delreg = Pregdel
      total = total.map(DelReg)
    }
    if (Preplace) { // server 类型也可用 replace 参数进行重命名操作
      total = ReplaceReg(total, Preplace)
    }
    if (Prname) {
      Prn = Prname;
      total = total.map(Rename);
    }
    if (Psrename) { total = RenameScript(total, Psrename) }
    if (Psort0) {
      total = QXSort(total, Psort0);
    }
    if (total.length > 0){
      if (Psuffix==1 || Psuffix==-1) {total = Psuffix == 1? total.map(type_suffix):total.map(type_prefix)
      }
      total = total.map(type_handle).map(emoji_prefix_handle).map(tag_handle)
      total = TagCheck_QX(total).join("\n") //节点名检查
      if (Pcnt == 1) {$notify("解析后最终返回内容" , "节点数量: " +total.split("\n").length, total)}
      total = Base64.encode(total) //强制节点类型 base64 加密后再导入 Quantumult X
      $done({ content: total });
    } else {
      $notify("❓❓ 友情提示 ➟ "+ "⟦" + subtag + "⟧", "⚠️⚠️ 解析后无有效内容", "🚥🚥 请自行检查相关参数, 或者点击通知跳转反馈", bug_link)
      total = errornode
      $done({ content: errornode })
    }
  } else if (flag == 0){ //空/错误类型
    total = errornode
    $done({ content: errornode })
  } else if (flag == -1){ //未知类型
    total = content0
    $done({ content: content0 })
  } 
  return total
  
}

//响应头流量处理部分
function SubFlow() {
  if (Pinfo == 1 && subinfo) {
    var sinfo = subinfo.replace(/ /g, "").toLowerCase();
    var total = "总流量: " + (parseFloat(sinfo.split("total=")[1].split(",")[0]) / (1024 ** 3)).toFixed(2) + "GB";
    var usd = "已用流量: " + ((parseFloat(sinfo.indexOf("upload")!=-1?sinfo.split("upload=")[1].split(",")[0]:"0") + parseFloat(sinfo.split("download=")[1].split(",")[0])) / (1024 ** 3)).toFixed(2) + "GB"
    var left = "剩余流量: " + ((parseFloat(sinfo.split("total=")[1].split(",")[0]) / (1024 ** 3)) - ((parseFloat(sinfo.indexOf("upload")!=-1?sinfo.split("upload=")[1].split(",")[0]:"0") + parseFloat(sinfo.split("download=")[1].split(",")[0])) / (1024 ** 3))).toFixed(2) + "GB"
    if (sinfo.indexOf("expire=") != -1) {
      var epr = new Date(parseFloat(sinfo.split("expire=")[1].split(",")[0]) * 1000);
      var year = epr.getFullYear();  // 获取完整的年份(4位,1970)
      var mth = epr.getMonth() + 1 < 10 ? '0' + (epr.getMonth() + 1) : (epr.getMonth() + 1);  // 获取月份(0-11,0代表1月,用的时候记得加上1)
      var day = epr.getDate() < 10 ? "0" + (epr.getDate()) : epr.getDate();
      epr = "过期时间: " + year + "-" + mth + "-" + day
    } else {
      epr = ""; //"过期时间: ✈️ 未提供該信息" //没过期时间的显示订阅链接
    }
    var message = total + "\n" + usd + ", " + left;
    ntf_flow = 1;
    $notify("流量信息: ⟦" + subtag + "⟧", epr, message, subinfo_link)
  }
//  } else if (Pinfo ==1){
//    $notify("流量信息: ⟦" + subtag + "⟧", "", "⚠️ 该订阅链接未返回任何流量信息", subinfo_link)
//  }
}

//flowcheck-fake-server
function flowcheck(cnt) {
    for (var i = 0; i < cnt.length; i++) {
        var item = cnt[i];
        var nl = item.slice(item.indexOf("tag"))
        var nm = nl.slice(nl.indexOf("=") + 1)
        if (item.indexOf("剩余流量") != -1) {
            flow = nm
        } else if (item.indexOf("期时间") != -1) {
            exptime = nm
        }
    }
  flow = flow? flow:"⚠️ 该订阅未返回任何流量信息"
  exptime = exptime? exptime:"⚠️ 该订阅未返回套餐时间信息"
    if (flow != "") { $notify("流量信息: ⟦" + subtag + "⟧", flow, exptime, subinfo_link1) }
}

// regex 后的检查
function RegCheck(total, typen, regpara) {
	if(total.length == 0){ 
		$notify("‼️ " + typen + "  ➟ " + "⟦" + subtag + "⟧", "⛔️ 筛选正则: regex=" + regpara, "⚠️ 筛选后剩余项为 0️⃣ , 请检查正则参数及原始链接", nan_link)
	}else if((typen != "节点订阅" && Pntf0 !=0) || (typen == "节点订阅" && Pntf0 ==1)){
		var nolist = total.length <= 10 ? emojino[total.length] : total.length
		$notify("🤖 " + typen + "  ➟ " + "⟦" + subtag + "⟧", "⛔️ 筛选正则: regex=" + regpara, "⚠️ 筛选后剩余以下" + nolist + "个匹配项 \n ⨷ " + total.join("\n ⨷ "), sub_link)
	}
}
//判断订阅类型
function Type_Check(subs) {
    var type = "unknown"
    var RuleK = ["host,", "-suffix,", "domain,", "-keyword,", "ip-cidr,", "ip-cidr6,",  "geoip,", "user-agent,", "ip6-cidr,"];
    var DomainK = ["domain-set,"]
    var QuanXK = ["shadowsocks=", "trojan=", "vmess=", "http="];
    var SurgeK = ["=ss,", "=vmess,", "=trojan,", "=http,", "=custom,", "=https,", "=shadowsocks", "=shadowsocksr"];
    var ClashK = ["proxies:"]
    var SubK = ["dm1lc3M", "c3NyOi8v", "CnNzOi8", "dHJvamFu", "c3M6Ly", "c3NkOi8v", "c2hhZG93",,"aHR0c"];
    var RewriteK = [" url "]
    var SubK2 = ["ss://", "vmess://", "ssr://", "trojan://", "ssd://", "https://"];
    var ModuleK = ["[Script]", "[Rule]", "[URL Rewrite]", "[Map Local]", "[MITM]", "\nhttp-r"]
    var html = "DOCTYPE html"
    var subi = subs.replace(/ /g, "")
    const RuleCheck = (item) => subi.toLowerCase().indexOf(item) != -1;
    const NodeCheck = (item) => subi.toLowerCase().indexOf(item.toLowerCase()) != -1;
    const RewriteCheck = (item) => subs.indexOf(item) != -1;
    var subsn = subs.split("\n")
    if (subs.indexOf(html) != -1 && link0.indexOf("github.com" == -1)) {
      $notify("‼️ 该链接返回网页内容,无有效订阅"+ " ➟ " + "⟦" + subtag + "⟧", "⁉️ 点通知跳转以确认链接是否失效\n"+link0, subs, nan_link);
      type = "web";
    } else if (typeU == "nodes") {
      type = "Subs-B64Encode"
    } else if (ClashK.some(NodeCheck) || typeU == "clash"){ // Clash 类型节点转换
      type = "Clash";
      content0 = Clash2QX(subs)
    } else if ((/^hostname\s*\=|pattern\=/.test(subi) || RewriteK.some(RewriteCheck)) && !/\[(Proxy|filter_local)\]/.test(subs) && para1.indexOf("dst=filter")==-1 && subi.indexOf("securehostname") == -1 && !/module|nodes|rule/.test(typeU)) {
      type = "rewrite" //Quantumult X 类型 rewrite/ Surge Script/
    } else if ( (((ModuleK.some(RewriteCheck) || para1.indexOf("dst=rewrite") != -1) && (para1.indexOf("dst=filter") == -1) && subs.indexOf("[Proxy]") == -1) || typeU == "module") && typeU != "nodes" && typeU != "rule") { // Surge 类型 module /rule-set(含url-regex) 类型
      type = "sgmodule"
    } else if (((RuleK.some(RuleCheck) && subs.indexOf(html) == -1 && !/\[(Proxy|server_local)\]/.test(subs)) || typeU == "rule" || para1.indexOf("dst=filter")!=-1) && typeU != "nodes") {
      type = "Rule";
    } else if ((DomainK.some(RuleCheck) || typeU == "domain-set") && subs.indexOf("[Proxy]") == -1 && typeU != "nodes") {
      type = "Rule";
      content0 = Domain2Rule(content0) // 转换 domain-set
    } else if (subsn.length >= 1 && SubK2.some(NodeCheck) && !/\[(Proxy|filter_local)\]/.test(subs)) { //未b64加密的多行URI 组合订阅
      type = "Subs"
    } else if (SubK.some(NodeCheck)) {  //b64加密的订阅类型
      type = "Subs-B64Encode"
    } else if ((subi.indexOf("tag=") != -1 && QuanXK.some(NodeCheck) && !/\[(Proxy|filter_local)\]/.test(subs)) || typeU =="list") {
      type = "Subs" // QuanX list
    } else if (subs.indexOf("[Proxy]") != -1) {
      type = "Surge"; // Surge Profiles
      content0 = Surge2QX(content0).join("\n");
    } else if ((SurgeK.some(NodeCheck)  && !/\[(Proxy|filter_local)\]/.test(subs)) || typeU == "list") {
      type = "Subs" // Surge proxy list
    } else if (subs.indexOf("[server_local]") != -1) {
      //type = "QuanX"  // QuanX Profile
      type = "Subs"
    } else if (content0.indexOf("server") !=-1 && content0.indexOf("server_port") !=-1) { //SIP008
      //type = "QuanX"
      type = "Subs"
      content0 = SIP2QuanX(content0)
    } 
  // 用于通知判断类型，debug
  if(typeU == "X"){
    $notify(type,"",content0)
  }
    return type
}

// 检查节点名字(重复以及空名)等QuanX 不允许的情形，以及多个空格等“不规范”方式
function TagCheck_QX(content) {
  typefix = {"shadowsocks":["𝐬𝐬","𝐒𝐒","🅢🅢","🆂🆂","ⓢⓢ","🅂🅂","SS"],"shadowsocksr":["𝐬𝐬𝐫","𝐒𝐒𝐑","🅢🅢🅡","🆂🆂🆁","ⓢⓢⓡ","🅂🅂🅁","SSR"],"vmess":["𝐯𝐦𝐞𝐬𝐬","𝐕𝐌𝐄𝐒𝐒","🅥🅜🅔🅢🅢","🆅🅼🅴🆂🆂","ⓥⓜⓔⓢⓢ","🅅🄼🄴🅂🅂","VMESS"],"trojan":["𝐭𝐫𝐨𝐣𝐚𝐧","𝐓𝐑𝐎𝐉𝐀𝐍","🅣🅡🅞🅙🅐🅝","🆃🆁🅾🅹🅰🅽","ⓣⓡⓞⓙⓐⓝ","🅃🅁🄾🄹🄰🄽","TROJAN"],"http":["𝐡𝐭𝐭𝐩","𝐇𝐓𝐓𝐏","🅗🅣🅣🅟","🅷🆃🆃🅿","ⓗⓣⓣⓟ","🄷🅃🅃🄿","HTTP"]}
  console.log(content)
    var Olist = content.map(item =>item.trim().replace(/\s{2,}/g," "))
    //$notify("","",Olist)
    var [Nlist, nmlist] = [ [], [] ]
    var [nulllist,duplist] = [ [], [] ]; //记录空名字节点&重名节点
    var no = 0;
    for (var i = 0; i < Olist.length; i++) {
        var item = Olist[i] ? Olist[i] : ""
      typefix["shadowsocks"]=item.indexOf("ssr-protocol")!=-1? typefix["shadowsocksr"] : typefix["shadowsocks"]
        if (item.replace(/ /gm, "").indexOf("tag=") != -1) {
            var nl = item.slice(item.indexOf("tag"))
            var nm = nl.slice(nl.indexOf("=") + 1)
            if (nm == "") { //空名字
                tp = typefix[item.split("=")[0].trim()][3]
                nm = tp + " | " + item.split("=")[1].split(",")[0].split(":")[0]
                item = item.split("tag")[0] + "tag=" + nm.replace("shadowsocks", "ss")
                nulllist.push(nm.replace("shadowsocks", "ss"))
            }
            var ni = 0
            while (nmlist.indexOf(nm) != -1) { //重名情形
                nm = ni==0? nm+ NoReplace(ni+1):nm.split(" ").slice(0,nm.split(" ").length-2).join(" ") + NoReplace(ni+1)
                item = Pdel != 1 ? item.split("tag")[0] + "tag=" + nm : ""
                ni = ni + 1
            }
            if (ni != 0) { duplist.push(nm) }
            nmlist.push(nm)
          if (Pcap) { 
            item = Capitalize(item,Pcap)
            console.log(item)
          }
          if (Pptn || Pnptn) { 
            item = Pattern(item,Pptn,Pnptn)
            console.log(item)
          }
            ni = 0
            if (item) {
            Nlist.push(item)
          }
        }// if "tag="
    } // for
    if (nulllist.length >= 1) {
        no = nulllist.length <= 10 ? emojino[nulllist.length] : nulllist.length;
        $notify("⚠️ 引用" + "⟦" + subtag + "⟧" + " 内有" + no + "个空节点名 ", "✅ 已将节点“类型+IP”设为节点名", " ⨁ " + nulllist.join("\n ⨁ "), nan_link)
    }
    if (duplist.length >= 1) {
        no = duplist.length <= 10 ? emojino[duplist.length] : duplist.length;
      if (Pdel!=1){
        $notify("⚠️ 引用" + "⟦" + subtag + "⟧" + " 内有" + no + "个名字重复的节点 ", "✅ 已添加数字区分, 删除请添加参数 del=1:", " ⨁ " + duplist.join("\n ⨁ "), nan_link)
      } else {
        $notify("⚠️ 引用" + "⟦" + subtag + "⟧" + " 内有" + no + "个名字重复的节点 ", "❌️ 已全部删除，如需保留请去除参数 del=1:", " ⨁ " + duplist.join("\n ⨁ "), nan_link)
      }
    }
    return Nlist
}

//节点名重名时添加数字序号替换
function NoReplace(cnt) {
  if(cnt){
    for (var i=0;i<10;i++) {
      cnt = cnt.toString().replace(new RegExp(patn[0][i], "gmi"),patn[5][i])
    }
    return " " + cnt + " "
  }
}


// 对节点名pattern化操作
function PatternN(cnt, para,npara) {
  if(cnt){
    if(para!=""){//字符
      for (var i=0;i<26;i++) {
        cnt = cnt.toLowerCase()
        cnt = cnt.replace(new RegExp(pat[0][i], "gmi"),pat[para][i])
      }
    }
    if(npara!=""){ //数字
      for (var i=0;i<10;i++) {
        cnt = cnt.replace(new RegExp(patn[0][i], "gmi"),patn[npara][i])
      }
    }
    console.log(cnt)
    return cnt
  }
}


function Pattern(cnt,para,npara) {
  if (para != "" || npara != "") {
    cnt = cnt.split("tag=")[0] +"tag="+ PatternN(cnt.split("tag=")[1],para,npara)
  }
  return cnt 
}


//大小写
function Capitalize(cnt,para) {
  if (para == 1) {
    cnt = cnt.split("tag=")[0] +"tag="+ cnt.split("tag=")[1].toUpperCase()
  } else if (para == -1) {
    cnt = cnt.split("tag=")[0] +"tag="+ cnt.split("tag=")[1].toLowerCase()
  } else if (para == 0) {
    cnt =cnt.split("tag=")[0] +"tag="+titleCase(cnt.split("tag=")[1])
  }
  return cnt
}

function titleCase(str) {
  var newStr = str.split(" ");
  for(var i = 0; i<newStr.length; i++){
    newStr[i] = newStr[i].slice(0,1).toUpperCase() + newStr[i].slice(1).toLowerCase();
  }    return newStr.join(" ");
}


// 类型前缀/后缀
function type_prefix(item) {
  if(item.trim()!="") {
    typefix = {"shadowsocks":"「𝐬𝐬」","vmess":"「𝐯𝐦𝐞𝐬𝐬」","trojan":"「𝐭𝐫𝐨𝐣𝐚𝐧」","http":"「𝐡𝐭𝐭𝐩」"}
    typefix["shadowsocks"]=item.indexOf("ssr-protocol")!=-1? "「𝐬𝐬𝐫」" : "「𝐬𝐬」"
    tp = typefix[item.split("=")[0].trim()]
    return [[item.split("tag=")[0]+
      "tag=", tp, item.split("tag=")[1]].join(" ")].join(" ")
  }
}
function type_suffix(item) {
  if(item.trim()!=""){
    typefix={"shadowsocks":"「𝐬𝐬」","vmess":"「𝐯𝐦𝐞𝐬𝐬」","trojan":"「𝐭𝐫𝐨𝐣𝐚𝐧」","http":"「𝐡𝐭𝐭𝐩」"}
    typefix["shadowsocks"]=item.indexOf("ssr-protocol")!=-1? "「𝐬𝐬𝐫」" : "「𝐬𝐬」"
    tp = typefix[item.split("=")[0].trim()]
    return [item, tp].join(" ")
  }
}

//获取类型
function getnode_type(item,ind) {
  if(item.trim()!="" && item.indexOf("tag=")!=-1) {
    ind = !/^(0|1|2|3|4|5)$/.test(ind) ? 6 : ind
    typefix = {"shadowsocks":["𝐬𝐬","𝐒𝐒","🅢🅢","🆂🆂","ⓢⓢ","🅂🅂","SS"],"shadowsocksr":["𝐬𝐬𝐫","𝐒𝐒𝐑","🅢🅢🅡","🆂🆂🆁","ⓢⓢⓡ","🅂🅂🅁","SSR"],"vmess":["𝐯𝐦𝐞𝐬𝐬","𝐕𝐌𝐄𝐒𝐒","🅥🅜🅔🅢🅢","🆅🅼🅴🆂🆂","ⓥⓜⓔⓢⓢ","🅅🄼🄴🅂🅂","VMESS"],"trojan":["𝐭𝐫𝐨𝐣𝐚𝐧","𝐓𝐑𝐎𝐉𝐀𝐍","🅣🅡🅞🅙🅐🅝","🆃🆁🅾🅹🅰🅽","ⓣⓡⓞⓙⓐⓝ","🅃🅁🄾🄹🄰🄽","TROJAN"],"http":["𝐡𝐭𝐭𝐩","𝐇𝐓𝐓𝐏","🅗🅣🅣🅟","🅷🆃🆃🅿","ⓗⓣⓣⓟ","🄷🅃🅃🄿","HTTP"]}
    typefix["shadowsocks"]=item.indexOf("ssr-protocol")!=-1? typefix["shadowsocksr"] : typefix["shadowsocks"]
    tp = typefix[item.split("=")[0].trim()][ind]
    return tp
  }
}

// 操作節點類型佔位符
function type_handle(item) {
  if(item.indexOf("node_type_para_prefix")!=-1) {
    item = item.replace(/node_type_para_prefix(\d{0,1})/g,getnode_type(item,item.split("node_type_para_prefix")[1][0]))
  }
  return item
}

// 操作emoji占位符
function emoji_prefix_handle(item) {
  if(item.indexOf("node_emoji_flag_prefix")!=-1) {
    item = item.replace(/node_emoji_flag_prefix\d{0,1}/g,getnode_emoji(item,item.split("node_emoji_flag_prefix")[1][0]))
    //console.log(item)
  }
  return item
}

// 获取emoji
function getnode_emoji(item,ind){
  ind = !/^(1|2)$/.test(ind) ? 2 : ind
  if(item.indexOf("tag=")!=-1) {
    return get_emoji(ind,item.split("tag=")[1])[1]
  }
}

// 操作订阅的 tag

function tag_handle(item) {
  if(item.indexOf("node_tag_prefix")!=-1) {
    item = item.replace(/node_tag_prefix/g,subtag)
  }
  return item
}

// 用于单条 URI 的 tag 参数, 直接指定节点名
function URI_TAG(cnt0,tag0) {
  cnt0 = cnt0.split("tag=")[0] + "tag=" + tag0
  return cnt0
}

// 用于某些奇葩用户不使用 raw 链接的问题
function rawtest(cnt) {
  var Preg0 = RegExp(".*js-file-line\".*?\<\/td\>", "i")
  if (Preg0.test(cnt)) {
    return cnt.replace(/(.*js-file-line\"\>)(.*?)(\<\/td\>)/g,"$2").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").trim()
  }
}

function ToRaw(cnt) {
  cnt = cnt.split("\n").map(rawtest).filter(Boolean).join("\n")
  var rawlink = link0.replace("github.com","raw.githubusercontent.com").replace("/blob","")
  if (cnt) {
    $notify( "⚠️⚠️ 将尝试解析该资源" + "⟦" + subtag + "⟧" , "🚥 请正确使用GitHub的 raw 链接" , "❌ 你的链接："+link0+"\n✅ 正确链接："+rawlink, {"open-url":rawlink})
  } else if(content0.indexOf("gridcell")!=-1) {
    $notify( "⚠️⚠️ 解析该资源" + " ⟦" + subtag + "⟧ 失败" , "🚥 你的链接似乎是目录，而不是文件" , "❌ 你的链接："+link0, {"open-url":link0})
  }
  return cnt
}

function CDN(cnt) {
  console.log("CDN start")
  cnt = cnt.join("\n").replace(/https:\/\/raw.githubusercontent.com\/(.*?)\/(.*?)\/(.*)/gmi,"https://cdn.jsdelivr.net/gh/$1/$2@$3")
  return cnt
}

//url-regex 转换成 Quantumult X
function URX2QX(subs) {
    var nrw = []
    var rw = ""
    subs = subs.split("\n")
    var NoteK = ["//", "#", ";"];  //排除注释项
    for (var i = 0; i < subs.length; i++) {
        const notecheck = (item) => subs[i].indexOf(item) == 0
        if (!NoteK.some(notecheck)) {
        if (subs[i].slice(0, 9) == "URL-REGEX") {  // regex 类型
            rw = subs[i].replace(/ /g, "").split(",REJECT")[0].split("GEX,")[1] + " url " + "reject-200"
            nrw.push(rw)
        } else if (subs[i].indexOf("data=") != -1 && subs.indexOf("[Map Local]") != -1){ // Map Local 类型
            rw = subs[i].replace(/ /g, "").split("data=")[0] + " url " + "reject-dict"
            nrw.push(rw)
        } 
    }
    }
    return nrw
}

//script&rewrite 转换成 Quantumult X
function SCP2QX(subs) {
  var nrw = []
  var rw = ""
  subs = subs.split("\n").map(x => x.trim().replace(/\s+/g," "))
  for (var i = 0; i < subs.length; i++) {
    try {
      if (subs[i].slice(0, 8) == "hostname") {
        hn = subs[i].replace(/\%.*\%/g, "")
        nrw.push(hn)
      }
      var SC = ["type=", ".js", "pattern=", "script-path="]
      var NoteK = ["//", "#", ";"]; //排除注释项
      const sccheck = (item) => subs[i].indexOf(item) != -1
      const notecheck = (item) => subs[i].indexOf(item) == 0
      if (!NoteK.some(notecheck)){
        if (SC.every(sccheck)) { // surge js 新格式
          ptn = subs[i].replace(/\s/gi,"").split("pattern=")[1].split(",")[0]
          js = subs[i].replace(/\s/gi,"").split("script-path=")[1].split(",")[0]
          type = subs[i].replace(/\s/gi,"").split("type=")[1].split(",")[0].trim()
          subsi = subs[i].replace(/ /g,"").replace(/\=true/g,"=1")
          if (type == "http-response" && subsi.indexOf("requires-body=1") != -1) {
            type = "script-response-body "
          } else if (type == "http-response" && subsi.indexOf("requires-body=1") == -1) {
            type = "script-response-header "
          } else if (type == "http-request" && subsi.indexOf("requires-body=1") != -1) {
            type = "script-request-body "
          } else if (type == "http-request" && subsi.indexOf("requires-body=1") == -1) {
            type = "script-request-header "
          } else {type = "" }
          if (type != "") {
            rw = ptn + " url " + type + js
            nrw.push(rw)
          }
        } else if (subs[i].indexOf(" 302") != -1 || subs[i].indexOf(" 307") != -1) { //rewrite 302&307 复写
          //tpe = subs[i].indexOf(" 302") != -1? "302":"307"
          rw = subs[i].split(" ")[0] + " url " + subs[i].split(" ")[2] + " " + subs[i].split(" ")[1].trim()
          //if(rw.indexOf("307")!=-1) {$notify("XX",subs[i],rw.split(" "))}
          nrw.push(rw)
        } else if(subs[i].split(" ")[2] == "header") { // rewrite header 类型
          var pget = subs[i].split(" ")[0].split(".com")[1]
          var pgetn = subs[i].split(" ")[1].split(".com")[1]
          rw = subs[i].split(" ")[0] + " url 302 " + subs[i].split(" ")[1]
          //rw = subs[i].split(" ")[0] + " url request-header ^GET " + pget +"(.+\\r\\n)Host:.+(\\r\\n) request-header GET " + pgetn + "$1Host: " + subs[i].split(" ")[1].split("://")[1].split(".com")[0] + ".com$2"
          nrw.push(rw)
        } else if(subs[i].split(" ")[1] == "header-replace") { // rewrite header-replace 类型
          console.log(subs[i])
          var pget = subs[i].split("header-replace")[1].split(":")[0].trim()
          var pgetn = subs[i].split("header-replace")[1].trim()
          rw = subs[i].split(" ")[0] + " url request-header " +"(.+\\r\\n)"+pget+":.+(\\r\\n) request-header " + "$1" + pgetn + "$2"
          nrw.push(rw)
        } else if(subs[i].indexOf(" - reject") != -1) { // rewrite reject 类型
          rw = subs[i].split(" ")[0] + " url reject-200"
          nrw.push(rw)
        } else if (subs[i].indexOf("script-path") != -1) { //surge js 旧写法
          type = subs[i].replace(/\s+/g," ").split(" ")[0]
          js = subs[i].split("script-path")[1].split("=")[1].split(",")[0]
          ptn = subs[i].replace(/\s+/g," ").split(" ")[1]
          subsi = subs[i].replace(/ /g,"").replace(/\=true/g,"=1")
          if (type == "http-response" && subsi.indexOf("requires-body=1") != -1) {
            type = "script-response-body "
          } else if (type == "http-response" && subsi.indexOf("requires-body=1") == -1) {
            type = "script-response-header "
          } else if (type == "http-request" && subsi.indexOf("requires-body=1") != -1) {
            type = "script-request-body "
          } else if (type == "http-request" && subsi.indexOf("requires-body=1") == -1) {
            type = "script-request-header "
          } else {type = "" }
          if (type != "") {
            rw = ptn + " url " + type + js
            nrw.push(rw)
          }
          
        }
      }
    } catch (err) {
      $notify("❌️解析此条时出现错误，已忽略",subs[i],err)
    }
  }
  return nrw
}
// 如果 URL-Regex 跟 rewrite/script 都需要
function SGMD2QX(subs) {
    var nrw0 = URX2QX(subs)
    var nrw1 = SCP2QX(subs)
    var nrwt = [...nrw0, ...nrw1]
    return nrwt
}

//Rewrite过滤，使用+连接多个关键词(逻辑"或"):in 为保留，out 为排除
function Rewrite_Filter(subs, Pin, Pout,Preg) {
    var Nlist = [];
    var noteK = ["//", "#", ";"];
    var hnc = 0;
    var dwrite = []
    var hostname = ""
    for (var i = 0; i < subs.length; i++) {
        subi = subs[i].trim();
        var subii = subi.replace(/ /g, "")
        if (subi != "" && (subi.indexOf(" url ")!=-1 || /^hostname\=/.test(subii))) {
            const notecheck = (item) => subi.indexOf(item) == 0
            if (noteK.some(notecheck)) { // 注释项跳过 
                continue;
            } else if (hnc == 0 && subii.indexOf("hostname=") == 0) { //hostname 部分
                hostname = (Phin0 || Phout0 || Preg) ? HostNamecheck(subi, Phin0, Phout0) : subi;//hostname 部分
            } else if (subii.indexOf("hostname=") != 0) { //rewrite 部分
                var inflag = Rcheck(subi, Pin);
                var outflag = Rcheck(subi, Pout);
                if (outflag == 1 || inflag == 0) {
                    dwrite.push(subi.replace(" url "," - ")); //out 命中
                } else if (outflag == 0 && inflag != 0) { //out 未命中 && in 未排除
                    Nlist.push(subi);
                } else if (outflag == 2 && inflag != 0) { //无 out 参数 && in 未排除
                    Nlist.push(subi);
                }
            }
        }
    }
    if (Pntf0 != 0) {
        nowrite = dwrite.length <= 10 ? emojino[dwrite.length] : dwrite.length
        no1write = Nlist.length <= 10 ? emojino[Nlist.length] : Nlist.length
        if (Pin0 && no1write != " 0️⃣ ") { //有 in 参数就通知保留项目
            $notify("🤖 " + "重写引用  ➟ " + "⟦" + subtag + "⟧", "⛔️ 筛选参数: " + pfi + pfo, "☠️ 重写 rewrite 中保留以下" + no1write + "个匹配项:" + "\n ⨷ " + Nlist.join("\n ⨷ "), rwrite_link)
        } else if (dwrite.length > 0) {
            $notify("🤖 " + "重写引用  ➟ " + "⟦" + subtag + "⟧", "⛔️ 筛选参数: " + pfi + pfo, "☠️ 重写 rewrite 中已禁用以下" + nowrite + "个匹配项:" + "\n ⨷ " + dwrite.join("\n ⨷ "), rwrite_link)
        }
    }
    if (Nlist.length == 0) { $notify("🤖 " + "重写引用  ➟ " + "⟦" + subtag + "⟧", "⛔️ 筛选参数: " + pfi + pfo, "⚠️ 筛选后剩余rewrite规则数为 0️⃣ 条, 请检查参数及原始链接", nan_link) }
    if(Preg){ Nlist = Nlist.map(Regex).filter(Boolean) // regex to filter rewrites
    	RegCheck(Nlist, "重写引用", Preg) }
    if (hostname != "") { Nlist.push(hostname) }
    Nlist =Phide ==1? Nlist : [...dwrite,...Nlist]
    return Nlist
}

// 主机名处理
function HostNamecheck(content, parain, paraout) {
    var hname = content.replace(/ /g, "").split("=")[1].split(",");
    var nname = [];
    var dname = []; //删除项
    for (var i = 0; i < hname.length; i++) {
        dd = hname[i]
        const excludehn = (item) => dd.indexOf(item) != -1;
        if (paraout && paraout != "") { //存在 out 参数时
            if (!paraout.some(excludehn)) { //out 未命中🎯️
                if (parain && parain != "") {
                    if (parain.some(excludehn)) { //Pin 命中🎯️
                        nname.push(hname[i])
                    } else {
                        dname.push(hname[i])
                    } //Pin 未命中🎯️的记录
                } else { nname.push(hname[i]) }	//无in 参数		
            } else { dname.push(hname[i]) } //out 参数命中
        } else if (parain && parain != "") { //不存在 out，但有 in 参数时
            if (parain.some(excludehn)) { //Pin 命中🎯️
                nname.push(hname[i])
            } else { dname.push(hname[i]) }
        } else {
            nname.push(hname[i])
        }
    } //for j
    if (Pntf0 != 0) {
        if (paraout || parain) {
            var noname = dname.length <= 10 ? emojino[dname.length] : dname.length
            var no1name = nname.length <= 10 ? emojino[nname.length] : nname.length
            if (parain && no1name != " 0️⃣ ") {
                $notify("🤖 " + "重写引用  ➟ " + "⟦" + subtag + "⟧", "⛔️ 筛选参数: " + pfihn + pfohn, "☠️ 主机名 hostname 中已保留以下" + no1name + "个匹配项:" + "\n ⨷ " + nname.join(","), rwhost_link)
            } else if (dname.length > 0) {
                $notify("🤖 " + "重写引用  ➟ " + "⟦" + subtag + "⟧", "⛔️ 筛选参数: " + pfihn + pfohn, "☠️ 主机名 hostname 中已删除以下" + noname + "个匹配项:" + "\n ⨷ " + dname.join(","), rwhost_link)
            }
        }
    }
    if (nname.length == 0) {
        $notify("🤖 " + "重写引用  ➟ " + "⟦" + subtag + "⟧", "⛔️ 筛选参数: " + pfihn + pfohn, "⚠️ 主机名 hostname 中剩余 0️⃣ 项, 请检查参数及原始链接", nan_link)
    }
    if(Preg){ nname = nname.map(Regex).filter(Boolean)
    	RegCheck(nname, "主机名hostname", Preg) }
    hname = "hostname=" + nname.join(", ");
    return hname
}

//Rewrite 筛选的函数
function Rcheck(content, param) {
    name = content.toUpperCase()
    if (param) {
        var flag = 0; //没命中
        const checkpara = (item) => name.indexOf(item.toUpperCase()) != -1;
        if (param.some(checkpara)) {
            flag = 1 //命中
        }
        return flag
    } else { //if param
        return 2
    } //无参数
}

//分流规则转换及过滤，可用于 surge 及 quanx 的 rule-list
function Rule_Handle(subs, Pout, Pin) {
    cnt = subs //.split("\n");
    Tin = Pin; //保留参数
    Tout = Pout; //过滤参数
    ply = Ppolicy; //策略组
    var nlist = []
    var RuleK = ["//", "#", ";"];
    var RuleK2 = ["host,", "-suffix,", "domain,", "-keyword,", "ip-cidr,", "ip-cidr6,",  "geoip,", "user-agent,", "ip6-cidr,"];
    if (Tout != "" && Tout != null) { // 有 out 参数时
        var dlist = [];
        for (var i = 0; i < cnt.length; i++) {
            cc = cnt[i].replace(/^\s*\-\s/g,"").trim()
            const exclude = (item) => cc.indexOf(item) != -1; // 删除项
            const RuleCheck = (item) => cc.indexOf(item) != -1; //无视注释行
            if (Tout.some(exclude) && !RuleK.some(RuleCheck)) {
                dlist.push(Rule_Policy("-" + cc))
            } else if (!RuleK.some(RuleCheck) && cc) { //if Pout.some, 不操作注释项
                dd = Rule_Policy(cc);
                if (Tin != "" && Tin != null) {
                    const include = (item) => dd.indexOf(item) != -1; // 保留项
                    if (Tin.some(include)) {
                        nlist.push(dd);
                    }
                } else {
                    nlist.push(dd);
                }
            } //else if cc
        }//for cnt
        var no = dlist.length <= 10 ? emojino[dlist.length] : dlist.length
        if (dlist.length > 0) {
            if (Pntf0 != 0) { $notify("🤖 " + "分流引用  ➟ " + "⟦" + subtag + "⟧", "⛔️ 禁用: " + Tout, "☠️ 已禁用以下" + no + "条匹配规则:" + "\n ⨷ " + dlist.join("\n ⨷ "), rule_link) }
        } else { $notify("🤖 " + "分流引用  ➟ " + "⟦" + subtag + "⟧", "⛔️ 禁用: " + Tout, "⚠️ 未发现任何匹配项, 请检查参数或原始链接", nan_link) }
        if (Tin != "" && Tin != null) {  //有 in 跟 out 参数时
            if (nlist.length > 0) {
                var noin0 = nlist.length <= 10 ? emojino[nlist.length] : nlist.length
                if (Pntf0 != 0) {
                    $notify("🤖 " + "分流引用  ➟ " + "⟦" + subtag + "⟧", "✅ 保留:" + Tin, "🎯 已保留以下 " + noin0 + "条匹配规则:" + "\n ⨁ " + nlist.join("\n ⨁ "), rule_link)
                }
            } else {
                $notify("🤖 " + "分流引用  ➟ " + "⟦" + subtag + "⟧", "✅ 保留:" + Tin + ",⛔️ 禁用: " + Tout, "⚠️ 筛选后剩余规则数为 0️⃣ 条, 请检查参数及原始链接", nan_link)
            }
        } else {// if Tin (No Tin)
            if (nlist.length == 0) {
                $notify("🤖 " + "分流引用  ➟ " + "⟦" + subtag + "⟧", "⛔️ 禁用: " + Tout, "⚠️ 筛选后剩余规则数为 0️⃣ 条, 请检查参数及原始链接", nan_link)
            }
        }
      nlist =Phide ==1? nlist : [...dlist,...nlist]
        return nlist;
    } else if (Tin != "" && Tin != null) { //if Tout
        var dlist = [];
        for (var i = 0; i < cnt.length; i++) {
            cc = cnt[i].replace(/^\s*\-\s/g,"").trim()
            const RuleCheck = (item) => cc.indexOf(item) != -1; //无视注释行
            if (!RuleK.some(RuleCheck) && cc) { //if Pout.some, 不操作注释项
                dd = Rule_Policy(cc);
                const include = (item) => dd.indexOf(item) != -1; // 保留项
                if (Tin.some(include)) {
                    nlist.push(dd);
                } else { dlist.push("-" + dd) }
            }
        } // for cnt
        if (nlist.length > 0) {
            var noin = nlist.length <= 10 ? emojino[nlist.length] : nlist.length
            if (Pntf0 != 0) {
                $notify("🤖 " + "分流引用  ➟ " + "⟦" + subtag + "⟧", "✅ 保留:" + Tin, "🎯 已保留以下 " + noin + "条匹配规则:" + "\n ⨁ " + nlist.join("\n ⨁ "), rule_link)
            }
        } else { $notify("🤖 " + "分流引用  ➟ " + "⟦" + subtag + "⟧", "✅ 保留:" + Tin, "⚠️ 筛选后剩余规则数为 0️⃣ 条, 请检查参数及原始链接", nan_link) }
      nlist =Phide ==1? nlist : [...dlist,...nlist]
      return nlist;
    } else {  //if Tin
        return cnt.map(Rule_Policy)
    }
}

function Rule_Policy(content) { //增加、替换 policy
    var cnt = content.replace(/^\s*\-\s/g,"").replace(/REJECT-TINYGIF/gi,"reject").trim().split("//")[0].split(",");
    var RuleK = ["//", "#", ";"];
    var RuleK1 = ["host", "domain", "ip-cidr", "geoip", "user-agent", "ip6-cidr"];
    const RuleCheck = (item) => cnt[0].trim().toLowerCase().indexOf(item) == 0; //无视注释行
    const RuleCheck1 = (item) => cnt[0].trim().toLowerCase().indexOf(item) != -1; //无视 quanx 不支持的规则类别
    if (RuleK1.some(RuleCheck1)) {
        if (cnt.length == 3 && cnt.indexOf("no-resolve") == -1) {
            ply0 = Ppolicy != "Shawn" ? Ppolicy : cnt[2]
            nn = cnt[0] + ", " + cnt[1] + ", " + ply0
        } else if (cnt.length == 2) { //Surge rule-set
            ply0 = Ppolicy != "Shawn" ? Ppolicy : "Shawn"
            nn = cnt[0] + ", " + cnt[1] + ", " + ply0
        } else if (cnt.length == 3 && cnt[2].indexOf("no-resolve") != -1) {
            ply0 = Ppolicy != "Shawn" ? Ppolicy : "Shawn"
            nn = cnt[0] + ", " + cnt[1] + ", " + ply0 + ", " + cnt[2]
        } else if (cnt.length == 4 && cnt[3].indexOf("no-resolve") != -1) {
            ply0 = Ppolicy != "Shawn" ? Ppolicy : cnt[2]
            nn = cnt[0] + ", " + cnt[1] + ", " + ply0 + ", " + cnt[3]
        } else if (!RuleK.some(RuleCheck) && content) {
            //$notify("未能解析" + "⟦" + subtag + "⟧" + "其中部分规则:", content, nan_link);
            return ""
        } else { return "" }
        if (cnt[0].indexOf("URL-REGEX") != -1 || cnt[0].indexOf("PROCESS") != -1) {
            nn = ""
        } else { nn = nn.replace("IP-CIDR6", "ip6-cidr") }
        return nn
    } else { return "" }//if RuleK1 check	
}

// Domain-Set
function Domain2Rule(content) {
    var cnt = content.split("\n");
    var RuleK = ["//", "#", ";"]
    var nlist = []
    for (var i = 0; i< cnt.length; i++) {
        cc = cnt[i].trim();
        const RuleCheck = (item) => cc.indexOf(item) != -1; //无视注释行
        if(!RuleK.some(RuleCheck) && cc) {
            if (cc[0] == "."){
                nlist.push("host-suffix, " + cc.slice(1 , cc.length) )
            } else {
                nlist.push("host, " + cc )
            }
        }
    }
    return nlist.join("\n")
}
// filter 正则指定替换 regex1@policy1+regex2@policy2
function policy_sets(cnt,para) {
  pcnt = para.split("+")
  cnt=cnt//.split("\n")
  for (i=0;i<pcnt.length;i++){
    console.log(pcnt[i])
    if (pcnt[i].indexOf("@")!=-1){
      cnt = cnt.map(item => filter_set(item, pcnt[i]))
    }
  }
  cnt=cnt.filter(Boolean)//.join("\n")
  return cnt
  console.log(cnt)
}

function filter_set(cnt,para){
  if (cnt){
    paras=[para.split("@")[0],para.slice(para.split("@")[0].length+"@".length)]
    console.log(para.split("@")[0].length+"@".length,paras)
    cnt = cnt.split(",")
    reg = RegExp(paras[0])
    console.log(paras,cnt)
    if(cnt.length == 3){
      if (reg.test(cnt[1]) || reg.test(cnt[2])) {
        cnt[2] = paras[1]
      }
    }
    return cnt.join(",")
  }
}


// 正则替换 filter/rewrite 的部分
// 用途：如 tiktok 换区: JP -> KR ，如淘宝比价脚本 -> lite 横幅通知版本
function ReplaceReg(cnt, para) {
    var cnt0 = cnt//.join("\n")
    //$notify("0","",cnt0)
    var pp = para.replace(/\\\@/g,"atsymbol").replace(/\\\+/g,"plussymbol").split("+");
    for (var i = 0; i < pp.length; i++) {
        var p1 = decodeURIComponent(pp[i].split("@")[0]).replace(/atsymbol/g,"\@").replace(/plussymbol/g,"\\\+").replace(/\，/g,",");
        var p2 = decodeURIComponent(pp[i].split("@")[1]).replace(/atsymbol/g,"@").replace(/plussymbol/g,"+").replace(/\，/g,",");
        p1 = new RegExp(p1, "gmi");
        cnt0 = cnt0.map(item => item.replace(p1, p2));
        //$notify(p1,p2,cnt0)
    }
  //$notify("1","",cnt0)
    return cnt0//.split("\n")
}

//混合订阅类型，用于未整体进行 base64 encode 的类型
function Subs2QX(subs, Pudp, Ptfo, Pcert0, PTls13) {
    var list0 = subs.split("\n");
    var QuanXK = ["shadowsocks=", "trojan=", "vmess=", "http="];
    var SurgeK = ["=ss,", "=vmess,", "=trojan,", "=http,", "=custom,"];
    var LoonK = ["=shadowsocks", "=shadowsocksr"]
    var QXlist = [];
    var failedList = [];
    for (var i = 0; i < list0.length; i++) {
        var node = ""
        if (list0[i].trim().length > 3 && !/\;|\/|\#/.test(list0[i][0])) {
            var type = list0[i].split("://")[0].trim()
            var listi = list0[i].replace(/ /g, "")
            var tag0 = list0[i].indexOf("tag=")!=-1 ? list0[i].split(/\&*(emoji|udp|tf0|cert|rename|replace)\=/)[0].split("tag=")[1] : ""
            list0[i] = (type == "vmess" || type=="ssr") ? list0[i].split("#")[0] : list0[i]
            const NodeCheck = (item) => listi.toLowerCase().indexOf(item) != -1;
            try {
                if (type == "vmess" && list0[i].indexOf("remarks=") == -1) {
                    var bnode = Base64.decode(list0[i].split("vmess://")[1])
                    if (bnode.indexOf("over-tls=") == -1) { //v2rayN
                        node = V2QX(list0[i], Pudp, Ptfo, Pcert0, PTls13)
                    } else { //quantumult 类型
                        node = VQ2QX(list0[i], Pudp, Ptfo, Pcert0, PTls13)
                    }
                  node = tag0 != "" ? URI_TAG(node, tag0) : node
                } else if (type == "vmess" && list0[i].indexOf("remarks=") != -1) { //shadowrocket 类型
                    node = VR2QX(list0[i], Pudp, Ptfo, Pcert0, PTls13)
                    node = tag0 != "" ? URI_TAG(node, tag0) : node
                } else if (type == "ssr") {
                    node = SSR2QX(list0[i], Pudp, Ptfo)
                    node = tag0 != "" ? URI_TAG(node, tag0) : node
                } else if (type == "ss") {
                    node = SS2QX(list0[i], Pudp, Ptfo)
                    node = tag0 != "" ? URI_TAG(node, tag0) : node
                } else if (type == "ssd") {
                    node = SSD2QX(list0[i], Pudp, Ptfo)
                } else if (type == "trojan") {
                    node = TJ2QX(list0[i], Pudp, Ptfo, Pcert0, PTls13)
                    node = tag0 != "" ? URI_TAG(node, tag0) : node
                } else if (type == "https" && list0[i].indexOf(",") == -1) {
                    if (listi.indexOf("@") != -1) {
                        node = HPS2QX(list0[i], Ptfo, Pcert0, PTls13)
                        node = tag0 != "" ? URI_TAG(node, tag0) : node
                    } else {
                        var listh = Base64.decode(listi.split("https://")[1].split("#")[0])
                        listh = "https://" + listh + "#" + listi.split("https://")[1].split("#")[1]
                        node = HPS2QX(listh, Ptfo, Pcert0, PTls13)
                        node = tag0 != "" ? URI_TAG(node, tag0) : node
                    }
                } else if (QuanXK.some(NodeCheck)) {
                    node = QX_TLS(isQuanX(list0[i])[0], Pcert0, PTls13)
                } else if (SurgeK.some(NodeCheck)) {
                    node = QX_TLS(Surge2QX(list0[i])[0], Pcert0, PTls13)
                } else if (LoonK.some(NodeCheck)) {
                    node = Loon2QX(list0[i])
                }
            } catch (e) {
                failedList.push(`<<<\nContent: ${list0[i]}\nError: ${e}`)
            }
            if (node instanceof Array) {
                for (var j in node) {
                  node[j] = Pudp != 0 ? XUDP(node[j],Pudp) : node[j]
                  node[j] = Ptfo != 0 ? XTFO(node[j],Ptfo) : node[j]
                    QXlist.push(node[j])
                }
            } else if (node != ""  && node) {
              node = Pudp != 0 ? XUDP(node,Pudp) : node
              node = Ptfo != 0 ? XTFO(node,Ptfo) : node
                QXlist.push(node)
            }
        }
    }
    if (failedList.length > 0 && Pntf0 != 0) {
        $notify(`⚠️ 有 ${failedList.length} 条数据解析失败, 已忽略`, "出错内容👇", failedList.join("\n"));
    }
    return QXlist;
}

// qx 类型 tls/udp 验证问题
function QX_TLS(cnt,Pcert0,PTls13) {
  var cert0 = Pcert0 == 1? "tls-verification=true, " : "tls-verification=false, "
  if(cnt.indexOf("tls-verification") != -1){
    cnt = cnt.replace(RegExp("tls\-verification.*?\,", "gmi"), cert0)
  }else if(cnt.indexOf("obfs=over-tls")!=-1 || cnt.indexOf("obfs=wss")!=-1){
    cnt = cnt.replace(new RegExp("tag.*?\=", "gmi"), cert0+"tag=")
  }
  if (cnt.trim().indexOf("shadowsocks")!=0) { //关闭非 ss/ssr 类型的 udp
    udp =  "udp-relay=false, "
    if(cnt.indexOf("udp-relay") != -1){
      var cnt = cnt.replace(RegExp("udp\-relay.*?\,", "gmi"), udp)
    }else{
      var cnt = cnt.replace(new RegExp("tag.*?\=", "gmi"), udp+"tag=")
    }
  }   
  return cnt
}

//将sip008格式的订阅转换成quanx格式
function SIP2QuanX (cnt) {
  cnt = JSON.parse(cnt)
  ll =cnt.length
  nodes =[]
  for (i=0; i<ll; i++) {
    node = "shadowsocks= "
    cnti = cnt[i]
    ip = cnti.server + ":" + cnti.server_port
    mtd = "method=" + cnti.method
    pwd = "password=" + cnti.password
    obfs = cnti.plugin_opts? cnti.plugin_opts.replace(";", ", "):""
    tag = "tag="+cnti.remarks
    node = node +[ip,pwd, mtd, obfs, tag].filter(Boolean).join(", ")
    nodes.push(node)
  }
  return nodes.join("\n")
  //console.log(nodes)
}

//http=example.com:443, username=name, password=pwd, over-tls=true, tls-host=example.com, tls-verification=true, tls13=true, fast-open=false, udp-relay=false, tag=http-tls-02
//HTTPS 类型 URI 转换成 QUANX 格式
function HPS2QX(subs, Ptfo, Pcert0, PTls13) {
    var server = subs.replace("https://", "").trim()//Base64.decode(subs.replace("https://", "")).trim().split("\u0000")[0];
    var nss = []
    if (server != "") {
        var ipport = "http=" + server.split("@")[1].split("#")[0].split("/")[0];
        var uname = "username=" + server.split(":")[0];
        var pwd = "password=" + server.split("@")[0].split(":")[1];
        var tag = "tag=" + server.split("#")[1];
        var tls = "over-tls=true";
        var cert = Pcert0 != 0 ? "tls-verification=true" : "tls-verification=false";
        var tfo = Ptfo == 1 ? "fast-open=true" : "fast-open=false";
        var tls13 = PTls13 == 1 ? "tls13=true" : "tls13=false";
        nss.push(ipport, uname, pwd, tls, cert, tfo, tls13, tag)
    }
    var QX = nss.join(",");
    return QX
}

//quantumult 格式的 vmess URI 转换
function VQ2QX(subs, Pudp, Ptfo, Pcert0, PTls13) {
  var server = String(Base64.decode(subs.replace("vmess://", "").trim()).split("\u0000")[0])
  var node = ""
  var ip = "vmess=" + server.split(",")[1].trim() + ":" + server.split(",")[2].trim() + ", " + "method=aes-128-gcm, " + "password=" + server.split(",")[4].split("\"")[1] + ", "
  var tag = "tag=" + server.split("=")[0]
  var tfo = subs.indexOf("tfo=1") != -1 ? "fast-open=true, " : "fast-open=false, "
  var udp = Pudp == 1 ? "udp-relay=false, " : "udp-relay=false, "; // 不支持 vmess 类型 udp
  node = ip + tfo + udp
  var obfs = ""
  if (server.indexOf("obfs=") == -1) { // 非 ws/http 类型
    obfs = server.indexOf("over-tls=true") != -1 ? "obfs=over-tls, " : "" //over-tls
    var host = server.indexOf("tls-host") != -1 ? "obfs-host=" + server.split("tls-host=")[1].split(",")[0] + ", " : ""
    obfs = obfs + host
  } else if (server.indexOf("obfs=ws") != -1) {
    obfs = server.indexOf("over-tls=true") != -1 ? "obfs=wss, " : "obfs=ws, " //ws,wss 类型
    var uri = server.indexOf("obfs-path=") != -1 ? "obfs-uri=" + server.split("obfs-path=")[1].split("\"")[1] + ", " : "obfs-uri=/, "
    obfs = obfs + uri
    var host = server.indexOf("obfs-header=") != -1 ? "obfs-host=" + server.split("obfs-header=\"Host:")[1].split("[")[0].trim() + ", " : ""
    obfs = obfs + host
  } else if (server.indexOf("obfs=http") != -1) {
    obfs = "obfs=http, "
    var uri = server.indexOf("obfs-path=") != -1 ? "obfs-uri=" + server.split("obfs-path=")[1].split("\"")[1] + ", " : "obfs-uri=/, "
    obfs = obfs + uri
    var host = server.indexOf("obfs-header=") != -1 ? "obfs-host=" + server.split("obfs-header=\"Host:")[1].split("[")[0].trim() + ", " : ""
    obfs = obfs + host
  }
  if (obfs.indexOf("obfs=over-tls") != -1 || obfs.indexOf("obfs=wss") != -1) {
    var cert = Pcert0 != 0 || subs.indexOf("allowInsecure=1") != -1 ? "tls-verification=false, " : "tls-verification=true, "
    var tls13 = PTls13 == 1 ? "tls13=true, " : ""
    obfs = obfs + cert + tls13
  }
  node = node + obfs + tag
  return node
}


//Shadowrocket 格式的 vmess URI 转换
function VR2QX(subs, Pudp, Ptfo, Pcert0, PTls13) {
  var server = String(Base64.decode(subs.replace("vmess://", "").split("?remarks")[0]).trim()).split("\u0000")[0]
  var node = ""
  var ip = "vmess=" + server.split("@")[1] + ", " + "method=aes-128-gcm, " + "password=" + server.split("@")[0].split(":")[1] + ", "
  var tag = "tag=" + decodeURIComponent(subs.split("remarks=")[1].split("&")[0])
  var tfo = subs.indexOf("tfo=1") != -1 ? "fast-open=true, " : "fast-open=false, "
  var udp = Pudp == 1 ? "udp-relay=false, " : "udp-relay=false, ";
  node = ip + tfo + udp
  var obfs = subs.split("obfs=")[1].split("&")[0]
  if (obfs == "none") { //
    obfs = subs.indexOf("tls=1") != -1 ? "obfs=over-tls, " : "" //over-tls
  } else if (obfs == "websocket" || obfs == "http") {
    console.log(obfs)
    obfs = obfs == "http" ? "obfs=http, " : "obfs=ws, " // http 类型
    obfs = subs.indexOf("tls=1") != -1 ? "obfs=wss, " : obfs //ws,wss 类型
    var ouri = subs.indexOf("&path=") != -1 ? subs.split("&path=")[1].split("&")[0] : "/" //ws,wss 类型
    obfs = obfs + "obfs-uri=" + ouri + ", "
    var host = subs.indexOf("&obfsParam=") != -1 ? decodeURIComponent(subs.split("&obfsParam=")[1].split("&")[0]) : ""
    if (host.indexOf("\"Host\"")!=-1 && host.indexOf("{")!=-1) {
      host = JSON.parse(host)["Host"]
    }
    host = host!="{}"? "obfs-host=" + host + ", " : ""
    obfs = obfs + host
  }
  if (obfs.indexOf("obfs=over-tls") != -1 || obfs.indexOf("obfs=wss") != -1) {
    var cert = Pcert0 != 0 || subs.indexOf("allowInsecure=1") != -1 ? "tls-verification=false, " : "tls-verification=true, "
    var tls13 = PTls13 == 1 ? "tls13=true, " : ""
    obfs = obfs + cert + tls13
  }
  node = node + obfs + tag
  return node
}


//V2RayN uri转换成 QUANX 格式
function V2QX(subs, Pudp, Ptfo, Pcert0, PTls13) {
  //console.log("v2 type",subs)
  var cert = Pcert0
  var tls13 = PTls13
  var server = String(Base64.decode(subs.replace("vmess://", "")).trim()).split("\u0000")[0];
  var nss = [];
  if (server != "") {
    ss = JSON.parse(server);
    ip = "vmess=" + ss.add + ":" + ss.port;
    pwd = "password=" + ss.id;
    
    mtd = "method=aes-128-gcm"
    try {
      tag = "tag=" + decodeURIComponent(ss.ps);
    } catch (e) {
      tag = "tag=" + ss.ps;
    }
    udp = Pudp == 1 ? "udp-relay=false" : "udp-relay=false";
    tfo = Ptfo == 1 ? "fast-open=true" : "fast-open=false";
    obfs = Pobfs(ss, cert, tls13);
    if (obfs == "" || obfs == undefined) {
      nss.push(ip, mtd, pwd, tfo, udp, tag)
    } else if(obfs != "NOT-SUPPORTTED"){
      nss.push(ip, mtd, pwd, obfs, tfo, udp, tag);
    }
    QX = nss.join(", ");
  }
  return QX
}

// Vmess obfs 参数
function Pobfs(jsonl, Pcert0, PTls13) {
  var obfsi = [];
  var cert = Pcert0;
  tcert = cert == 0 ? "tls-verification=false" : "tls-verification=true";
  tls13 = PTls13 == 1 ? "tls13=true" : "tls13=false"
  if (jsonl.net == "ws" && jsonl.tls == "tls") {
    obfs0 = "obfs=wss, " + tcert + ", " + tls13 + ", ";
    uri0 = jsonl.path && jsonl.path != "" ? "obfs-uri=" + jsonl.path : "obfs-uri=/";
    uri0 = uri0.indexOf("uri=/")!=-1 ? uri0:uri0.replace("uri=","uri=/")
    host0 = jsonl.host && jsonl.host != "" ? "obfs-host=" + jsonl.host + ", " : "";
    obfsi.push(obfs0 + host0 + uri0)
    return obfsi.join(", ")
  } else if (jsonl.net == "ws") {
    obfs0 = "obfs=ws";
    uri0 = jsonl.path && jsonl.path != "" ? "obfs-uri=" + jsonl.path : "obfs-uri=/";
    uri0 = uri0.indexOf("uri=/")!=-1 ? uri0:uri0.replace("uri=","uri=/")
    host0 = jsonl.host && jsonl.host != "" ? "obfs-host=" + jsonl.host + ", " : "";
    obfsi.push(obfs0, host0 + uri0);
    return obfsi.join(", ")
  } else if (jsonl.tls == "tls" && jsonl.net == "tcp") { // 过滤掉 h2/http 等类型 
    obfs0 = "obfs=over-tls, " + tcert + ", " + tls13;
    uri0 = jsonl.path && jsonl.path != "" ? "obfs-uri=" + jsonl.path : "";
    uri0 = uri0.indexOf("uri=/")!=-1 ? uri0:uri0.replace("uri=","uri=/")
    host0 = jsonl.host && jsonl.host != "" ? ", obfs-host=" + jsonl.host : "";
    obfsi.push(obfs0 + host0)
    return obfsi.join(", ")
  } else if (jsonl.net == "tcp" && jsonl.type == "http"){
    obfs0 = "obfs=http";
    uri0 = jsonl.path && jsonl.path != "" ? "obfs-uri=" + jsonl.path : "obfs-uri=/";
    uri0 = uri0.indexOf("uri=/")!=-1 ? uri0:uri0.replace("uri=","uri=/")
    host0 = jsonl.host && jsonl.host != "" ? "obfs-host=" + jsonl.host + ", " : "";
    obfsi.push(obfs0, host0 + uri0);
    return obfsi.join(", ")
  } else if (jsonl.net !="tcp"){ // 过滤掉 h2/http 等类型
    return "NOT-SUPPORTTED"
  } else if (jsonl.net =="tcp" && jsonl.type != "none") {
    return "NOT-SUPPORTTED"
  } else {return ""}
}

//对.的特殊处理(in/out & rename中)
function Dot2(cnt) {
    cnt = cnt ? cnt.replace(/\\\./g, "这是个点") : ""
    return cnt
}

function ToDot(cnt) {
    cnt = cnt ? cnt.replace(/这是个点/g, ".") : ""
    return cnt
}

//正则筛选, 完整内容匹配
function Regex(content) {
    var Preg0 = RegExp(Preg, "i")
    cnt = content //.split("tag=")[1]
    if (Preg0.test(cnt)) {
        return content
    }
}

// 判断节点过滤的函数
function Scheck(content, param) {
    name = content.split("tag=")[1].toUpperCase()
    param = param ? param.map(Dot2) : param // 对符号.的特殊处理
    if (param) {
        var flag = 0;
        for (var i = 0; i < param.length; i++) {
            var params = param[i].split(".").map(ToDot);
            const checkpara = (item) => name.indexOf(item.toUpperCase()) != -1;
            if (params.every(checkpara)) {
                flag = 1
            }
        }//for
        return flag
    } else { //if param
        return 2
    }
}

//节点过滤，使用+连接多个关键词(逻辑"或"):in 为保留，out 为排除, "与"逻辑请用符号"."连接
function Filter(servers, Pin, Pout) {
    var Nlist = [];
    var Delist = [];
    var Nname = [];
    servers = servers.filter(Boolean)
    for (var i = 0; i < servers.length; i++) {
        if (Scheck(servers[i], Pin) != 0 && Scheck(servers[i], Pout) != 1) {
            Nlist.push(servers[i])
            Nname.push(servers[i].replace(/ /g, "").split("tag=")[1])
        } else { Delist.push(servers[i].replace(/ /g, "").split("tag=")[1]) } //记录未被保留节点
    }//for
    var no = Delist.length <= 10 ? emojino[Delist.length] : Delist.length;
    var no1 = Nlist.length <= 10 ? emojino[Nlist.length] : Nlist.length;
    if (Pntf0 == 1 && Delist.length >= 1) {//通知部分
        if (Pin && no1 > 0) { //有 in 参数就通知保留部分
            $notify("👥 引用" + "⟦" + subtag + "⟧" + " 开始节点筛选", "🕹 筛选关键字: " + pfi + pfo, "☠️ 已保留以下 " + no1 + "个节点\n" + Nname.join(", "), sub_link);
        } else if (Pout && no > 0) {
            $notify("👥 引用" + "⟦" + subtag + "⟧" + " 开始节点筛选", "🕹 筛选关键字: " + pfi + pfo, "☠️ 已删除以下 " + no + "个节点\n" + Delist.join(", "), sub_link);
        }
    } else if (no1 == 0 || no1 == null) { //无剩余节点时强制通知
        $notify("‼️ ⟦" + subtag + "⟧" + "筛选后节点数为0️⃣", "⚠️ 请自行检查原始链接以及筛选参数", link0, sub_link);
    }
    return Nlist
}

function FilterScript(servers, script) {
    $notify("🤖 启用脚本进行筛选", "", script);
    try {
        const $ = Tools();
        eval(script);
        // extract server tags
        const nodes = Tools().getNodeInfo(servers);
        const IN = filter(nodes);
        const res = servers.filter((_, i) => IN[i]);
        if (res.length === 0) {
            $notify("‼️ ⟦" + subtag + "⟧" + "筛选后节点数为0️⃣", "⚠️ 请自行检查原始链接以及筛选参数", link0, sub_link);
        }
        return res;
    } catch (err) {
        $notify("❌ 脚本筛选出现错误", "", err);
        return servers;
    }
}

//SSR 类型 URI 转换 quanx 格式
function SSR2QX(subs, Pudp, Ptfo) {
    var nssr = []
    var cnt = Base64.decode(subs.split("ssr://")[1].replace(/-/g, "+").replace(/_/g, "/")).split("\u0000")[0]
    var obfshost = '';
    var oparam = '';
    if (cnt.split(":").length <= 6) { //排除难搞的 ipv6 节点
        type = "shadowsocks=";
        ip = cnt.split(":")[0] + ":" + cnt.split(":")[1];
        pwd = "password=" + Base64.decode(cnt.split("/?")[0].split(":")[5].replace(/-/g, "+").replace(/_/g, "/")).split("\u0000")[0];
        mtd = "method=" + cnt.split(":")[3];
        obfs = "obfs=" + cnt.split(":")[4] + ", ";
        ssrp = "ssr-protocol=" + cnt.split(":")[2];
        if (cnt.indexOf("obfsparam=") != -1) {
            obfshost = cnt.split("obfsparam=")[1].split("&")[0] != "" ? "obfs-host=" + Base64.decode(cnt.split("obfsparam=")[1].split("&")[0].replace(/-/g, "+").replace(/_/g, "/")).split(",")[0].split("\u0000")[0] + ", " : ""
        }
        if (cnt.indexOf("protoparam=") != -1) {
            oparam = cnt.split("protoparam=")[1].split("&")[0] != "" ? "ssr-protocol-param=" + Base64.decode(cnt.split("protoparam=")[1].split("&")[0].replace(/-/g, "+").replace(/_/g, "/")).split(",")[0].split("\u0000")[0] + ", " : ""
        }
        tag = "tag=" + (Base64.decode(cnt.split("remarks=")[1].split("&")[0].replace(/-/g, "+").replace(/_/g, "/"))).split("\u0000")[0]
        pudp = Pudp == 1 ? "udp-relay=true" : "udp-relay=false";
        ptfo = Ptfo == 1 ? "fast-open=true" : "fast-open=false";
        nssr.push(type + ip, pwd, mtd, obfs + obfshost + oparam + ssrp, pudp, ptfo, tag)
        QX = nssr.join(", ")
    } else { QX = "" }
    return QX;
}

//Trojan 类型 URI 转换成 QX
function TJ2QX(subs, Pudp, Ptfo, Pcert0, PTls13) {
    var ntrojan = []
    var cnt = subs.split("trojan://")[1]
    type = "trojan=";
    if (cnt.indexOf(":443") != -1) {
        ip = cnt.split("@")[1].split(":443")[0] + ":443";
    } else {
        ip = cnt.split("@")[1].split("?")[0].split("\n")[0].trim(); //非 443 端口的奇葩机场？
    }
    pwd = "password=" + cnt.split("@")[0];
    obfs = "over-tls=true";
    pcert = cnt.indexOf("allowInsecure=0") != -1 ? "tls-verification=true" : "tls-verification=false";
    thost = cnt.indexOf("sni=") != -1? "tls-host="+cnt.split("sni=")[1].split(/&|#/)[0]:""
    ptls13 = PTls13 == 1 ? "tls13=true" : "tls13=false"
    if (Pcert0 == 0) { 
      pcert = "tls-verification=false" 
    } else if (Pcert0 == 1) {
      pcert = "tls-verification=true"
    }
    pudp = Pudp == 1 ? "udp-relay=false" : "udp-relay=false";
    ptfo = Ptfo == 1 ? "fast-open=true" : "fast-open=false";
    tag = cnt.indexOf("#") != -1 ? "tag=" + decodeURIComponent(cnt.split("#")[1]) : "tag= [trojan]" + ip
    ntrojan.push(type + ip, pwd, obfs, pcert, thost, ptls13, pudp, ptfo, tag)
    QX = ntrojan.filter(Boolean).join(", ");
    return QX;
}

//SS 类型 URI 转换 quanx 格式
function SS2QX(subs, Pudp, Ptfo) {
    var nssr = []
    var cnt = subs.split("ss://")[1]
    if (cnt.split(":").length <= 6) { //排除难搞的 ipv6 节点
        type = "shadowsocks=";
      let cntt = cnt.split("#")[0]
      if (cntt.indexOf("@") != -1 && cntt.indexOf(":") != -1) {
            ip = cnt.split("@")[1].split("#")[0].split("/")[0];
            pwdmtd = Base64.decode(cnt.split("@")[0].replace(/-/g, "+").replace(/_/g, "/")).split("\u0000")[0].split(":")
        } else {
            var cnt0 = Base64.decode(cnt.split("#")[0].replace(/-/g, "+").replace(/_/g, "/").split("\u0000")[0]);
            ip = cnt0.split("@")[1].split("#")[0].split("/")[0];
            pwdmtd = cnt0.split("@")[0].split(":")
        }
        pwd = "password=" + pwdmtd[1];
        mtd = "method=" + pwdmtd[0];
        obfs = cnt.split("obfs%3D")[1] != null ? ", obfs=" + cnt.split("obfs%3D")[1].split("%3B")[0].split("#")[0] : "";
        obfshost = cnt.split("obfs-host%3D")[1] != null ? ", obfs-host=" + cnt.split("obfs-host%3D")[1].split("&")[0].split("#")[0] : "";
        tag = "tag=" + decodeURIComponent(cnt.split("#")[1])
        pudp = Pudp == 1 ? "udp-relay=true" : "udp-relay=false";
        ptfo = Ptfo == 1 ? "fast-open=true" : "fast-open=false";
        nssr.push(type + ip, pwd, mtd + obfs + obfshost, pudp, ptfo, tag)
        QX = nssr.join(", ")
        return QX;
    }
}

//SSD 类型 URI 转换 quanx 格式
function SSD2QX(subs, Pudp, Ptfo) {
    var j = 0
    var QX = []
    var cnt = JSON.parse(Base64.decode(subs.split("ssd://")[1]))
    var type = "shadowsocks=";
    var pwd = "password=" + cnt.password;
    var mtd = "method=" + cnt.encryption;
    var obfs = ""
    var obfshost = ""
    var port = cnt.port ? ":" + cnt.port : ""
    if (cnt.plugin_options) {
        obfs = cnt.plugin_options.split(";")[0] != null ? ", " + cnt.plugin_options.split(";")[0] : "";
        obfshost = cnt.plugin_options.split(";")[1] != null ? ", " + cnt.plugin_options.split(";")[1] : "";
    }
    pudp = Pudp == 1 ? "udp-relay=true" : "udp-relay=false";
    ptfo = Ptfo == 1 ? "fast-open=true" : "fast-open=false";
    for (var i in cnt.servers) {
        ip = cnt.servers[i].server;
        if (cnt.servers[i].plugin_options) {
            obfs = cnt.servers[i].plugin_options.split(";")[0] != null ? ", " + cnt.servers[i].plugin_options.split(";")[0] : "";
            obfshost = cnt.servers[i].plugin_options.split(";")[1] != null ? ", " + cnt.servers[i].plugin_options.split(";")[1] : "";
        }
        if (cnt.servers[i].encryption) {  //独立的加密方式
            mtd = "method=" + cnt.servers[i].encryption
        }
        if (cnt.servers[i].password) {  //独立的密码
            pwd = "password=" + cnt.servers[i].password
        }
        if (ip.indexOf(".") > 0) { //排除难搞的 ipv6 节点
            port = cnt.servers[i].port ? ":" + cnt.servers[i].port : port;
            tag = "tag=" + cnt.servers[i].remarks;
            QX[j] = type + ip + port + ", " + pwd + ", " + mtd + obfs + obfshost + ", " + pudp + ", " + ptfo + ", " + tag;
            var j = j + 1;
        }
    }
    return QX;
}

// 纠正部分不规范的写法(没有把 tag 写在最后)
function QXFix(cntf) {
  var cnti = cntf.replace(/tag\s+\=/,"tag=").replace("chacha20-poly","chacha20-ietf-poly")
  var hd = cnti.split("tag=")[0]
  var tag = "tag="+cnti.split("tag=")[1].split(",")[0]
  var tail = cnti.split(tag+",")
  cnti = tail.length<=1?  cntf : cntf //String(hd + tail[1] +"," + tag)
  return cnti
}

// 用于过滤非节点部分（比如整份配置中其它内容）,同时纠正部分不规范的写法(没有把 tag 写在最后)
function isQuanX(content) {
    var cnts = content.split("\n");
    var nlist = []
    for (var i = 0; i < cnts.length; i++) {
        var cnti = cnts[i];
        if (cnti.indexOf("=") != -1 && cnti.indexOf("tag") != -1) {
            var cnt = cnti.split("=")[0].trim()
            if (cnt == "http" || cnt == "shadowsocks" || cnt == "trojan" || cnt == "vmess") {
                nlist.push(QXFix(cnti))
            }
        }
    }
    return nlist
}

//surge script/rewrite - > quanx
function isQuanXRewrite(content) {
  cnt = content
  cnt0=[]
  var RuleK = ["host,", "-suffix,", "domain,", "-keyword,", "ip-cidr,", "ip-cidr6,",  "geoip,", "user-agent,", "ip6-cidr,","force-http"];
  
  for (var i = 0; i< cnt.length; i++){
    if(cnt[i]){
      var cnti = cnt[i]
      const RuleCheck = (item) => cnti.toLowerCase().indexOf(item) != -1;
      
      if (cnti.indexOf("pattern")!=-1 && cnti.indexOf("type")!=-1 || cnti.indexOf("http-r")!=-1) {
        cnti=SGMD2QX(cnti)[0]? SGMD2QX(cnti)[0]:""
        //console.log(cnti)
      }else if ((cnti.indexOf(" 302")!=-1 || cnti.indexOf(" 307")!=-1) && cnti.indexOf(" url ")==-1){
        cnti=SGMD2QX(cnti)[0]? SGMD2QX(cnti)[0]:""
        //console.log("sss",cnti)
      }else if(cnti.indexOf("URL-REGEX")!=-1 || cnti.indexOf(" header")!=-1 || cnti.replace(/ /g,"").indexOf("hostname=")!=-1){
        cnti=SGMD2QX(cnti)[0]? SGMD2QX(cnti)[0]:""
      }else if(cnti.indexOf(" data=")!=-1){
        cnti=cnti.replace(/ /g, "").split("data=")[0] + " url " + "reject-dict"
      }
      if (cnti.trim()[0]!="[" && cnti.indexOf("RULE-SET")==-1 && !/cronexp\=|type\=cron/.test(cnti.replace(/ /g,"")) && !RuleK.some(RuleCheck)) {
        cnt0.push(cnti) //  排除其它项目后写入
      }
    }
  }
  //console.log(cnt0)
  return cnt0
}



//根据节点名排序(不含emoji 部分)
function QXSort(content, para) {
    var nlist = content;//.split("\n");
    if (para == 1) {
        return nlist.sort(ToTag)
    } else if (para == -1) {
        return nlist.sort(ToTagR)
    } else if(para == "x") {
        return shuffle(nlist)
    } else if(para == "0") {
        return nlist
    } else {
      return Sort_KWD (nlist,para) //关键词排序
    }
}
//正序
function ToTag(elem1, elem2) {
    var tag1 = elem1.split("tag")[1].split("=")[1].trim()
    var tag2 = elem2.split("tag")[1].split("=")[1].trim()
    res = tag1 > tag2 ? 1 : -1
    return res
}
//逆序
function ToTagR(elem1, elem2) {
    var tag1 = elem1.split("tag")[1].split("=")[1].trim()
    var tag2 = elem2.split("tag")[1].split("=")[1].trim()
    res = tag1 > tag2 ? -1 : 1
    return res
}
// 随机洗牌排序
function shuffle(arr) {
    var input = arr;
    for (var i = input.length - 1; i >= 0; i--) {
        var randomIndex = Math.floor(Math.random() * (i + 1));
        var itemAtIndex = input[randomIndex];
        input[randomIndex] = input[i];
        input[i] = itemAtIndex;
    }
    return input;
}

//根据指定规则排序
function Sort_KWD (cnt,strs) {
  strlist = strs.indexOf("<") != -1 ? strs.split("<"):strs.split(">")
  regj = strlist.map(item => RegExp(item, "i"))
  //dir = PsortX
  dir = strs.indexOf("<") != -1 ? -1:1
  var arr =  new Array(strlist.length+1);   //表格有n行
  for(var i = 0;i < arr.length; i++){
    arr[i] = [];    //每行有列
  }
  for (var i =0; i<cnt.length ; i++) {
    flag = 0
    for (var j=0; j<strlist.length ; j++){
      if(regj[j].test(cnt[i])) {
        arr[j].push(cnt[i])
        flag = 1
        break
      } 
    }
    if (flag != 1){
      arr[strlist.length].push(cnt[i]) } // 不匹配项
  }
  //console.log(arr)
  arr = PsortX == -1? arr.map(item => item.sort(ToTagR)):arr
  arr = PsortX == 1? arr.map(item => item.sort(ToTag)):arr
  newarr = MixArr(arr,dir)
  return newarr
}

function MixArr(cnt,dir){
  var cnt0=[]
  for (i=0; i<cnt.length-1; i++){
    //console.log(dir)
    cnt0 = dir ==1? cnt0.concat(cnt[i]):cnt0.concat(cnt[cnt.length-2-i])
  }
  cnt0 = dir ==1? cnt0.concat(cnt[cnt.length-1].sort(ToTag)):(cnt[cnt.length-1].sort(ToTagR)).concat(cnt0)
  return cnt0
}


//正则删除节点名内的字符
function DelReg(content) {
    delreg = RegExp(delreg, "gmi")
    cnt0 = content.split("tag=")[0]
    cnt1 = content.split("tag=")[1].split(",")[0]
    cnt2 = content.split("tag=")[1].split(",").length==1 ? "": content.split(cnt1)[1]
    cnt = cnt0 + "tag=" + cnt1.replace(delreg, "")+cnt2
    return cnt
}

//节点重命名
function Rename(str) {
    var server = str;
    if (server.indexOf("tag=") != -1) {
        hd = server.split("tag=")[0]
        name = server.split("tag=")[1].split(",")[0].trim()
        tail = server.split("tag=")[1].split(",").length <=1 ? "" : server.split("tag=")[1].split(name)[1]
        for (var i = 0; i < Prn.length; i++) {
            nname = Prn[i].split("@")[1] ? decodeURIComponent(Prn[i].split("@")[1]) : Prn[i].split("@")[1];
            oname = Prn[i].split("@")[0] ? decodeURIComponent(Prn[i].split("@")[0]) : Prn[i].split("@")[0];
            if (oname && nname) { //重命名
                var rn = escapeRegExp(oname)
                name = name.replace(new RegExp(rn, "gmi"), nname)
            } else if (oname && nname == "") {//前缀
                var nemoji = emoji_del(name)
                if ((Pemoji == 1 || Pemoji == 2) && Prname ) { //判断是否有重复 emoji，有则删除旧有
                    name = name.replace(name.split(" ")[0] + " ", name.split(" ")[0] + " " + oname)
                } else { name = oname + name.trim() }
            } else if (nname && oname == "") {//后缀
                name = name.trim() + nname
            } else if (oname && oname.indexOf("☠️") != -1) { //删除特定字符，多字符用.连接
                hh = Dot2(oname.slice(0, oname.length - 2)).split(".") //符号.的特殊处理
                for (j = 0; j < hh.length; j++) {
                    var nn = escapeRegExp(ToDot(hh[j]))
                    var del = new RegExp(nn, "gmi");
                    name = name.replace(del, "")
                }
            } else if (oname == "" && nname == "") { //仅有@时，删除@符号
                name = name.replace(/@/g, "")
            } else {
                name = name
            }
            nserver = hd + "tag=" + name + tail
        }
      return nserver
    } else {
      return server
    }
}

function RenameScript(servers, script) {
    $notify("🤖 启用脚本进行重命名", "", script);
    try {
        const $ = Tools().rename;
        // extract server tags
        const nodes = Tools().getNodeInfo(servers);
        eval(script);
        const newNames = rename(nodes);
        // rename nodes
        return servers.map((s, i) => s.split("tag=")[0] + "tag=" + newNames[i]);
    } catch (err) {
        $notify("❌ 脚本重命名出现错误", "", err);
        return servers;
    }

}

//删除 emoji 
function emoji_del(str) {
    return str.replace(/[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/g, "").trim();//unescape(escape(str).replace(/\%uD.{3}/g, ''));
}

//为节点名添加 emoji
function get_emoji(emojip, sname) {
  var Lmoji = { 
    "🏳️‍🌈": ["流量", "时间", "应急", "过期", "Bandwidth", "expire"],
    "🇦🇿": ["阿塞拜疆"],
    "🇦🇹": ["奥地利", "奧地利", "Austria", "维也纳"],
    "🇦🇺": ["AU", "Australia", "Sydney", "澳大利亚", "澳洲", "墨尔本", "悉尼" ,"土澳", "京澳","廣澳","滬澳","沪澳","广澳"],
    "🇧🇪": ["BE", "比利時","比利时"],
    "🇧🇬": ["保加利亚", "保加利亞","Bulgaria"],
    "🇵🇰": ["巴基斯坦"],
    "🇰🇭": ["柬埔寨"],
    "🇺🇦": ["烏克蘭","乌克兰"],
    "🇭🇷": ["克罗地亚","HR","克羅地亞"],
    "🇨🇦": ["CA", "Canada","CANADA", "CAN", "Waterloo", "加拿大", "蒙特利尔", "温哥华", "楓葉", "枫叶", "滑铁卢", "多伦多"],
    "🇨🇭": ["瑞士", "苏黎世", "Switzerland"],
    "🇳🇬": ["尼日利亚", "NG", "尼日利亞","拉各斯"],
    "🇨🇿": ["Czechia", "捷克"],
    "🇸🇰": ["斯洛伐克", "SK"],
    "🇷🇸": ["RS", "塞尔维亚"],
    "🇲🇩": ["摩爾多瓦","MD","摩尔多瓦"],
    "🇩🇪": ["DE", "German", "GERMAN", "德国", "德國", "法兰克福","京德","滬德","廣德","沪德","广德"],
    "🇩🇰": ["DK","DNK","丹麦","丹麥"],
    "🇪🇸": ["ES", "西班牙", "Spain"],
    "🇪🇺": ["EU", "欧盟", "欧罗巴"],
    "🇫🇮": ["Finland", "芬兰","芬蘭","赫尔辛基"],
    "🇫🇷": ["FR", "France", "法国", "法國", "巴黎"],
    "🇬🇧": ["UK", "GB", "England", "United Kingdom", "英国", "伦敦", "英"],
    "🇲🇴": ["MO", "Macao", "澳门", "澳門", "CTM"],
    "🇰🇿": ["哈萨克斯坦"],
    "🇭🇺": ["匈牙利", "Hungary"],
    "🇱🇹": ["立陶宛"],
    "🇭🇰": ["HK", "Hongkong", "Hong Kong", "HongKong", "HONG KONG","香港", "深港", "沪港", "呼港", "HKT", "HKBN", "HGC", "WTT", "CMI", "穗港", "京港", "港"],
    "🇮🇩": ["ID", "Indonesia", "印尼", "印度尼西亚", "雅加达"],
    "🇮🇪": ["Ireland", "IRELAND", "爱尔兰", "愛爾蘭", "都柏林"],
    "🇮🇱": ["Israel", "以色列"],
    "🇮🇳": ["India", "IND", "INDIA","印度", "孟买", "Mumbai"],
    "🇮🇸": ["IS","ISL", "冰岛","冰島"],
    "🇰🇵": ["KP", "朝鲜"],
    "🇰🇷": ["KR", "Korea", "KOR", "韩国", "首尔", "韩", "韓","春川"],
    "🇱🇺": ["卢森堡"],
    "🇱🇻": ["Latvia", "Latvija", "拉脱维亚"],
    "🇲🇽️": ["MEX", "MX", "墨西哥"],
    "🇲🇾": ["MY", "Malaysia","MALAYSIA", "马来西亚", "大馬", "馬來西亞", "吉隆坡"],
    "🇳🇱": ["NL", "Netherlands", "荷兰", "荷蘭", "尼德蘭", "阿姆斯特丹"],
    "🇵🇭": ["PH", "Philippines", "菲律宾", "菲律賓"],
    "🇷🇴": ["RO", "罗马尼亚"],
    "🇷🇺": ["RU", "Russia", "俄罗斯", "俄国", "俄羅斯", "伯力", "莫斯科", "圣彼得堡", "西伯利亚", "新西伯利亚", "京俄", "杭俄","廣俄","滬俄","广俄","沪俄"],
    "🇸🇦": ["沙特", "迪拜"],
    "🇸🇪": ["SE", "Sweden"],
    "🇸🇬": ["SG", "Singapore","SINGAPORE", "新加坡", "狮城", "沪新", "京新", "泉新", "穗新", "深新", "杭新", "广新","廣新","滬新"],
    "🇹🇭": ["TH", "Thailand", "泰国", "泰國", "曼谷"],
    "🇹🇷": ["TR", "Turkey", "土耳其", "伊斯坦布尔"],
    "🇹🇼": ["TW", "Taiwan","TAIWAN", "台湾", "台北", "台中", "新北", "彰化", "CHT", "台", "HINET"],
    "🇺🇸": ["US", "USA", "America", "United States", "美国", "美", "京美", "波特兰", "达拉斯", "俄勒冈", "凤凰城", "费利蒙", "硅谷", "矽谷", "拉斯维加斯", "洛杉矶", "圣何塞", "圣克拉拉", "西雅图", "芝加哥", "沪美", "哥伦布", "纽约"],
    "🇻🇳": ["VN", "越南", "胡志明市"],
    "🇮🇹": ["Italy", "IT", "Nachash", "意大利", "米兰", "義大利"],
    "🇿🇦": ["South Africa", "南非"],
    "🇦🇪": ["United Arab Emirates", "阿联酋"],
    "🇧🇷": ["BR", "Brazil", "巴西", "圣保罗"],
    "🇯🇵": ["JP", "Japan","JAPAN", "日本", "东京", "大阪", "埼玉", "沪日", "穗日", "川日", "中日", "泉日", "杭日", "深日", "辽日", "广日"],
    "🇦🇷": ["AR", "阿根廷"],
    "🇳🇴": ["Norway", "挪威", "NO"],
    "🇨🇳": ["CN", "China", "回国", "中国","中國", "江苏", "北京", "上海", "广州", "深圳", "杭州", "徐州", "青岛", "宁波", "镇江", "back"],
    "🇵🇱": ["PL", "POL", "波兰","波蘭"],
    "🇨🇱": ["智利"],
    "🇳🇿": ["新西蘭","新西兰"],
    "🇬🇷": ["希腊","希臘"],
    "🇪🇬": ["埃及"],
    "🇮🇲": ["马恩岛","馬恩島"],
    "🇧🇾": ["BY","白俄罗斯"],
    "🇵🇹": ["葡萄牙"],
    "🇲🇳": ["蒙古"],
    "🇵🇪": ["秘鲁","祕魯"],
    "🇨🇴": ["哥伦比亚"],
    "🇪🇪": ["爱沙尼亚"],
    "🇲🇰": ["马其顿","馬其頓"],
    "🇧🇦": ["波黑共和国","波黑"],
    "🇬🇪": ["格魯吉亞","格鲁吉亚"],
    "🇦🇱": ["阿爾巴尼亞","阿尔巴尼亚"]
  }
    str1 = JSON.stringify(Lmoji)
    aa = JSON.parse(str1)
    bb = JSON.parse(str1.replace(/🇹🇼/g, " 🇨🇳"))
    var cnt = emojip ==1? aa:bb;
    var flag = 0;
    for (var key in cnt) {
        dd = cnt[key]
        for (i in dd) {
            if (sname.indexOf(dd[i]) != -1) {
                flag = 1;
                nname = key + " " + sname.replace(/[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/g, "").trim(); // use regex to remove the original flag
                return [nname,key]
            }
        }
    }
    if (flag == 0) { return ["🏴‍☠️ " + sname.replace(/[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/g, "").trim(), "🏴‍☠️"] }
}

//emoji 处理
function emoji_handle(servers, Pemoji) {
    var nlist = []
    var ser0 = servers

    for (var i = 0; i < ser0.length; i++) {
        if (ser0[i].indexOf("tag=") != -1) {
            var oname = ser0[i].split("tag=")[1].trim();
            var hd = ser0[i].split("tag=")[0];
            var nname = oname;//emoji_del(oname);
            // Code: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2, Emoji: https://emojipedia.org/flags/
            if (Pemoji == 1) {
                var nname = get_emoji(1, nname)[0]
            } else if (Pemoji == 2) {
                var nname = get_emoji(2, nname)[0]
            } else if (Pemoji == -1) {
                nname = emoji_del(oname);
            }
            var nserver = hd + "tag=" + nname.replace("  ", " ").trim()
            nlist.push(nserver)
        }
    }
    return nlist
}

//Surge2QX 转换主函数
function Surge2QX(conf) {
  var QXlist = conf.split("\n").map(isSurge).filter(Boolean)
  var Nlist = []
  var node=""
  for (var i = 0; i < QXlist.length; i++) {
    var cnt = QXlist[i];
    if (cnt.split("=")[1].split(",")[0].indexOf("trojan") != -1) {
      node = Strojan2QX(cnt)//surge 3的trojan
    } else if (cnt.split("=")[1].split(",")[0].indexOf("http") != -1) {
      node = Shttp2QX(cnt) //surge 3的http
    } else if (cnt.split("=")[1].split(",")[0].indexOf("vmess") != -1) {
      node = SVmess2QX(cnt) //surge 3的Vmess
    } else if (cnt.split("=")[1].split(",")[0].indexOf("ss") != -1) {
      node = SSS2QX(cnt) //surge 3的SS
    } else if (cnt.split("=")[1].split(",")[0].indexOf("custom") != -1) {
      node = SCT2QX(cnt) //surge2写法
    }
    node = Pudp0 != 0 ? XUDP(node,Pudp0) : node
    node = Ptfo0 != 0 ? XTFO(node,Ptfo0) : node
    if (cnt.indexOf("test-url") !=-1) {
      var checkurl = ", server_check_url" + cnt.split("test-url")[1].split(",")[0]
      node = node.replace(/\,(\s)*tag/, checkurl + ", tag")
    }
    Nlist.push(node)
  }
  return (Nlist)
}


// surge2 中的 SS 类型写法(custom)
//🇷🇺 俄罗斯 GIA = custom, ip, 152, aes-128-gcm, password123, https://xxx/download/SSEncrypt.module, obfs=tls, obfs-host=xxx.windows.com, udp-relay=true
function SCT2QX(content) {
    var cnt = content;
    var tag = "tag=" + cnt.split("=")[0].trim();
    var ipport = cnt.split(",")[1].trim() + ":" + cnt.split(",")[2].trim();
    var pmtd = "method=" + cnt.split(",")[3].trim();
    var pwd = "password=" + cnt.split(",")[4].trim();
    if (cnt.indexOf("obfs") != -1) {
        pobfs = "obfs=" + cnt.replace(/obfs-host/, "").split("obfs")[1].split(",")[0].split("=")[1]
    } else { pobfs = "" }
    var phost = cnt.indexOf("obfs-host") != -1 ? "obfs-host" + cnt.split("obfs-host")[1].split(",")[0].trim() : "";
    if (phost != "") {
        pobfs = pobfs + ", " + phost
    }
    var ptfo = paraCheck(cnt, "tfo") == "true" ? "fast-open=true" : "fast-open=false";
    var pudp = paraCheck(cnt, "udp-relay") == "true" ? "udp-relay=true" : "udp-relay=false";
    var nserver = pobfs != "" ? "shadowsocks= " + [ipport, pmtd, pwd, pobfs, ptfo, pudp, tag].join(", ") : "shadowsocks= " + [ipport, pmtd, pwd, ptfo, pudp, tag].join(", ");
    return nserver
}


// surge3 中的 SS 类型
function SSS2QX(content) {
    var cnt = content;
    var tag = "tag=" + cnt.split("=")[0].trim();
    var ipport = cnt.split(",")[1].trim() + ":" + cnt.split(",")[2].trim();
    var pmtd = "method=" + cnt.split("encrypt-method")[1].split(",")[0].split("=")[1];
    var pwd = "password=" + cnt.split("password")[1].split(",")[0].split("=")[1];
    if (cnt.indexOf("obfs") != -1) {
        pobfs = "obfs=" + cnt.replace(/obfs-host/, "").split("obfs")[1].split(",")[0].split("=")[1]
    } else { pobfs = "" }
    var phost = cnt.indexOf("obfs-host") != -1 ? "obfs-host" + cnt.split("obfs-host")[1].split(",")[0].trim() : "";
    if (phost != "") {
        pobfs = pobfs + ", " + phost
    }
    var ptfo = paraCheck(cnt, "tfo") == "true" ? "fast-open=true" : "fast-open=false";
    var pudp = paraCheck(cnt, "udp-relay") == "true" ? "udp-relay=true" : "udp-relay=false";
    var nserver = pobfs != "" ? "shadowsocks= " + [ipport, pmtd, pwd, pobfs, ptfo, pudp, tag].join(", ") : "shadowsocks= " + [ipport, pmtd, pwd, ptfo, pudp, tag].join(", ");
    return nserver
}

// surge 中的 Vmess 类型
function SVmess2QX(content) {
    var cnt = content;
    var tag = "tag=" + cnt.split("=")[0].trim();
    var ipport = cnt.split(",")[1].trim() + ":" + cnt.split(",")[2].trim();
    var puname = cnt.indexOf("username") != -1 ? "password=" + cnt.split("username")[1].split(",")[0].split("=")[1].trim() : "";
    var pmtd = "method=aes-128-gcm";
    var ptls13 = paraCheck(cnt, "tls13") == "true" ? "tls13=true" : "tls13=false";
    var pverify = cnt.replace(/ /g,"").indexOf("skip-cert-verify=false") != -1 ? "tls-verification=true" : "tls-verification=false";
    pvefify = Pcert0 == 1? "tls-verification=true" : pverify ;
    if (paraCheck(cnt.replace(/tls13/, ""), "tls") == "true" && paraCheck(cnt.replace(/ws-header/, ""), "ws") == "true") {
        pobfs = "obfs=wss" + ", " + ptls13 + ", " + pverify
    } else if (paraCheck(cnt.replace(/ws-header/, ""), "ws") == "true") {
        pobfs = "obfs=ws"
    } else if (paraCheck(cnt.replace(/tls13/, ""), "tls") != "false") {
        pobfs = "obfs=over-tls" + ", " + ptls13 + ", " + pverify
    } else if (paraCheck(cnt.replace(/ws-header/, ""), "ws") == "false") {
        pobfs = ""
    }
    var puri = paraCheck(cnt, "ws-path") != "false" ? "obfs-uri=" + cnt.split("ws-path")[1].split(",")[0].split("=")[1].trim() : "obfs-uri=/"
    var phost = cnt.indexOf("ws-headers") != -1 ? "obfs-host=" + cnt.split("ws-headers")[1].split(",")[0].split("=")[1].split(":")[1].trim() : "";
    if (pobfs.indexOf("ws" || "wss") != -1) {
        if (phost != "") {
            pobfs = pobfs + ", " + puri + ", " + phost
        } else { pobfs = pobfs + ", " + puri }
    }
    var ptfo = paraCheck(cnt, "tfo") == "true" ? "fast-open=true" : "fast-open=false";
    var nserver = pobfs != "" ? "vmess= " + [ipport, puname, pmtd, pobfs, ptfo, tag].join(", ") : "vmess= " + [ipport, puname, pmtd, ptfo, tag].join(", ");
    return nserver
}

// 用于过滤非节点部分（比如整份配置中其它内容）
function isSurge(content) {
  if (content.indexOf("=") != -1) {
    cnt = content.split("=")[1].split(",")[0].trim()
    if (cnt == "http" || cnt == "ss" || cnt == "trojan" || cnt == "vmess" || cnt == "custom") {
        return content
    }
  }
}
// 用于参数检查
function paraCheck(content, para) {
  content=content.replace(/ /g,"")
  if (content.indexOf(para+"=") == -1) {
    return "false"
  } else {
      //console.log(para)
    return content.split(para+"=")[1].split(",")[0].trim()
  }
}
//surge中 trojan 类型转换
function Strojan2QX(content) {
  var cnt = content;
  var tag = "tag=" + cnt.split("=")[0].trim();
  var ipport = cnt.split(",")[1].trim() + ":" + cnt.split(",")[2].trim();
  var pwd = "password=" + cnt.split("password")[1].split(",")[0].split("=")[1].trim();
  var ptls = "over-tls=true";
  var ptfo = paraCheck(cnt, "tfo") == "true" ? "fast-open=true" : "fast-open=false";
  var pverify = cnt.replace(/ /g,"").indexOf("skip-cert-verify=false") != -1 ? "tls-verification=true" : "tls-verification=false";
  pvefify = Pcert0 == 1? "tls-verification=true" : pverify ;
  var ptls13 = paraCheck(cnt, "tls13") == "true" ? "tls13=true" : "tls13=false";
  var nserver = "trojan= " + [ipport, pwd, ptls, ptfo, ptls13, pverify, tag].join(", ");
  return nserver
}
// surge 中的 http 类型
function Shttp2QX(content) {
  var cnt = content;
  var tag = "tag=" + cnt.split("=")[0].trim();
  var ipport = cnt.split(",")[1].trim() + ":" + cnt.split(",")[2].trim();
  var puname = cnt.indexOf("username") != -1 ? "username=" + cnt.split("username")[1].split(",")[0].split("=")[1].trim() : "";
  var pwd = cnt.indexOf("password") != -1 ? "password=" + cnt.split("password")[1].split(",")[0].split("=")[1].trim() : "";
  var ptls = cnt.split("=")[1].split(",")[0].trim() == "https" ? "over-tls=true" : "over-tls=false";
  var ptfo = paraCheck(cnt, "tfo") == "true" ? "fast-open=true" : "fast-open=false";
  if (ptls == "over-tls=true") {
    var pverify = cnt.replace(/ /g,"").indexOf("skip-cert-verify=false") != -1 ? "tls-verification=true" : "tls-verification=false";
    pvefify = Pcert0 == 1? "tls-verification=true" : pverify ;
    var ptls13 = paraCheck(cnt, "tls13") == "true" ? "tls13=true" : "tls13=false";
    ptls = ptls + ", " + pverify + ", " + ptls13
  }
  var nserver = puname != "" ? "http= " + [ipport, puname, pwd, ptls, ptfo, tag].join(", ") : "http= " + [ipport, ptls, ptfo, tag].join(", ");
  return nserver
}

function Loon2QX(cnt) {
  var type = cnt.split("=")[1].split(",")[0].trim()
  var node = ""
  if (type == "Shadowsocks") { //ss 类型
      node = LoonSS2QX(cnt)
  } else if (type == "ShadowsocksR") { //ssr 类型
      node = LoonSSR2QX(cnt)
  }
  return node
}
//Loon 的 ss 部分
function LoonSS2QX(cnt) {
  var node = "shadowsocks="
  var ip = [cnt.split(",")[1].trim(), cnt.split(",")[2].trim()].join(":")
  var mtd = "method=" + cnt.split(",")[3].trim()
  var pwd = "password=" + cnt.split(",")[4].trim().split("\"")[1]
  var obfs = cnt.split(",").length == 7 ? ", " + ["obfs=" + cnt.split(",")[5].trim(), "obfs-host=" + cnt.split(",")[6].trim()].join(",") : ""
  var tag = ", tag=" + cnt.split("=")[0].trim()
  node = node + [ip, mtd, pwd].join(", ") + obfs + tag
  return node
}

//Loon 的 ssr 部分
//# SSR 格式：名称=协议类型,地址,端口,加密方式,密码,协议类型,{协议参数},混淆类型,{混淆参数}
//3 = ShadowsocksR, 1.2.3.4, 443, aes-256-cfb,"password",auth_aes128_md5,{},tls1.2_ticket_auth,{}
function LoonSSR2QX(cnt) {
  var node = "shadowsocks="
  var ip = [cnt.split(",")[1].trim(), cnt.split(",")[2].trim()].join(":")
  var mtd = "method=" + cnt.split(",")[3].trim()
  var pwd = "password=" + cnt.split(",")[4].trim().split("\"")[1]
  var ssrp = "ssr-protocol=" + cnt.split(",")[5].trim()
  var ssrpara = "ssr-protocol-param=" + cnt.split(",")[6].replace(/\{|\}/g, "").trim()
  var obfs = "obfs=" + cnt.split(",")[7].trim()
  var obfshost = "obfs-host=" + cnt.split(",")[8].replace(/\{|\}/g, "").trim()
  var tag = ", tag=" + cnt.split("=")[0].trim()
  node = node + [ip, mtd, pwd, ssrp, ssrpara, obfs, obfshost].join(", ") + tag
  return node
}


// fix yaml parse mistakes
function YAMLFix(cnt){
  cnt = cnt.replace(/\[/g,"yaml@bug1")
  if (cnt.indexOf("{") != -1){
    cnt = cnt.replace(/(^|\n)- /g, "$1  - ").replace(/    - /g,"  - ").replace(/:(?!\s)/g,": ").replace(/\,\"/g,", \"").replace(/: {/g, ": {,     ").replace(/, (Host|host|path|tls|mux|skip)/g,", $1")
    //console.log(cnt)
    cnt = cnt.replace(/{\s*name: /g,"{name: \"").replace(/, server:/g,"\", server:")
    cnt = cnt.replace(/{|}/g,"").replace(/,/g,"\n   ")
  }
  cnt = cnt.replace(/  -\n.*name/g,"  - name").replace(/\$|\`/g,"").split("proxy-providers:")[0].split("proxy-groups:")[0].replace(/\"(name|type|server|port|cipher|password|)(\"*)/g,"$1")
  console.log(cnt)
  cnt = cnt.indexOf("proxies:") == -1? "proxies:\n" + cnt :"proxies:"+cnt.split("proxies:")[1]
  cnt = cnt.replace(/name\:(.*?)\:(.*?)\n/gmi,"name:$1冒号$2\n").replace(/\s{6}Host\:/g,"    Host:") //罕见bug情况 修复
  items=cnt.split("\n").map(yamlcheck)
  cnt=items.join("\n")
  //console.log(cnt.replace(/name\:(.*?)\:(.*?)\n/gmi,"name:$1冒号$2"))
  console.log("after-fix"+cnt)
  return cnt
}


function yamlcheck(cnt){
  if (cnt.indexOf("name") !=-1){ //名字以某些数字结尾时，解析有 bug
    for (var i=0;i<10;i++) {
      cnt = cnt.replace(new RegExp(patn[0][i], "gmi"),patn[4][i])
    }
    
  }
  if (cnt.indexOf(":")!=-1) {
    return cnt
  }
}

// Clash parser
function Clash2QX(cnt) {
  const yaml = new YAML()
  var aa = JSON.stringify(yaml.parse(YAMLFix(cnt))).replace(/yaml@bug𝟙/g,"[").replace(/冒号/gmi,":")
  for (var i=0;i<10;i++) {
    aa = aa.replace(new RegExp(patn[4][i], "gmi"),patn[0][i])
  }
  var bb = JSON.parse(aa).proxies
  //$notify("YAML Parse", "content", JSON.stringify(bb))
  //console.log(bb)
  var nl = bb.length
  var nodelist=[]
  var node=""
  for (i=0; i<nl; i++){
    try{
      node=bb[i]
      typec = node.type
      if (typec == "ss") {
        node = CSS2QX(node)
      } else if (typec == "ssr"){
        node = CSSR2QX(node)
      } else if (typec == "vmess"){
        node = CV2QX(node)
      } else if (typec == "trojan"){
        node = CT2QX(node)
      } else if (typec == "http"){
        node = CH2QX(node)
      } 
      node = Pudp0 != 0 ? XUDP(node,Pudp0) : node
      node = Ptfo0 != 0 ? XTFO(node,Ptfo0) : node
      nodelist.push(node)
    }catch (e) {
      $notify(`⚠️该节点解析错误, 暂时已忽略处理`,`可点击通知反馈至 bot`,node,bug_link )
    }
  }
  return nodelist.join("\n")
}

//Clash ss type server
function CSS2QX(cnt) {
  tag = "tag="+cnt.name.replace(/\\U.+?\s{1}/gi,"")
  ipt = cnt.server+":"+cnt.port
  pwd = "password=" + cnt.password
  mtd = "method="+ cnt.cipher
  udp = cnt.udp ? "udp-relay=true" : "udp-relay=false"
  tfo = cnt.tfo ? "fast-open=true" : "fast-open=false"
  obfs = cnt["plugin-opts"] ? "obfs=" + cnt["plugin-opts"].mode : ""
  ohost = cnt["plugin-opts"] ? "obfs-host=" + cnt["plugin-opts"].host : ""
  ouri = ""
  cert = ""
  if (obfs.indexOf("websocket") != -1) {
      obfs = cnt["plugin-opts"].tls? "obfs=wss" : "obfs=ws"
      ohost = cnt["plugin-opts"].host? "obfs-host=" + cnt["plugin-opts"].host:""
      ouri = cnt["plugin-opts"].path? "obfs-uri=" + cnt["plugin-opts"].path: ""
    if (obfs == "obfs=wss") { // tls verification
      cert = Pcert0 == 1? "" : "tls-verification =false"}
  }
  node = "shadowsocks="+[ipt, pwd, mtd, udp, tfo, obfs, ohost, ouri, cert, tag].filter(Boolean).join(", ")
  return node
}

//Clash ssr type server
function CSSR2QX(cnt) {
  tag = "tag="+cnt.name.replace(/\\U.+?\s{1}/gi,"")
  ipt = cnt.server+":"+cnt.port
  pwd = "password=" + cnt.password
  mtd = "method="+ cnt.cipher
  udp = cnt.udp ? "udp-relay=true" : "udp-relay=false"
  tfo = cnt.tfo ? "fast-open=true" : "fast-open=false"
  prot = "ssr-protocol=" + cnt.protocol 
  ppara = "ssr-protocol-param=" + cnt["protocol-param"]
  obfs = "obfs=" + cnt.obfs
  ohost = "obfs-host=" + cnt["obfs-param"]
  node = "shadowsocks="+[ipt, pwd, mtd, udp, tfo, prot, ppara, obfs, ohost, tag].filter(Boolean).join(", ")
  //console.log(node)
  return node
}

//Clash vmess type server
function CV2QX(cnt) {
  tag = "tag="+cnt.name.replace(/\\U.+?\s{1}/gi," ")
  ipt = cnt.server+":"+cnt.port
  pwd = "password=" + cnt.uuid
  mtd = "method="+ "aes-128-gcm" //cnt.cipher
  udp = cnt.udp ? "udp-relay=false" : "udp-relay=false" //暂不支持
  tfo = cnt.tfo ? "fast-open=true" : "fast-open=false"
  obfs = ""
  if (cnt.network == "ws" && cnt.tls) {
    obfs = "obfs=wss"
  } else if (cnt.network == "ws"){
    obfs = "obfs=ws"
  } else if (cnt.network == "http"){
    obfs = "obfs=http"
  } else if (cnt.tls){
    obfs = "obfs=over-tls"
  }
  ohost = cnt["ws-headers"]? "obfs-host=" + cnt["ws-headers"]["Host"] : ""
  ouri = cnt["ws-path"]? "obfs-uri="+cnt["ws-path"] : ""
  cert = cnt["skip-cert-verify"] && cnt.tls ? "tls-verification=false" : ""
  //$notify(cert)
  if (Pcert0 == 1 && cnt.tls) {
    cert = "tls-verification=true"
  } else if (Pcert0 != 1 && cnt.tls) {
    cert = "tls-verification=false"
  }
  node = "vmess="+[ipt, pwd, mtd, udp, tfo, obfs, ohost, ouri, cert, tag].filter(Boolean).join(", ")
  //console.log(node)
  return node
}


//Clash Trojan
function CT2QX(cnt) {
  tag = "tag="+cnt.name.replace(/\\U.+?\s{1}/gi," ")
  ipt = cnt.server+":"+cnt.port
  pwd = "password=" + cnt.password
  otls = "over-tls=true"
  cert = cnt["skip-cert-verify"] ? "tls-verification=false" : "tls-verification=true"
  cert = Pcert0 == 1 ? "tls-verification=true" : "tls-verification=false"
  tls13 = PTls13 == 1 ? "tls13=true" : "tls13=false"
  udp = cnt.udp ? "udp-relay=false" : "udp-relay=false"
  tfo = cnt.tfo ? "fast-open=true" : "fast-open=false"
  node = "trojan="+[ipt, pwd, otls, cert, tls13, udp, tfo, tag].filter(Boolean).join(", ")
  //console.log(node)
  return node

}

// Clash http
function CH2QX(cnt){
    tag = "tag="+cnt.name.replace(/\\U.+?\s{1}/gi," ")
    ipt = cnt.server+":"+cnt.port
    uname = cnt.username ? "username=" + cnt.username : ""
    pwd = cnt.password && typeof(cnt.password) == "string" ? "password=" + cnt.password : ""
    tls = cnt.tls ? "over-tls=true" : ""
    cert = cnt["skip-cert-verify"] && cnt.tls ? "tls-verification=false" : ""
    if (Pcert0 == 1 && cnt.tls) {
      cert = "tls-verification=true"
    } else if (Pcert0 != 1 && cnt.tls) {
      cert = "tls-verification=false"
    }
    node = "http="+[ipt, uname, pwd, tls, cert, tag].filter(Boolean).join(", ")
    //console.log(node)
    return node
}

// UDP/TFO 参数 (强制 surge/quanx 类型转换)
function XUDP(cnt,pudp) {
    var udp = pudp == 1 && cnt.trim().indexOf("shadowsocks")==0 ? "udp-relay=true, " : "udp-relay=false, "
    if(cnt.indexOf("udp-relay") != -1){
        var cnt0 = cnt.replace(RegExp("udp\-relay.*?\,", "gmi"), udp)
    }else{
        var cnt0 = cnt.replace(new RegExp("tag.*?\=", "gmi"), udp+"tag=")
    }
    return cnt0
}

function XTFO(cnt,ptfo) {
    var tfo = ptfo == 1? "fast-open=true, " : "fast-open=false, "
    if(cnt.indexOf("fast-open") != -1){
        var cnt0 = cnt.replace(RegExp("fast\-open.*?\,", "gmi"), tfo)
    }else{
        var cnt0 = cnt.replace(RegExp("tag.*?\=", "gmi"), tfo+"tag=")
    }
    return cnt0
}

//比较完美的一款 base64 encode/decode 工具
/*
 *  base64.js: https://github.com/dankogai/js-base64#readme
 *
 *  Licensed under the BSD 3-Clause License.
 *    http://opensource.org/licenses/BSD-3-Clause
 *
 *  References:
 *    http://en.wikipedia.org/wiki/Base64
 */
//base64 完毕
function Base64Code() {
    // constants
    var b64chars
        = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var b64tab = function (bin) {
        var t = {};
        for (var i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
        return t;
    }(b64chars);
    var fromCharCode = String.fromCharCode;
    // encoder stuff
    var cb_utob = function (c) {
        if (c.length < 2) {
            var cc = c.charCodeAt(0);
            return cc < 0x80 ? c
                : cc < 0x800 ? (fromCharCode(0xc0 | (cc >>> 6))
                    + fromCharCode(0x80 | (cc & 0x3f)))
                    : (fromCharCode(0xe0 | ((cc >>> 12) & 0x0f))
                        + fromCharCode(0x80 | ((cc >>> 6) & 0x3f))
                        + fromCharCode(0x80 | (cc & 0x3f)));
        } else {
            var cc = 0x10000
                + (c.charCodeAt(0) - 0xD800) * 0x400
                + (c.charCodeAt(1) - 0xDC00);
            return (fromCharCode(0xf0 | ((cc >>> 18) & 0x07))
                + fromCharCode(0x80 | ((cc >>> 12) & 0x3f))
                + fromCharCode(0x80 | ((cc >>> 6) & 0x3f))
                + fromCharCode(0x80 | (cc & 0x3f)));
        }
    };
    var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
    var utob = function (u) {
        return u.replace(re_utob, cb_utob);
    };
    var cb_encode = function (ccc) {
        var padlen = [0, 2, 1][ccc.length % 3],
            ord = ccc.charCodeAt(0) << 16
                | ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8)
                | ((ccc.length > 2 ? ccc.charCodeAt(2) : 0)),
            chars = [
                b64chars.charAt(ord >>> 18),
                b64chars.charAt((ord >>> 12) & 63),
                padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
                padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
            ];
        return chars.join('');
    };
    var btoa = function (b) {
        return b.replace(/[\s\S]{1,3}/g, cb_encode);
    };
    // var _encode = function(u) {
    // 	var isUint8Array = Object.prototype.toString.call(u) === '[object Uint8Array]';
    // 	return isUint8Array ? u.toString('base64')
    // 		: btoa(utob(String(u)));
    // }
    this.encode = function (u) {
        var isUint8Array = Object.prototype.toString.call(u) === '[object Uint8Array]';
        return isUint8Array ? u.toString('base64')
            : btoa(utob(String(u)));
    }
    var uriencode = function (u, urisafe) {
        return !urisafe
            ? _encode(u)
            : _encode(String(u)).replace(/[+\/]/g, function (m0) {
                return m0 == '+' ? '-' : '_';
            }).replace(/=/g, '');
    };
    var encodeURI = function (u) { return uriencode(u, true) };
    // decoder stuff
    var re_btou = /[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g;
    var cb_btou = function (cccc) {
        switch (cccc.length) {
            case 4:
                var cp = ((0x07 & cccc.charCodeAt(0)) << 18)
                    | ((0x3f & cccc.charCodeAt(1)) << 12)
                    | ((0x3f & cccc.charCodeAt(2)) << 6)
                    | (0x3f & cccc.charCodeAt(3)),
                    offset = cp - 0x10000;
                return (fromCharCode((offset >>> 10) + 0xD800)
                    + fromCharCode((offset & 0x3FF) + 0xDC00));
            case 3:
                return fromCharCode(
                    ((0x0f & cccc.charCodeAt(0)) << 12)
                    | ((0x3f & cccc.charCodeAt(1)) << 6)
                    | (0x3f & cccc.charCodeAt(2))
                );
            default:
                return fromCharCode(
                    ((0x1f & cccc.charCodeAt(0)) << 6)
                    | (0x3f & cccc.charCodeAt(1))
                );
        }
    };
    var btou = function (b) {
        return b.replace(re_btou, cb_btou);
    };
    var cb_decode = function (cccc) {
        var len = cccc.length,
            padlen = len % 4,
            n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0)
                | (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0)
                | (len > 2 ? b64tab[cccc.charAt(2)] << 6 : 0)
                | (len > 3 ? b64tab[cccc.charAt(3)] : 0),
            chars = [
                fromCharCode(n >>> 16),
                fromCharCode((n >>> 8) & 0xff),
                fromCharCode(n & 0xff)
            ];
        chars.length -= [0, 0, 2, 1][padlen];
        return chars.join('');
    };
    var _atob = function (a) {
        return a.replace(/\S{1,4}/g, cb_decode);
    };
    var atob = function (a) {
        return _atob(String(a).replace(/[^A-Za-z0-9\+\/]/g, ''));
    };
    // var _decode = buffer ?
    // 	buffer.from && Uint8Array && buffer.from !== Uint8Array.from
    // 	? function(a) {
    // 		return (a.constructor === buffer.constructor
    // 				? a : buffer.from(a, 'base64')).toString();
    // 	}
    // 	: function(a) {
    // 		return (a.constructor === buffer.constructor
    // 				? a : new buffer(a, 'base64')).toString();
    // 	}
    // 	: function(a) { return btou(_atob(a)) };
    var _decode = function (u) {
        return btou(_atob(u))
    }
    this.decode = function (a) {
        return _decode(
            String(a).replace(/[-_]/g, function (m0) { return m0 == '-' ? '+' : '/' })
                .replace(/[^A-Za-z0-9\+\/]/g, '')
        ).replace(/&gt;/g, ">").replace(/&lt;/g, "<");
    };
}


/*
YAML parser for Javascript
Author: Diogo Costa

This program is released under the MIT License as follows:

Copyright (c) 2011 Diogo Costa (costa.h4evr@gmail.com)

*/

function YAML() {
        var errors = [],
                reference_blocks = [],
                processing_time = 0,
                regex =
                {
                        "regLevel" : new RegExp("^([\\s\\-]+)"),
                        "invalidLine" : new RegExp("^\\-\\-\\-|^\\.\\.\\.|^\\s*#.*|^\\s*$"),
                        "dashesString" : new RegExp("^\\s*\\\"([^\\\"]*)\\\"\\s*$"),
                        "quotesString" : new RegExp("^\\s*\\\'([^\\\']*)\\\'\\s*$"),
                        "float" : new RegExp("^[+-]?[0-9]+\\.[0-9]+(e[+-]?[0-9]+(\\.[0-9]+)?)?$"),
                        "integer" : new RegExp("^[+-]?[0-9]+$"),
                        "array" : new RegExp("\\[\\s*(.*)\\s*\\]"),
                        "map" : new RegExp("\\{\\s*(.*)\\s*\\}"),
                        "key_value" : new RegExp("([a-z0-9_-][ a-z0-9_-]*):( .+)", "i"),
                        "single_key_value" : new RegExp("^([a-z0-9_-][ a-z0-9_-]*):( .+?)$", "i"),
                        "key" : new RegExp("([a-z0-9_-][ a-z0-9_-]+):( .+)?", "i"),
                        "item" : new RegExp("^-\\s+"),
                        "trim" : new RegExp("^\\s+|\\s+$"),
                        "comment" : new RegExp("([^\\\'\\\"#]+([\\\'\\\"][^\\\'\\\"]*[\\\'\\\"])*)*(#.*)?")
                };
 
         /**
            * @class A block of lines of a given level.
            * @param {int} lvl The block's level.
            * @private
            */
        function Block(lvl) {
                return {
                        /* The block's parent */
                        parent: null,
                        /* Number of children */
                        length: 0,
                        /* Block's level */
                        level: lvl,
                        /* Lines of code to process */
                        lines: [],
                        /* Blocks with greater level */
                        children : [],
                        /* Add a block to the children collection */
                        addChild : function(obj) {
                                this.children.push(obj);
                                obj.parent = this;
                                ++this.length;
                        }
                };
        }

        // function to create an XMLHttpClient in a cross-browser manner

        function fromURL(src, ondone) {
                var client = createXMLHTTPRequest();
                client.onreadystatechange = function() {
                        if (this.readyState == 4 || this.status == 200) {
                                var txt = this.responseText;
                                ondone(YAML.eval0(txt));
                        }
                };
                client.open('GET', src);
                client.send();
        }

        function parser(str) {
                var regLevel = regex["regLevel"];
                var invalidLine = regex["invalidLine"];
                var lines = str.split("\n");
                var m;
                var level = 0, curLevel = 0;
                
                var blocks = [];
                
                var result = new Block(-1);
                var currentBlock = new Block(0);
                result.addChild(currentBlock);
                var levels = [];
                var line = "";
                
                blocks.push(currentBlock);
                levels.push(level);
                
                for(var i = 0, len = lines.length; i < len; ++i) {
                        line = lines[i];
                        
                        if(line.match(invalidLine)) {
                                continue;
                        }
                
                        if(m = regLevel.exec(line)) {
                                level = m[1].length;
                        } else
                                level = 0;
                        
                        if(level > curLevel) {
                                var oldBlock = currentBlock;
                                currentBlock = new Block(level);
                                oldBlock.addChild(currentBlock);
                                blocks.push(currentBlock);
                                levels.push(level);
                        } else if(level < curLevel) {                
                                var added = false;

                                var k = levels.length - 1;
                                for(; k >= 0; --k) {
                                        if(levels[k] == level) {
                                                currentBlock = new Block(level);
                                                blocks.push(currentBlock);
                                                levels.push(level);
                                                if(blocks[k].parent!= null)
                                                        blocks[k].parent.addChild(currentBlock);
                                                added = true;
                                                break;
                                        }
                                }
                                
                                if(!added) {
                                        errors.push("Error: Invalid indentation at line " + i + ": " + line);
                                        return;
                                }
                        }
                        
                        currentBlock.lines.push(line.replace(regex["trim"], ""));
                        curLevel = level;
                }
                
                return result;
        }
        
        function processValue(val) {
                val = val.replace(regex["trim"], "");
                var m = null;

                if(val == 'true') {
                        return true;
                } else if(val == 'false') {
                        return false;
                } else if(val == '.NaN') {
                        return Number.NaN;
                } else if(val == 'null') {
                        return null;
                } else if(val == '.inf') {
                        return Number.POSITIVE_INFINITY;
                } else if(val == '-.inf') {
                        return Number.NEGATIVE_INFINITY;
                } else if(m = val.match(regex["dashesString"])) {
                        return m[1];
                } else if(m = val.match(regex["quotesString"])) {
                        return m[1];
                } else if(m = val.match(regex["float"])) {
                        return parseFloat(m[0]);
                } else if(m = val.match(regex["integer"])) {
                        return parseInt(m[0]);
                } else if( !isNaN(m = Date.parse(val))) {
                        return new Date(m);
                } else if(m = val.match(regex["single_key_value"])) {
                        var res = {};
                        res[m[1]] = processValue(m[2]);
                        return res;
                } else if(m = val.match(regex["array"])){
                        var count = 0, c = ' ';
                        var res = [];
                        var content = "";
                        var str = false;
                        for(var j = 0, lenJ = m[1].length; j < lenJ; ++j) {
                                c = m[1][j];
                                if(c == '\'' || c == '"') {
                                        if(str === false) {
                                                str = c;
                                                content += c;
                                                continue;
                                        } else if((c == '\'' && str == '\'') || (c == '"' && str == '"')) {
                                                str = false;
                                                content += c;
                                                continue;
                                        }
                                } else if(str === false && (c == '[' || c == '{')) {
                                        ++count;
                                } else if(str === false && (c == ']' || c == '}')) {
                                        --count;
                                } else if(str === false && count == 0 && c == ',') {
                                        res.push(processValue(content));
                                        content = "";
                                        continue;
                                }
                                
                                content += c;
                        }
                        
                        if(content.length > 0)
                                res.push(processValue(content));
                        return res;
                } else if(m = val.match(regex["map"])){
                        var count = 0, c = ' ';
                        var res = [];
                        var content = "";
                        var str = false;
                        for(var j = 0, lenJ = m[1].length; j < lenJ; ++j) {
                                c = m[1][j];
                                if(c == '\'' || c == '"') {
                                        if(str === false) {
                                                str = c;
                                                content += c;
                                                continue;
                                        } else if((c == '\'' && str == '\'') || (c == '"' && str == '"')) {
                                                str = false;
                                                content += c;
                                                continue;
                                        }
                                } else if(str === false && (c == '[' || c == '{')) {
                                        ++count;
                                } else if(str === false && (c == ']' || c == '}')) {
                                        --count;
                                } else if(str === false && count == 0 && c == ',') {
                                        res.push(content);
                                        content = "";
                                        continue;
                                }
                                
                                content += c;
                        }
                        
                        if(content.length > 0)
                                res.push(content);
                                
                        var newRes = {};
                        for(var j = 0, lenJ = res.length; j < lenJ; ++j) {
                                if(m = res[j].match(regex["key_value"])) {
                                        newRes[m[1]] = processValue(m[2]);
                                }
                        }
                        
                        return newRes;
                } else 
                        return val;
        }
        
        function processFoldedBlock(block) {
                var lines = block.lines;
                var children = block.children;
                var str = lines.join(" ");
                var chunks = [str];
                for(var i = 0, len = children.length; i < len; ++i) {
                        chunks.push(processFoldedBlock(children[i]));
                }
                return chunks.join("\n");
        }
        
        function processLiteralBlock(block) {
                var lines = block.lines;
                var children = block.children;
                var str = lines.join("\n");
                for(var i = 0, len = children.length; i < len; ++i) {
                        str += processLiteralBlock(children[i]);
                }
                return str;
        }
        
        function processBlock(blocks) {
                var m = null;
                var res = {};
                var lines = null;
                var children = null;
                var currentObj = null;
                
                var level = -1;
                
                var processedBlocks = [];
                
                var isMap = true;
                
                for(var j = 0, lenJ = blocks.length; j < lenJ; ++j) {
                        
                        if(level != -1 && level != blocks[j].level)
                                continue;
                
                        processedBlocks.push(j);
                
                        level = blocks[j].level;
                        lines = blocks[j].lines;
                        children = blocks[j].children;
                        currentObj = null;
                
                        for(var i = 0, len = lines.length; i < len; ++i) {
                                var line = lines[i];

                                if(m = line.match(regex["key"])) {
                                        var key = m[1];
                                        
                                        if(key[0] == '-') {
                                                key = key.replace(regex["item"], "");
                                                if (isMap) { 
                                                        isMap = false;
                                                        if (typeof(res.length) === "undefined") {
                                                                res = [];
                                                        } 
                                                }
                                                if(currentObj != null) res.push(currentObj);
                                                currentObj = {};
                                                isMap = true;
                                        }
                                        
                                        if(typeof m[2] != "undefined") {
                                                var value = m[2].replace(regex["trim"], "");
                                                if(value[0] == '&') {
                                                        var nb = processBlock(children);
                                                        if(currentObj != null) currentObj[key] = nb;
                                                        else res[key] = nb;
                                                        reference_blocks[value.substr(1)] = nb;
                                                } else if(value[0] == '|') {
                                                        if(currentObj != null) currentObj[key] = processLiteralBlock(children.shift());
                                                        else res[key] = processLiteralBlock(children.shift());
                                                } else if(value[0] == '*') {
                                                        var v = value.substr(1);
                                                        var no = {};
                                                        
                                                        if(typeof reference_blocks[v] == "undefined") {
                                                                errors.push("Reference '" + v + "' not found!");
                                                        } else {
                                                                for(var k in reference_blocks[v]) {
                                                                        no[k] = reference_blocks[v][k];
                                                                }
                                                                
                                                                if(currentObj != null) currentObj[key] = no;
                                                                else res[key] = no;
                                                        }
                                                } else if(value[0] == '>') {
                                                        if(currentObj != null) currentObj[key] = processFoldedBlock(children.shift());
                                                        else res[key] = processFoldedBlock(children.shift());
                                                } else {
                                                        if(currentObj != null) currentObj[key] = processValue(value);
                                                        else res[key] = processValue(value);
                                                }
                                        } else {
                                                if(currentObj != null) currentObj[key] = processBlock(children);
                                                else res[key] = processBlock(children);                        
                                        }
                                } else if(line.match(/^-\s*$/)) {
                                        if (isMap) { 
                                                isMap = false;
                                                if (typeof(res.length) === "undefined") {
                                                        res = [];
                                                } 
                                        }
                                        if(currentObj != null) res.push(currentObj);
                                        currentObj = {};
                                        isMap = true;
                                        continue;
                                } else if(m = line.match(/^-\s*(.*)/)) {
                                        if(currentObj != null) 
                                                currentObj.push(processValue(m[1]));
                                        else {
                                                if (isMap) { 
                                                        isMap = false;
                                                        if (typeof(res.length) === "undefined") {
                                                                res = [];
                                                        } 
                                                }
                                                res.push(processValue(m[1]));
                                        }
                                        continue;
                                }
                        }
                        
                        if(currentObj != null) {
                                if (isMap) { 
                                        isMap = false;
                                        if (typeof(res.length) === "undefined") {
                                                res = [];
                                        } 
                                }
                                res.push(currentObj);
                        }
                }
                
                for(var j = processedBlocks.length - 1; j >= 0; --j) {
                        blocks.splice.call(blocks, processedBlocks[j], 1);
                }

                return res;
        }
                
        function semanticAnalysis(blocks) {
                var res = processBlock(blocks.children);
                return res;
        }
        
        function preProcess(src) {
                var m;
                var lines = src.split("\n");
                
                var r = regex["comment"];
                
                for(var i in lines) {
                        if(m = lines[i].match(r)) {
/*                var cmt = "";
                                if(typeof m[3] != "undefined")
                                        lines[i] = m[1];
                                else if(typeof m[3] != "undefined")
                                        lines[i] = m[3]; 
                                else
                                        lines[i] = "";
                                        */
                                if(typeof m[3] !== "undefined") {
                                        lines[i] = m[0].substr(0, m[0].length - m[3].length);
                                }
                        }
                }
                
                return lines.join("\n");
        }
        
        this.parse = function eval0(str) {
                errors = [];
                reference_blocks = [];
                processing_time = (new Date()).getTime();
                var pre = preProcess(str)
                var doc = parser(pre);
                var res = semanticAnalysis(doc);
                processing_time = (new Date()).getTime() - processing_time;
                
                return res;
        }

};


/***********************************************************************************************/
function Tools() {
    const filter = (src, ...regex) => {
        const initial = [...Array(src.length).keys()].map(() => false);
        return regex.reduce((a, expr) => OR(a, src.map(item => expr.test(item))), initial)
    }

    const rename = {
        replace: (src, old, now) => {
            return src.map(item => item.replace(old, now));
        },

        delete: (src, ...args) => {
            return src.map(item => args.reduce((now, expr) => now.replace(expr, ''), item));
        },

        trim: (src) => {
            return src.map(item => item.trim().replace(/[^\S\r\n]{2,}/g, ' '));
        }
    }

    const getNodeInfo = servers => {
        const nodes = {
            names: servers.map(s => s.split("tag=")[1]),
            types: servers.map(s => {
                const type = s.match(/^(vmess|trojan|shadowsocks|http)=/);
                return type ? type[1] : 'unknown';
            })
        };
        return nodes;
    }


    return {
        filter, rename, getNodeInfo
    }
}

function AND(...args) {
    return args.reduce((a, b) => a.map((c, i) => b[i] && c));
}

function OR(...args) {
    return args.reduce((a, b) => a.map((c, i) => b[i] || c))
}

function NOT(array) {
    return array.map(c => !c);
}
