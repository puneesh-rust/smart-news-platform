import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import CatCursor from "../src/components/ui/CatCursor";

import TopBar from "./components/layout/TopBar";
import Masthead from "./components/layout/Masthead";
import Footer from "./components/layout/Footer";
import NewsGrid from "./components/news/NewsGrid";
import RecommendationSection from "./components/news/RecommendationSection";
import CalendarDrawer from "./components/ui/CalendarDrawer";
import Loader from "./components/ui/Loader";
import ErrorState from "./components/ui/ErrorState";
import EmptyState from "./components/ui/EmptyState";
import Pagination from "./components/Pagination";

import { useNews } from "./hooks/useNews";
import {
  formatFullDate, filterNews, paginate,
  getTotalPages, toggleReadLaterHelper, isReadLaterHelper,
} from "./utils/helpers";

const API_BASE = "http://127.0.0.1:8000";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, []);

  const [selectedDate, setSelectedDate]         = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery]           = useState("");
  const [darkMode, setDarkMode]                 = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [showCalendar, setShowCalendar]         = useState(false);
  const [currentPage, setCurrentPage]           = useState(1);
  const [itemsPerPage]                          = useState(6);
  const [readLater, setReadLater]               = useState([]);
  const [showReadLater, setShowReadLater]       = useState(false);
  const [recommendedNews, setRecommendedNews]   = useState([]);
  const [selectedTitle, setSelectedTitle]       = useState(null);
  const activeTitleRef                          = useRef(null);

  const { newsHeadlines, isLoading, error } = useNews(selectedDate, selectedCategory);

  // ✅ Dark mode — App.css uses body.dark-mode class
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedCategory]);

  const filteredHeadlines = filterNews(newsHeadlines, searchQuery);
  const currentItems      = paginate(filteredHeadlines, currentPage, itemsPerPage);
  const totalPages        = getTotalPages(filteredHeadlines.length, itemsPerPage);
  const displayedNews     = showReadLater ? readLater : currentItems;
  const formattedDate     = formatFullDate(selectedDate);

  const toggleReadLater = (news) => setReadLater((prev) => toggleReadLaterHelper(prev, news));
  const isReadLater     = (title) => isReadLaterHelper(readLater, title);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    document.querySelector(".news-grid")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const fetchRecommendations = async (title) => {
    if (activeTitleRef.current === title) return;
    activeTitleRef.current = title;
    try {
      const res  = await fetch(`${API_BASE}/recommend/?title=${encodeURIComponent(title)}`);
      const data = res.ok ? await res.json() : [];
      setRecommendedNews(data);
      setSelectedTitle(title);
    } catch {
      setRecommendedNews([]);
    }
  };

  return (
    <div className="app-root">
       <CatCursor />

      {/* ✅ TOP BAR — TopBar + Logout ek saath */}
      <div className="top-bar">
        <span className="top-bar-tagline">Your Daily Intelligence Briefing</span>
        <div className="top-bar-right">
          <TopBar
            darkMode={darkMode}
            toggleDarkMode={() => setDarkMode(p => !p)}
            showReadLater={showReadLater}
            setShowReadLater={setShowReadLater}
            readLater={readLater}
          />
          <button
            onClick={handleLogout}
            className="ghost-btn"
            style={{ color: "#f87171", borderColor: "rgba(248,113,113,0.3)" }}
          >
            <LogOut size={13} />
            Logout
          </button>
        </div>
      </div>

      <Masthead
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedDate={selectedDate}
        setShowCalendar={setShowCalendar}
      />

      <CalendarDrawer
        showCalendar={showCalendar}
        setShowCalendar={setShowCalendar}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />

      <main className="main-content">
        <div className="section-label">
          <span>
            {showReadLater ? "Saved Articles" : selectedCategory ? selectedCategory.toUpperCase() : "TOP STORIES"}
          </span>
          <span className="section-count">
            {showReadLater ? readLater.length : filteredHeadlines.length} articles
          </span>
        </div>

        {isLoading ? (
          <Loader />
        ) : error ? (
          <ErrorState message={error} />
        ) : displayedNews.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <NewsGrid
              newsList={displayedNews}
              toggleReadLater={toggleReadLater}
              fetchRecommendations={fetchRecommendations}
              isReadLater={isReadLater}
            />
            {!showReadLater && filteredHeadlines.length > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}

        <RecommendationSection
          recommendedNews={recommendedNews}
          selectedTitle={selectedTitle}
        />
      </main>

      <Footer />
    </div>
  );
}

export default App;