import React from "react";
import { Moon, Sun, Bookmark } from "lucide-react";

const TopBar = ({
  darkMode,
  toggleDarkMode,
  showReadLater,
  setShowReadLater,
  readLater,
}) => {
  return (
    <>
      {/* Dark Mode */}
      <button
        onClick={toggleDarkMode}
        className="ghost-btn"
      >
        {darkMode ? <Sun size={13} /> : <Moon size={13} />}
        {darkMode ? "Light" : "Dark"}
      </button>

      <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.15)" }} />

      {/* Saved */}
      <button
        onClick={() => setShowReadLater((p) => !p)}
        className={`ghost-btn ${showReadLater ? "ghost-btn-active" : ""}`}
        style={{ position: "relative" }}
      >
        <Bookmark size={13} />
        Saved
        {readLater.length > 0 && (
          <span className="saved-badge">{readLater.length}</span>
        )}
      </button>
    </>
  );
};

export default TopBar;