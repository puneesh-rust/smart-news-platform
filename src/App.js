
import React, { useState, useEffect, useCallback } from "react";
import Calendar from "react-calendar";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db, auth } from "./firebase.js";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import "react-calendar/dist/Calendar.css";
import "./App.css";
import Marquee from "./components/Marquee.js";
import Pagination from "./pagination.js";

function App() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedCategory, setSelectedCategory] = useState("");
    const [newsHeadlines, setNewsHeadlines] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [isSignIn, setIsSignIn] = useState(true);
    const [authError, setAuthError] = useState("");
    const [showCalendar, setShowCalendar] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6); // Number of news items per page
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, []);

    const toggleDarkMode = () => setDarkMode(!darkMode);

    const fetchNewsForDate = useCallback(async (date) => {
        setIsLoading(true);
        setError(null);
        try {
            // Important fix: Create date range considering IST timezone (UTC+5:30)
            // Create start of day in IST timezone
            const startOfDay = new Date(date);
            // Reset to midnight in IST (which is UTC+5:30)
            startOfDay.setHours(0, 0, 0, 0);
            // Adjust for IST offset (subtract 5 hours and 30 minutes from IST to get UTC time)
            const istOffsetMs = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
            const startOfDayUTC = new Date(startOfDay.getTime() - istOffsetMs);
            
            // Create end of day in IST timezone
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            // Adjust for IST offset
            const endOfDayUTC = new Date(endOfDay.getTime() - istOffsetMs);
            
            console.log("Fetching news with params:", {
                date: date.toISOString(),
                category: selectedCategory,
                startOfDay: startOfDayUTC.toISOString(),
                endOfDay: endOfDayUTC.toISOString()
            });
    
            // Start building the query with the collection reference
            let headlinesRef = collection(db, "headlines");
            
            // Base conditions array for date filtering
            let conditions = [
                where("date", ">=", Timestamp.fromDate(startOfDayUTC)),
                where("date", "<=", Timestamp.fromDate(endOfDayUTC))
            ];
            
            // Create the query with date conditions
            let headlinesQuery = query(headlinesRef, ...conditions);
            
            // Execute the query
            const querySnapshot = await getDocs(headlinesQuery);
            
            // Get all news for the date
            let fetchedNews = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    date: data.date.toDate()
                };
            });
            
            // Apply category filter in JavaScript if selected
            if (selectedCategory && selectedCategory !== "") {
                fetchedNews = fetchedNews.filter(news => 
                    news.category && news.category.toLowerCase() === selectedCategory.toLowerCase()
                );
                console.log(`Filtered to ${fetchedNews.length} items with category: ${selectedCategory}`);
            }
    
            fetchedNews.sort((a, b) => b.date - a.date);
            setNewsHeadlines(fetchedNews);
            setTotalItems(fetchedNews.length);
            setCurrentPage(1); // Reset to first page on new data fetch
            
            console.log("Fetched news count:", fetchedNews.length);
        } catch (error) {
            console.error("Error fetching news:", error);
            setError("Failed to fetch news. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, [selectedCategory]); // Make sure selectedCategory is in dependencies

    useEffect(() => {
        if (user) {
            fetchNewsForDate(selectedDate);
        }
    }, [selectedDate, selectedCategory, user, fetchNewsForDate]);

    const goToToday = () => {
        setSelectedDate(new Date());
        setShowCalendar(!showCalendar);
    };

    const formatDisplayDate = (date) => {
        return date.toLocaleDateString('en-IN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            timeZone: 'Asia/Kolkata'
        });
    };

    const handleSignIn = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setAuthError("");
        } catch (error) {
            setAuthError(error.message);
        }
    };

    const handleSignUp = async (email, password) => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            setAuthError("");
        } catch (error) {
            setAuthError(error.message);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            setShowCalendar(false);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };
    
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        // Scroll to top of news container for better UX
        const newsContainer = document.querySelector('.news-container');
        if (newsContainer) {
            newsContainer.scrollIntoView({ behavior: 'smooth' });
        }
    };
    
    // Get current items for pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = newsHeadlines.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(newsHeadlines.length / itemsPerPage);

    // Handle category change
    const handleCategoryChange = (e) => {
        const newCategory = e.target.value;
        console.log("Category changed to:", newCategory);
        setSelectedCategory(newCategory);
    };

    return (
        <div className={`App ${darkMode ? "dark-mode" : "light-mode"}`}>
            <header className="app-header">
                <div className="logo">
                    <h1>📰 News Calendar</h1>
                </div>
                <div className="header-buttons">
                    <button className="eye-button" onClick={toggleDarkMode}>
                        {darkMode ? "👁️‍🗨️" : "👁️"}
                    </button>
                    {user && (
                        <>
                            <button className="sign-out-button" onClick={handleSignOut}>
                                Sign Out
                            </button>
                            <div>
                                <select
                                    className="category-filter"
                                    onChange={handleCategoryChange}
                                    value={selectedCategory}
                                >
                                    <option value="">All Categories</option>
                                    <option value="Business">Business</option>
                                    <option value="POLITICS">Politics</option>
                                    <option value="World Affairs">World Affairs</option>
                                    <option value="Science">Science</option>
                                </select>
                            </div>
                        </>
                    )}
                </div>
            </header>
            {user && <Marquee headlines={newsHeadlines} />}

            <main>
                
                {user ? (
                    <div className="main-content">
                        <div className="selected-date-display">
                            <h2> {formatDisplayDate(selectedDate)}</h2>
                            <button className="today-button" onClick={goToToday}>
                                {showCalendar ? "Hide Calendar" : "Change Date"}
                            </button>
                        </div>
                        
                        
                        {showCalendar && (
                            <div className="calendar-wrapper centered-calendar">
                                <Calendar
                                    onChange={(date) => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        if (date > today) {
                                            alert("Cannot select future dates.");
                                        } else {
                                            setSelectedDate(date);
                                            setShowCalendar(false);
                                        }
                                    }}

                                    value={selectedDate}
                                    className="modern-calendar"
                                    tileClassName={({ date }) => {
                                        const dateStr = date.toISOString().split('T')[0];
                                        const selectedDateStr = selectedDate.toISOString().split('T')[0];
                                        return dateStr === selectedDateStr ? 'highlight' : null;
                                    }}
                                    maxDate={new Date()}
                                />
                            </div>
                        )}
                        
                        <div className="news-container">
                            {isLoading ? (
                                <div className="loading-container">
                                    <p className="loading">Loading news...</p>
                                    <div className="loading-spinner"></div>
                                </div>
                            ) : error ? (
                                <p className="error">{error}</p>
                            ) : (
                                <>
                                    
                                    
                                    <AnimatePresence>
                                        
                                    {currentItems.map((news) => (
  <motion.div
    key={news.id}
    initial={{ x: -300, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: 300, opacity: 0 }}
    transition={{ duration: 0.5 }}
    className="news-item"
  >
    <h3>{news.title}</h3>
    {/* Add description here */}
    {news.description && (
      <p className="news-description">{news.description}</p>
    )}
    {news.category && (
      <span className={`category-tag ${news.category.toLowerCase().replace(/\s+/g, '-')}`}>
        {news.category}
      </span>
    )}
    <p className="news-date">
      {news.date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })}
    </p>
    <a href={news.link} target="_blank" rel="noopener noreferrer">
      Read more &rarr;
    </a>
  </motion.div>
))}
                                    </AnimatePresence>
                                    
                                    {newsHeadlines.length > 0 && (
                                        <div className="pagination-wrapper">
                                            <Pagination 
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                onPageChange={handlePageChange}
                                            />
                                            <div className="page-info">
                                                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} of {totalItems} news
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                            {!isLoading && newsHeadlines.length === 0 && (
                                <div className="no-news-container">
                                    <p className="no-news">No news available for {formatDisplayDate(selectedDate)}
                                    {selectedCategory && ` in the ${selectedCategory} category`}.
                                    </p>
                                    <p>Try selecting a different date{selectedCategory && ' or category'}.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="auth-container">
                        {isSignIn ? (
                            <>
                                <h2>Sign In</h2>
                                {authError && <p className="auth-error">{authError}</p>}
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSignIn(e.target.email.value, e.target.password.value);
                                }}>
                                    <input type="email" name="email" placeholder="Email" required className="auth-input"/>
                                    <input type="password" name="password" placeholder="Password" required className="auth-input"/>
                                    <button type="submit" className="auth-button">Sign In</button>
                                </form>
                                <p className="auth-switch">
                                    Need an account? <span onClick={() => setIsSignIn(false)}>Sign Up</span>
                                </p>
                            </>
                        ) : (
                            <>
                                <h2>Sign Up</h2>
                                {authError && <p className="auth-error">{authError}</p>}
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSignUp(e.target.email.value, e.target.password.value);
                                }}>
                                    <input type="email" name="email" placeholder="Email" required className="auth-input"/>
                                    <input type="password" name="password" placeholder="Password" required className="auth-input"/>
                                    <button type="submit" className="auth-button">Sign Up</button>
                                </form>
                                <p className="auth-switch">
                                    Already have an account? <span onClick={() => setIsSignIn(true)}>Sign In</span>
                                </p>
                            </>
                        )}
                    </div>
                )}
            </main>

            <footer>
                <div className="footer-icons">
                    <button className="link-button" onClick={() => window.open('#', '_blank', 'noopener noreferrer')}>
                        <img src="../public/icons8-android-48.png" alt="Android App" />
                    </button>
                    <button className="link-button" onClick={() => window.open('#', '_blank', 'noopener noreferrer')}>
                        <img src="../public/icons8-apple-24.png" alt="iOS App" />
                    </button>
                </div>
                <p> News Calendar </p>
            </footer>
        </div>
    );
}

export default App;