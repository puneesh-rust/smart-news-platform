import { Bookmark, BookmarkCheck, Sparkles, ExternalLink } from "lucide-react";

const CATEGORY_CONFIG = {
  "Business":      { bar: "#f59e0b", badge: "rgba(245,158,11,0.12)",  text: "#fcd34d", border: "rgba(245,158,11,0.25)"  },
  "Sports":        { bar: "#10b981", badge: "rgba(16,185,129,0.12)", text: "#6ee7b7", border: "rgba(16,185,129,0.25)" },
  "World Affairs": { bar: "#3b82f6", badge: "rgba(59,130,246,0.12)", text: "#93c5fd", border: "rgba(59,130,246,0.25)" },
  "Science":       { bar: "#ec4899", badge: "rgba(236,72,153,0.12)", text: "#f9a8d4", border: "rgba(236,72,153,0.25)" },
  "Technology":    { bar: "#8b5cf6", badge: "rgba(139,92,246,0.12)", text: "#c4b5fd", border: "rgba(139,92,246,0.25)" },
  "Health":        { bar: "#f43f5e", badge: "rgba(244,63,94,0.12)",  text: "#fda4af", border: "rgba(244,63,94,0.25)"  },
  "default":       { bar: "#22d3ee", badge: "rgba(34,211,238,0.12)", text: "#67e8f9", border: "rgba(34,211,238,0.25)" },
};

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = Math.floor((new Date() - new Date(dateStr)) / 60000);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
};

const NewsCard = ({ news, onSave, onRecommend, isSaved }) => {
  const cfg = CATEGORY_CONFIG[news.category] || CATEGORY_CONFIG["default"];
  const articleLink = news.link || news.url || null;

  return (
    <div
      className="group flex flex-col rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5"
      style={{
        background: "var(--surface)",

        border: "1px solid var(--border)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${cfg.bar}40`;
        e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px ${cfg.bar}20`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
        e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.3)";
      }}
    >
      {/* Top glow line */}
      <div
        style={{
          height: "2px",
          background: `linear-gradient(90deg, transparent, ${cfg.bar}, transparent)`,
          opacity: 0.8,
        }}
      />

      <div className="flex flex-col flex-1 p-5 gap-3">

        {/* Category + Time */}
        <div className="flex items-center justify-between">
          <span
            className="text-[10px] font-black tracking-[0.18em] uppercase px-2.5 py-1 rounded-full"
            style={{
              background: cfg.badge,
              color: cfg.text,
              border: `1px solid ${cfg.border}`,
            }}
          >
            {news.category || "General"}
          </span>
          {news.published_at && (
            <span className="text-[10px] font-mono text-gray-600">
              {timeAgo(news.published_at)}
            </span>
          )}
        </div>

        {/* Title */}
        {/* Title */}
<h3
  className="text-[15px] font-bold leading-snug line-clamp-3 transition-colors duration-200"
  style={{
    fontFamily: "'Space Grotesk', Georgia, serif",
    color: "var(--text-1)",  // ✅ CSS variable use karo
  }}
>
  {news.title}
</h3>

        {/* Description */}
        {news.description && (
          <p className="text-[12.5px] leading-relaxed line-clamp-3 text-gray-500">
            {news.description}
          </p>
        )}

        {/* Footer */}
        <div
          className="flex items-center justify-between pt-3 mt-auto"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="flex gap-2">

            {/* Similar Button */}
            <button
              onClick={() => onRecommend?.(news.title)}
              className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full text-gray-500 transition-all duration-200 hover:text-purple-300 hover:-translate-y-0.5"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(139,92,246,0.12)";
                e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
              }}
            >
              <Sparkles className="w-3 h-3" />
              Similar
            </button>

            {/* Save Button */}
            <button
              onClick={() => onSave?.(news)}
              className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all duration-200 hover:-translate-y-0.5"
              style={
                isSaved
                  ? {
                      background: "rgba(34,211,238,0.12)",
                      color: "#67e8f9",
                      border: "1px solid rgba(34,211,238,0.3)",
                    }
                  : {
                      background: "rgba(255,255,255,0.04)",
                      color: "#6b7280",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }
              }
            >
              {isSaved
                ? <><BookmarkCheck className="w-3 h-3" /> Saved</>
                : <><Bookmark className="w-3 h-3" /> Save</>
              }
            </button>

          </div>

          {/* Read Link */}
          {articleLink && (
            <a
              href={articleLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[11px] font-mono text-gray-600 hover:text-cyan-400 transition-colors duration-200 px-2 py-1 rounded-full hover:bg-cyan-500/5"
            >
              Read <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsCard;

