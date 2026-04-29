import { useState } from 'react';

export default function YouTubePanel({ videos, location, isLoading, error }) {
  const [activeId, setActiveId] = useState(null);

  if (isLoading) {
    return (
      <section aria-label="Weather and conditions videos">
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-3 px-1">
          Weather & Conditions
        </h3>
        <div className="glass rounded-2xl p-6 flex items-center justify-center gap-3 text-white/50 text-sm">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
          Loading videos…
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section aria-label="Weather and conditions videos">
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-3 px-1">
          Weather & Conditions
        </h3>
        <div className="glass rounded-2xl px-4 py-3 text-sm text-white/50">
          Weather & Conditions unavailable — {error}
        </div>
      </section>
    );
  }

  if (!videos || videos.length === 0) return null;

  return (
    <section aria-label="Weather and conditions videos">
      <h3 className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-3 px-1">
        Weather &amp; Local Scene · {location}
      </h3>
      <div className="flex flex-col gap-3">
        {videos.map((v) => (
          <div key={v.videoId} className="glass rounded-xl overflow-hidden">
            {/* Thumbnail / embedded player */}
            {activeId === v.videoId ? (
              <iframe
                className="w-full aspect-video"
                src={'https://www.youtube.com/embed/' + v.videoId + '?autoplay=1'}
                title={v.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                onClick={() => setActiveId(v.videoId)}
                className="relative w-full aspect-video group focus:outline-none"
                aria-label={'Play: ' + v.title}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={v.thumbnail}
                  alt={v.title}
                  className="w-full h-full object-cover"
                />
                {/* Play overlay */}
                <span className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/45 transition-colors">
                  <span className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-red-600 ml-1" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </span>
              </button>
            )}

            {/* Title + channel */}
            <div className="px-3 py-2.5">
              <p className="text-xs font-semibold text-white leading-snug line-clamp-2">{v.title}</p>
              <p className="text-xs text-white/45 mt-1 truncate">{v.channelTitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
