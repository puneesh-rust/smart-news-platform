import React from "react";

const TopBar = ({ formattedDate, darkMode, toggleDarkMode, showReadLater, setShowReadLater, readLater }) => {
  return (
    <div className="top-bar">
      <span className="top-bar-date">{formattedDate}</span>
      <span className="top-bar-tagline">Your Daily Intelligence Briefing</span>

      <div className="top-bar-right">
        {/* DARK MODE */}
        <button className="ghost-btn" onClick={toggleDarkMode}>
          {darkMode ? "Light" : "Dark"}
        </button>

        {/* SAVED */}
        <button
          className={`ghost-btn ${showReadLater ? "ghost-btn-active" : ""}`}
          onClick={() => setShowReadLater((p) => !p)}
        >
          Saved
          {readLater.length > 0 && (
            <span className="saved-badge">{readLater.length}</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default TopBar;