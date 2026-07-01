import React from "react";
import { Search, CalendarDays } from "lucide-react";
import { CATEGORIES, CATEGORY_COLORS } from "../../utils/constants";

const Masthead = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedDate,
  setShowCalendar,
}) => {
  return (
    <header className="masthead">
      <div className="masthead-inner">

        {/* LOGO */}
        <div className="masthead-logo">
          <div className="logo-mark">N</div>
          <div className="logo-text">
            <span className="logo-title">News Machine</span>
            <span className="logo-sub">Live Intelligence</span>
          </div>
        </div>

        {/* SEARCH */}
        <div className="search-wrap">
          <Search className="search-icon" size={15} />
          <input
            type="text"
            placeholder="Search headlines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

      </div>

      {/* ORNAMENT */}
      <div className="divider-ornament">
        <div className="divider-line" />
        <span className="divider-diamond">◆</span>
        <div className="divider-line" />
      </div>

      {/* CATEGORY NAV */}
      <div className="category-nav">
        <div className="category-tabs">

          <button
            onClick={() => setSelectedCategory("")}
            className={`tab-btn ${selectedCategory === "" ? "tab-active" : ""}`}
            style={{ "--tab-color": "var(--gold)" }}
          >
            All
          </button>

          {CATEGORIES.map((cat) => {
            const color = CATEGORY_COLORS[cat] || "var(--gold)";
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`tab-btn ${active ? "tab-active" : ""}`}
                style={{ "--tab-color": color }}
              >
                <span
                  className="tab-dot"
                  style={{ background: color }}
                />
                {cat}
              </button>
            );
          })}
        </div>

        {/* DATE BUTTON */}
        <button
          onClick={() => setShowCalendar((p) => !p)}
          className="date-btn"
        >
          <CalendarDays size={13} />
          {selectedDate.toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </button>
      </div>

    </header>
  );
};

export default Masthead;