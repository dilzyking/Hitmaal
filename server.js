export default {
  async fetch(request) {

    const API = "https://store.externulls.com/tag/videos/comatozze?limit=48&offset=0";
    const BASE = "https://video.pat.com/";

    try {
      const response = await fetch(API, {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      const json = await response.json();

      const videos = [];

      for (const item of json) {

        try {

          // ✅ TITLE
          const title = item?.file?.data?.[0]?.cd_value || "No Title";

          // ✅ DURATION (formatted)
          const dur = item?.file?.fl_duration || 0;
          const minutes = Math.floor(dur / 60);
          const seconds = dur % 60;
          const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

          // ✅ VIDEO ID
          const videoId = item?.file?.id || 0;

          // ✅ THUMB
          const thumbId = item?.fc_facts?.[0]?.fc_thumbs?.[0] || 1;
          const thumbnail = videoId
            ? `https://thumbs.externulls.com/videos/${videoId}/${thumbId}.webp?size=480x270`
            : "";

          // ✅ M3U8
          let m3u8 = "";
          const hlsPath = item?.file?.hls_resources?.fl_cdn_multi;

          if (hlsPath) {
            m3u8 = BASE + hlsPath + ".m3u8";
          }

          // ✅ PUSH ONLY VALID
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

    } catch (error) {

      return new Response(JSON.stringify({
        status: false,
        message: "API Fetch Failed",
        error: error.toString()
      }, null, 2), {
        headers: {
          "Content-Type": "application/json"
        }
      });

    }
  }
}
