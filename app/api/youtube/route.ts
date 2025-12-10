import { NextResponse } from "next/server";

export async function GET() {
  try {
    const CHANNEL_ID = "UCPmAACUzyE1HyOlEvOrWWRw";

    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

    const rss = await fetch(feedUrl);
    const xmlText = await rss.text();

    // --- Extract each <entry> block ---
    const entryBlocks = xmlText.match(/<entry>[\s\S]*?<\/entry>/g) || [];

    const videos = entryBlocks.map((entry: string) => {
      const title = entry.match(/<title>(.*?)<\/title>/)?.[1] || "";
      const videoId = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1] || "";

      return { title, "yt:videoId": videoId };
    });

    return NextResponse.json({ feed: { entry: videos } });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to fetch YouTube feed",
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
