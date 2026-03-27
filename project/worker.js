export default {
  async fetch(request) {

    const API = "https://store.externulls.com/tag/videos/comatozze?limit=48&offset=0";
    const BASE = "https://video.pat.com/";

    try {
      const res = await fetch(API, {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      const data = await res.json();

      const videos = [];

      for (const item of data) {
        try {

          // 🎬 Title
          const title = item?.file?.data?.[0]?.cd_value || "No Title";

          // ⏱ Duration (mm:ss)
          const dur = item?.file?.fl_duration || 0;
          const minutes = Math.floor(dur / 60);
          const seconds = dur % 60;
          const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

          // 🆔 Video ID
          const videoId = item?.file?.id || 0;

          // 🖼 Thumbnail
          const thumbId = item?.fc_facts?.[0]?.fc_thumbs?.[0] || 1;
          const thumbnail = videoId
            ? `https://thumbs.externulls.com/videos/${videoId}/${thumbId}.webp?size=480x270`
            : "";

          // 📺 M3U8
          const hlsPath = item?.file?.hls_resources?.fl_cdn_multi;
          const m3u8 = hlsPath ? BASE + hlsPath + ".m3u8" : "";

          // ✅ Only valid items
          if (videoId && m3u8) {
            videos.push({
              title,
              duration,
              thumbnail,
              m3u8
            });
          }

        } catch (e) {
          // skip broken item
        }
      }

      return new Response(JSON.stringify({
        status: true,
        count: videos.length,
        data: videos
      }, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store"
        }
      });

    } catch (err) {
      return new Response(JSON.stringify({
        status: false,
        error: err.toString()
      }), {
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
  }
};
