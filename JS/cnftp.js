//By RuCu6 
//爱奇艺、优酷、芒果TV、腾讯视频去广告脚本

// 2023-08-28 20:40

const url = $request.url;
if (!$response.body) $done({});
const isIQY = url.includes("iqiyi.com/");
const isMG = url.includes("mgtv.com/");
const isYK = url.includes("youku.com/");
let obj = JSON.parse($response.body);

if (isIQY) {
  if (url.includes("/bottom_theme?")) {
    // 底部菜单
    if (obj?.cards?.length > 0) {
      let card = obj.cards[0];
      if (card?.items?.length > 0) {
        // 35发现 184随刻视频
        card.items = card.items.filter((i) => !["35", "184"]?.includes(i?._id));
      }
    }
  } else if (url.includes("/control/")) {
    // 左上角天气图标
    if (obj?.content?.weather) {
      delete obj.content.weather;
    }
  } else if (url.includes("/getMyMenus?")) {
    // 我的页面
    if (obj?.data?.length > 0) {
      obj.data = obj.data.filter(
        (i) =>
          !["wd_liebiao_2", "wd_liebiao_3", "wd_liebiao_4"]?.includes(
            i?.statistic?.block
          )
      );
    }
  } else if (url.includes("/home_top_menu?")) {
    // 顶部菜单
    if (obj?.cards?.length > 0) {
      let card = obj.cards[0];
      if (card?.items?.length > 0) {
        // 1017直播 8196热点 4525518866820370中国梦
        card.items = card.items.filter(
          (i) => !["1017", "8196", "4525518866820370"]?.includes(i?._id)
        );
        for (let i = 0; i < card.items.length; i++) {
          card.items[i].show_order = i + 1;
        }
      }
    } else if (obj?.nav_group_data?.length > 0) {
      // 右上角版块 仅保留我的频道
      // 好像不生效
      obj.nav_group_data = obj.nav_group_data.filter(
        (i) => i?.group_key === "default_group"
      );
    }
  } else if (url.includes("/mixer?")) {
    // 开屏页 播放页
    if (obj) {
      const item = ["adSlots", "splashLottieFile", "splashUiConfig"];
      for (let i of item) {
        if (obj?.[i]) delete obj[i];
      }
    }
  } else if (url.includes("/search.video.iqiyi.com/")) {
    // 搜索框填充
    if (obj?.cache_expired_sec) {
      obj.cache_expired_sec = 1;
    }
    if (obj?.data) {
      obj.data = [{ query: "搜索内容" }];
    }
    if (obj?.show_style?.roll_period) {
      obj.show_style.roll_period = 1000;
    }
  } else if (url.includes("/views_category/")) {
    // 电视剧版块
    if (obj?.cards?.length > 0) {
      obj.cards = obj.cards.filter(
        (i) =>
          i.hasOwnProperty("alias_name") &&
          !["ad_mobile_flow", "ad_trueview", "tv-jiaodiantu"]?.includes(
            i?.alias_name
          )
      );
    }
  } else if (url.includes("/views_comment/")) {
    // 播放页评论区
    if (obj?.cards?.length > 0) {
      obj.cards = obj.cards.filter(
        (i) =>
          i.hasOwnProperty("alias_name") &&
          !i?.alias_name?.includes("comment_resource_convention_card")
      );
    }
  } else if (url.includes("/views_home/")) {
    // 首页信息流样式1
    if (obj?.cards?.length > 0) {
      obj.cards = obj.cards.filter(
        (i) =>
          ![
            "ad_mobile_flow", // 信息流广告
            "ad_trueview", //信息流广告
            "focus", // 顶部横版广告
            "qy_home_vip_opr_banner" // 会员营销banner
          ]?.includes(i?.alias_name)
      );
    }
  } else if (url.includes("/views_plt/")) {
    // 播放详情页
    if (obj?.cards?.length > 0) {
      obj.cards = obj.cards.filter(
        (i) =>
          ![
            "play_ad_no_vip", // 视频关联广告
            "play_custom_card", // 偶像练习生定制卡片
            "play_vip_promotion", // 会员推广
            "play_water_fall_like", // 猜你喜欢
            "play_water_fall_like_title" // 猜你喜欢标题
          ]?.includes(i?.alias_name)
      );
    }
  } else if (url.includes("/views_search/")) {
    // 搜索页
    if (obj?.cards?.length > 0) {
      let newCards = [];
      for (let card of obj.cards) {
        if (
          [
            "ad_mobile_flow", // 信息流广告
            "hot_query_search_top_ad", //顶部广告
            "hot_query_bottom", // 底部图标
            "search_com_related_query", // 相关搜索
            "search_intent_detail_onesearch", // 为你推荐信息流
            "search_mid_text_ad", // 底部广告
            "search_small_card_ad", // 搜索短视频小图广告
            "search_topbanner_text", // 为你推荐标题
            "search_vip_banner" // vip营销
          ]?.includes(card?.strategy_com_id)
        ) {
          continue;
        } else {
          if (card?.strategy_com_id === "search_related_rec_album_gallery") {
            // 相关内容推荐
            if (card?.blocks?.length > 0) {
              let newBlocks = [];
              for (let i of card.blocks) {
                if (i.hasOwnProperty("block_name")) {
                  newBlocks.push(i);
                }
              }
              card.blocks = newBlocks;
            }
            newCards.push(card);
          } else if (card?.strategy_com_id === "search_related_rec_video_v") {
            // 相关短视频
            if (card?.blocks?.length > 0) {
              let newBlocks = [];
              for (let i of card.blocks) {
                if (i.hasOwnProperty("block_name")) {
                  newBlocks.push(i);
                }
              }
              card.blocks = newBlocks;
            }
            newCards.push(card);
          } else {
            newCards.push(card);
          }
        }
      }
      obj.cards = newCards;
    }
  } else if (url.includes("/waterfall/")) {
    // 首页信息流样式2
    if (obj?.cards?.length > 0) {
      let card = obj.cards[0];
      if (card?.blocks?.length > 0) {
        card.blocks = card.blocks.filter(
          (i) => !i.hasOwnProperty("block_class")
        );
      }
    }
  }
} else if (isMG) {
  if (url.includes("/dynamic/v1/channel/index/")) {
    if (obj?.data?.items) {
      delete obj.data.items;
    }
  }
} else if (isYK) {
  if (url.includes("/mtop.youku.play.ups.appinfo.get/")) {
    if (obj.data?.data) {
      const item = ["ad", "ykad", "watermark"];
      for (let i of item) {
        if (obj.data.data?.[i]) {
          delete obj.data.data[i];
        }
      }
    }
  }
}

$done({ body: JSON.stringify(obj) });
