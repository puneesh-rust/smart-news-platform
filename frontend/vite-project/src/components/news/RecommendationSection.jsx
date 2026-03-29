import React from "react";
import { motion } from "framer-motion";
import { CATEGORY_COLORS } from "../../utils/constants.js";

const RecommendationSection = ({ recommendedNews, selectedTitle }) => {
  if (!recommendedNews || recommendedNews.length === 0) return null;

  return (
    <section className="recommend-section">
      {/* HEADER */}
      <div className="recommend-header">
        <div className="divider-ornament">
          <span className="divider-line" />
          <span className="divider-diamond">◆</span>
          <span className="divider-line" />
        </div>

        <h2 className="recommend-title">Related to</h2>
        <p className="recommend-query">"{selectedTitle}"</p>
      </div>

      {/* GRID */}
      <div className="news-grid">
        {recommendedNews.map((item, index) => {
          const accent = CATEGORY_COLORS[item.category] || "#00C896";

          return (
            <motion.div
              key={index}
              className="card"
              style={{ "--accent": accent }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div
                className="card-accent-bar"
                style={{ background: accent }}
              />

              <div className="card-body">
                <div className="card-meta">
                  <span
                    className="card-category"
                    style={{ color: accent }}
                  >
                    {item.category?.toUpperCase()}
                  </span>
                </div>

                <h3 className="card-title">{item.title}</h3>

                {item.description && (
                  <p className="card-desc">{item.description}</p>
                )}

                <div className="card-footer">
                  <span />
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-link"
                  >
                    Read article
                  </a>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default RecommendationSection;