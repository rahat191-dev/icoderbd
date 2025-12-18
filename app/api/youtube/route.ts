import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const CHANNEL_ID = "UCPmAACUzyE1HyOlEvOrWWRw";

    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

    const res = await fetch(feedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Next.js Server)",
        "Accept": "application/xml",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch RSS");
    }

    const xmlText = await res.text();

    const entryBlocks =
      xmlText.match(/<entry>[\s\S]*?<\/entry>/g) || [];

    const videos = entryBlocks.map((entry) => {
      const title =
        entry.match(/<title>(.*?)<\/title>/)?.[1] ?? "";

      const videoId =
        entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1] ?? "";

      return {
        title,
        videoId,
      };
    });

    return NextResponse.json({
      feed: {
        entry: videos,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to fetch YouTube feed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
