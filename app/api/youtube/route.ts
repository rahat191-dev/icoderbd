import { NextResponse } from "next/server";

export async function GET() {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

  if (!API_KEY || !CHANNEL_ID) {
    console.error("YouTube API route error: API_KEY বা CHANNEL_ID পাওয়া যায়নি।");
    return NextResponse.json(
      { success: false, error: "Server environment variables missing" },
      { status: 500 }
    );
  }

  try {
    // Channel info
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${CHANNEL_ID}&key=${API_KEY}`
    );
    const channelData = await channelRes.json();

    if (!channelData.items || channelData.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Channel not found." },
        { status: 404 }
      );
    }

    const channelLogo =
      channelData.items[0].snippet.thumbnails.medium.url || "";

    // Videos fetch
    const videoRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=10`
    );
    const videoData = await videoRes.json();

    const videos = videoData.items
      .filter((item: any) => item.id.kind === "youtube#video")
      .map((item: any) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        publishedAt: item.snippet.publishedAt,
      }));

    return NextResponse.json({ success: true, channelLogo, videos });
  } catch (error) {
    console.error("YouTube API Fetch Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch YouTube data" },
      { status: 500 }
    );
  }
}
