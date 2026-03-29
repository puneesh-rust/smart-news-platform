import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// 🔹 Components
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

// 🔹 Hooks
import { useNews } from "./hooks/useNews";

// 🔹 Helpers
import {
  formatFullDate,
  filterNews,
  paginate,
  getTotalPages,
  toggleReadLaterHelper,
  isReadLaterHelper,
} from "./utils/helpers";

// 🔹 Hardcoded API URL — change this if your backend runs on a different port
const API_BASE = "http://127.0.0.1:8000";

function App() {
  // 📌 States
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const [showCalendar, setShowCalendar] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  const [readLater, setReadLater] = useState([]);
  const [showReadLater, setShowReadLater] = useState(false);

  const [recommendedNews, setRecommendedNews] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState(null);

  // ✅ useRef to avoid stale closure bug in fetchRecommendations
  const activeTitleRef = useRef(null);

  // 📡 Custom Hook
  const { newsHeadlines, isLoading, error } = useNews(
    selectedDate,
    selectedCategory
  );

  // 🌙 Dark Mode Effect
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // ✅ Reset to page 1 on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // 🔍 Filter
  const filteredHeadlines = filterNews(newsHeadlines, searchQuery);

  // 📄 Pagination
  const currentItems = paginate(filteredHeadlines, currentPage, itemsPerPage);
  const totalPages = getTotalPages(filteredHeadlines.length, itemsPerPage);

  // ⭐ Read Later
  const toggleReadLater = (news) => {
    setReadLater((prev) => toggleReadLaterHelper(prev, news));
  };

  const isReadLater = (title) => isReadLaterHelper(readLater, title);

  const displayedNews = showReadLater ? readLater : currentItems;

  // 📅 Date
  const formattedDate = formatFullDate(selectedDate);

  // 🔁 Pagination Change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    document
      .querySelector(".news-grid")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  // 🤖 Recommendation API
  const fetchRecommendations = async (title) => {
    // ✅ Ref-based guard — prevents duplicate API calls
    if (activeTitleRef.current === title) return;
    activeTitleRef.current = title;

    try {
      const res = await fetch(
        `${API_BASE}/recommend/?title=${encodeURIComponent(title)}`
      );

      if (!res.ok) {
        console.error(`Recommendation API error: ${res.status} ${res.statusText}`);
        setRecommendedNews([]);
        return;
      }

      const data = await res.json();
      setRecommendedNews(data);
      setSelectedTitle(title);
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
      setRecommendedNews([]);
    }
  };

  return (
    <div className="app-root">
      {/* 🔝 Top Bar */}
      <TopBar
        formattedDate={formattedDate}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        showReadLater={showReadLater}
        setShowReadLater={setShowReadLater}
        readLater={readLater}
      />

      {/* 📰 Masthead */}
      <Masthead
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedDate={selectedDate}
        setShowCalendar={setShowCalendar}
      />

      {/* 📅 Calendar */}
      <CalendarDrawer
        showCalendar={showCalendar}
        setShowCalendar={setShowCalendar}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />

      {/* 📄 Main Content */}
      <main className="main-content">
        {/* SECTION LABEL */}
        <div className="section-label">
          <span>
            {showReadLater
              ? "Saved Articles"
              : selectedCategory
              ? selectedCategory.toUpperCase()
              : "TOP STORIES"}
          </span>
          <span className="section-count">
            {showReadLater ? readLater.length : filteredHeadlines.length}{" "}
            articles
          </span>
        </div>

        {/* STATES */}
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

        {/* 🤖 Recommendations */}
        <RecommendationSection
          recommendedNews={recommendedNews}
          selectedTitle={selectedTitle}
        />
      </main>

      {/* 🔻 Footer */}
      <Footer />
    </div>
  );
}

export default App;