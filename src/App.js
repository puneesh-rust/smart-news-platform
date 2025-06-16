

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
import androidIcon from './assest/Android_icon-icons.com_60488.ico';
import appleIcon from './assest/social_apple_mac_65.png'

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
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("darkMode") === "true" || false
    );
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6); // Allow changing items per page
    const [totalItems, setTotalItems] = useState(0);

    // Use localStorage to persist dark mode preference
    //Stores user preference in localStorage and toggles a class on body.
    useEffect(() => {
        localStorage.setItem("darkMode", darkMode);
        document.body.classList.toggle("dark-mode", darkMode);
    }, [darkMode]);

     // Monitors login state and sets user accordingly.
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, []);

    const toggleDarkMode = () => setDarkMode(!darkMode);
    //Main logic for retrieving news from Firestore 
    //Adjusts time to IST.
    // Filters by date range.

    // Applies category filter (if any).

    // Sorts and stores headlines.

    // Handles errors and loading state.
    const fetchNewsForDate = useCallback(async (date) => {
        setIsLoading(true);
        setError(null);
        try {
            // Create date range considering IST timezone (UTC+5:30)
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const istOffsetMs = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
            const startOfDayUTC = new Date(startOfDay.getTime() - istOffsetMs);
            
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
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
    }, [selectedCategory]);
     // Ensures data is refetched when relevant inputs change.
    useEffect(() => {
        if (user) {
            fetchNewsForDate(selectedDate);
        }
    }, [selectedDate, selectedCategory, user, fetchNewsForDate]);
     //Shows/hides calendar and sets date to today.
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
   // signIN function (firebase)
    const handleSignIn = async (email, password) => {
        try {
            setIsLoading(true);
            await signInWithEmailAndPassword(auth, email, password);
            setAuthError("");
        } catch (error) {
            setAuthError(error.message);
        } finally {
            setIsLoading(false);
        }
    };
     // signup
    const handleSignUp = async (email, password) => {
        try {
            setIsLoading(true);
            await createUserWithEmailAndPassword(auth, email, password);
            setAuthError("");
        } catch (error) {
            setAuthError(error.message);
        } finally {
            setIsLoading(false);
        }
    };
    // signout
    const handleSignOut = async () => {
        try {
            await signOut(auth);
            setShowCalendar(false);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };
     //Calculates and displays paginated news results.
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

    // Handle items per page change
    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    return (
        <div className={`App ${darkMode ? "dark-mode" : ""}`}>
 
 
            <header className="app-header">
                <div className="logo">
                    <h1>📰 News Machine</h1>
                </div>
                <div className="header-buttons">
                    <button className="eye-button" onClick={toggleDarkMode} aria-label="Toggle dark mode">
                        {darkMode ? "💡" : "🌙"}
                    </button>
                    {user && (
                        <>
                            <button className="today-button" onClick={goToToday}>
                                {showCalendar ? "Hide Calendar" : "Change Date"}
                            </button>
                            <select
                                className="category-filter"
                                onChange={handleCategoryChange}
                                value={selectedCategory}
                                aria-label="Filter by category"
                            >
                                <option value="">All Categories</option>
                                <option value="business">Business</option>
                                <option value="politics">Politics</option>
                                <option value="world affairs">World Affairs</option>
                                <option value="science">Science</option>
                               
                               
                            </select>
                            <button className="sign-out-button" onClick={handleSignOut}>
                                Sign Out
                            </button>
                        </>
                    )}
                </div>
            </header>
            
            {user && <Marquee headlines={newsHeadlines} darkMode={darkMode} />}

            <main className="main-content">
                {user ? (
                    <>
                        <div className="selected-date-display">
                            <h2>{formatDisplayDate(selectedDate)}</h2>
                        </div>
                        
                        {showCalendar && (
                            <div className="centered-calendar">
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
                                    className={`modern-calendar ${darkMode ? "dark-mode" : ""}`}
                                    tileClassName={({ date }) => {
                                        const dateStr = date.toISOString().split('T')[0];
                                        const selectedDateStr = selectedDate.toISOString().split('T')[0];
                                        return dateStr === selectedDateStr ? 'selected-tile' : null;
                                    }}
                                    maxDate={new Date()}
                                />
                            </div>
                        )}
                        
                        {/* Active filters display */}
                        {selectedCategory && (
                            <div className="active-filters">
                                <div className="filter-chip">
                                    Category: {selectedCategory}
                                    <button 
                                        className="clear-filter" 
                                        onClick={() => setSelectedCategory("")}
                                        aria-label="Clear category filter"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {/* Items per page selector */}
                        <div className="items-per-page-container">
                            <label htmlFor="items-per-page">News per page: </label>
                            <select
                                id="items-per-page"
                                className="items-per-page-filter"
                                value={itemsPerPage}
                                onChange={handleItemsPerPageChange}
                            >
                                <option value={3}>3</option>
                                <option value={6}>6</option>
                                <option value={9}>9</option>
                                <option value={12}>12</option>
                            </select>
                        </div>
                        
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
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.3 }}
                                                className="news-item"
                                            >
                                                <h3>{news.title}</h3>
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
                                                <a href={news.link} target="_blank" rel="noopener noreferrer" className="read-more-link">
                                                    Read more &rarr;
                                                </a>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    
                                    {newsHeadlines.length > 0 && newsHeadlines.length > itemsPerPage && (
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
                    </>
                ) : (
                    <div className="auth-container">
                        {isSignIn ? (
                            <>
                                <h2>Sign In to News Calendar</h2>
                                {authError && <p className="auth-error">{authError}</p>}
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSignIn(e.target.email.value, e.target.password.value);
                                }}>
                                    <input type="email" name="email" placeholder="Email" required className="auth-input"/>
                                    <input type="password" name="password" placeholder="Password" required className="auth-input"/>
                                    <button type="submit" className="auth-button" disabled={isLoading}>
                                        {isLoading ? "Signing In..." : "Sign In"}
                                    </button>
                                </form>
                                <p className="auth-switch">
                                    Need an account? <span onClick={() => setIsSignIn(false)}>Sign Up</span>
                                </p>
                            </>
                        ) : (
                            <>
                                <h2>Create an Account</h2>
                                {authError && <p className="auth-error">{authError}</p>}
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSignUp(e.target.email.value, e.target.password.value);
                                }}>
                                    <input type="email" name="email" placeholder="Email" required className="auth-input"/>
                                    <input type="password" name="password" placeholder="Password" required className="auth-input"/>
                                    <button type="submit" className="auth-button" disabled={isLoading}>
                                        {isLoading ? "Creating Account..." : "Sign Up"}
                                    </button>
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
                    <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer" className="link-button" aria-label="Android App">
                        <img src={androidIcon} alt="Android App" className="app-icon" />
                    </a>
                    <a href="https://www.apple.com/app-store/" target="_blank" rel="noopener noreferrer" className="link-button" aria-label="Apple App">
                        <img src={appleIcon} alt="Apple App" className="app-icon" />
                    </a>
                </div>
                <p className="footer-text">© {new Date().getFullYear()} News Calendar. All rights reserved.</p>
            </footer>

        </div>
    );
}

export default App;