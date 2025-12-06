import { NextResponse } from "next/server";

export async function GET() {
  try {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

    if (!API_KEY || !CHANNEL_ID) {
      return NextResponse.json(
        { error: "Missing API KEY or Channel ID" },
        { status: 500 }
      );
    }

    // Timeout Controller (Slow Internet Protection)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8 sec timeout

    // --- Get channel info ---
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${CHANNEL_ID}&key=${API_KEY}`,
      { signal: controller.signal }
    );

    if (!channelRes.ok) {
      clearTimeout(timeout);
      return NextResponse.json(
        { error: "Failed to load channel data", status: channelRes.status },
        { status: 500 }
      );
    }

    const channelData = await channelRes.json();

    const channelLogo =
      channelData.items?.[0]?.snippet?.thumbnails?.high?.url || "";
    const channelTitle = channelData.items?.[0]?.snippet?.title || "";

    // --- Get videos ---
    const videoRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=12`,
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    if (!videoRes.ok) {
      return NextResponse.json(
        { error: "Failed to load videos", status: videoRes.status },
        { status: 500 }
      );
    }

    const videoData = await videoRes.json();

    const videos =
      videoData.items
        ?.filter((item: any) => item.id.kind === "youtube#video")
        .map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.high.url,
        })) || [];

    return NextResponse.json({
      channelId: CHANNEL_ID,
      channelLogo,
      channelTitle,
      videos,
    });
  } catch (err: any) {
    if (err.name === "AbortError") {
      return NextResponse.json(
        { error: "Slow Network — Request Timeout (8s)" },
        { status: 408 } // Timeout response
      );
    }

    return NextResponse.json(
      { error: "Server Error", message: err.message },
      { status: 500 }
    );
  }
}
