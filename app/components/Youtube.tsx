"use client";

import { useEffect, useState } from "react";

type Video = {
  title: string;
  videoId: string;
};

export default function Youtube() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const CHANNEL_ID = "UCPmAACUzyE1HyOlEvOrWWRw";
  const CHANNEL_NAME = "VS Coder BD";

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/youtube");

        if (!res.ok) {
          console.error("API ERROR", await res.text());
          return;
        }

        const data = await res.json();
        setVideos(data?.feed?.entry ?? []);
      } catch (err) {
        console.error("Failed to load videos", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <p className="text-center p-5 text-lg">
        Loading videos...
      </p>
    );
  }

  return (
    <main>
      {/* Header */}
      <div className="flex justify-between mb-4 pb-2 items-center border-b">
        <div className="flex gap-2 items-center">
          <img className="w-7" src="/images/svg/media/yt.svg" />
          <h3 className="font-extrabold">{CHANNEL_NAME}</h3>
        </div>

        <a
          href={`https://www.youtube.com/channel/${CHANNEL_ID}?sub_confirmation=1`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700"
        >
          Subscribe
        </a>
      </div>

      {/* Videos */}
      {videos.length === 0 && (
        <p className="text-center text-gray-500 py-6">
          No content uploaded
        </p>
      )}

      {videos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {videos.map((video) => (
            <div
              key={video.videoId}
              className="bg-white rounded-lg shadow hover:shadow-xl transition overflow-hidden"
            >
              <div className="relative aspect-video">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${video.videoId}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>

              <div className="px-2 py-1">
                <h3
                  className="text-xs text-black font-semibold line-clamp-2"
                  title={video.title}
                >
                  {video.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
