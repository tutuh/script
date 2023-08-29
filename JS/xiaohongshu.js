// By RuCu6
// 2023-08-29 13:40

const url = $request.url;
if (!$response.body) $done({});
let obj = JSON.parse($response.body);

if (url.includes("/v1/search/banner_list")) {
  if (obj?.data) {
    obj.data = {};
  }
} else if (url.includes("/v1/search/hot_list")) {
  if (obj?.data?.items) {
    obj.data.items = [];
  }
} else if (url.includes("/v1/system_service/config")) {
  // 整体配置
  const item = ["app_theme", "loading_img", "splash", "store"];
  if (obj?.data) {
    item.forEach((i) => {
      delete obj.data[i];
    });
  }
} else if (url.includes("/v2/note/widgets")) {
  const item = ["generic"];
  if (obj?.data) {
    item.forEach((i) => {
      delete obj.data[i];
    });
  }
} else if (
  url.includes("/v2/note/feed") ||
  url.includes("/v3/note/videofeed")
) {
  if (obj?.data?.length > 0) {
    if (obj?.data?.[0]?.note_list?.length > 0) {
      let note = obj.data[0].note_list;
      for (let i of note) {
        if (i?.media_save_config) {
          i.media_save_config.disable_save = false;
          i.media_save_config.disable_watermark = true;
          i.media_save_config.disable_weibo_cover = true;
        }
        if (i?.share_info) {
          i.share_info.function_entries = [
            { type: "video_download" },
            { type: "generate_image" },
            { type: "copy_link" },
            { type: "native_voice" },
            { type: "video_speed" },
            { type: "dislike" },
            { type: "report" },
            { type: "video_feedback" }
          ];
        }
      }
    } else {
      for (let i of obj.data) {
        if (i?.media_save_config) {
          i.media_save_config.disable_save = false;
          i.media_save_config.disable_watermark = true;
          i.media_save_config.disable_weibo_cover = true;
        }
        if (i?.share_info) {
          i.share_info.function_entries = [
            { type: "video_download" },
            { type: "generate_image" },
            { type: "copy_link" },
            { type: "native_voice" },
            { type: "video_speed" },
            { type: "dislike" },
            { type: "report" },
            { type: "video_feedback" }
          ];
        }
      }
    }
  }
} else if (url.includes("/v2/system_service/splash_config")) {
  // 开屏广告
  if (obj?.data?.ads_groups?.length > 0) {
    obj.data.ads_groups.forEach((i) => {
      i.start_time = 2208960000; // Unix 时间戳 2040-01-01 00:00:00
      i.end_time = 2209046399; // Unix 时间戳 2040-01-01 23:59:59
      if (i?.ads?.length > 0) {
        i.ads.forEach((j) => {
          j.start_time = 2208960000; // Unix 时间戳 2040-01-01 00:00:00
          j.end_time = 2209046399; // Unix 时间戳 2040-01-01 23:59:59
        });
      }
    });
  }
} else if (url.includes("/v4/followfeed")) {
  // 关注列表
  if (obj?.data?.items?.length > 0) {
    // recommend_user 可能感兴趣的人
    obj.data.items = obj.data.items.filter(
      (i) => !["recommend_user"].includes(i.recommend_reason)
    );
  }
} else if (url.includes("/v4/search/trending")) {
  // 搜索栏
  if (obj?.data?.queries) {
    obj.data.queries = [];
  }
  if (obj?.data?.hint_word) {
    obj.data.hint_word = {};
  }
} else if (url.includes("/v4/search/hint")) {
  // 搜索栏填充词
  if (obj?.data?.hint_words) {
    obj.data.hint_words = [];
  }
} else if (url.includes("/v6/homefeed")) {
  if (obj?.data?.length > 0) {
    // 信息流广告
    let newItems = [];
    for (let item of obj.data) {
      // 信息流-直播
      if (item.model_type === "live_v2") {
        continue;
        // 信息流-赞助
      } else if (item?.model_type === "note") {
        if (item?.related_ques) {
          delete item.related_ques;
        }
        newItems.push(item);
      } else if (item.ads_info) {
        continue;
        // 信息流-带货
      } else if (item.card_icon) {
        continue;
        // 信息流-商品
      } else if (item?.note_attributes?.includes("goods")) {
        continue;
      } else {
        newItems.push(item);
      }
    }
    obj.data = newItems;
  }
} else if (url.includes("/v10/search/notes")) {
  if (obj?.data?.items?.length > 0) {
    obj.data.items = obj.data.items.filter((i) => i.model_type === "note");
  }
}

$done({ body: JSON.stringify(obj) });
