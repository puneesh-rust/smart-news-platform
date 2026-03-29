import React from "react";
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
    <header className="masthead"> <div className="masthead-inner"> <div className="masthead-logo"> <div className="logo-mark">N</div> <div className="logo-text"> <span className="logo-title">NEWS MACHINE</span> <span className="logo-sub">Live Intelligence</span> </div> </div> <div className="search-wrap"> <svg className="search-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> <input className="search-input" type="text" placeholder="Search headlines..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /> </div> </div> <div className="divider-ornament"> <span className="divider-line" /> <span className="divider-diamond">◆</span> <span className="divider-line" /> </div>

      {/* CATEGORY NAV */}
      <nav className="category-nav">
        <div className="category-tabs">
          <button
            className={`tab-btn ${selectedCategory === "" ? "tab-active" : ""}`}
            onClick={() => setSelectedCategory("")}
          >
            All
          </button>

          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`tab-btn ${
                selectedCategory === cat ? "tab-active" : ""
              }`}
              style={
                selectedCategory === cat
                  ? { "--tab-color": CATEGORY_COLORS[cat] }
                  : {}
              }
              onClick={() => setSelectedCategory(cat)}
            >
              <span
                className="tab-dot"
                style={{ background: CATEGORY_COLORS[cat] }}
              />
              {cat}
            </button>
          ))}
        </div>

        {/* DATE BUTTON */}
        <button
          className="date-btn"
          onClick={() => setShowCalendar((p) => !p)}
        >
          {selectedDate.toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </button>
      </nav>
    </header>
  );
};

export default Masthead;