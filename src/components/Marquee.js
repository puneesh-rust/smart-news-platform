
import React, { useEffect, useRef, useState } from "react";

const Marquee = ({ 
  headlines = [], 
  speed = 40, 
  label = "BREAKING",
  darkMode = false
}) => {
  const marqueeRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [duplicatedHeadlines, setDuplicatedHeadlines] = useState([]);
  
  // Duplicate headlines to ensure continuous scrolling
  useEffect(() => {
    if (headlines.length > 0) {
      // If we have fewer than 10 headlines, duplicate them to ensure smooth continuous scrolling
      if (headlines.length < 10) {
        const repeated = [...Array(Math.ceil(10 / headlines.length))].flatMap(() => headlines);
        setDuplicatedHeadlines(repeated.slice(0, 20)); // Limit to 20 items max
      } else {
        setDuplicatedHeadlines([...headlines]);
      }
    }
  }, [headlines]);

  // Adjust animation speed dynamically
  useEffect(() => {
    if (marqueeRef.current) {
      const contentElement = marqueeRef.current.querySelector('.marquee-content');
      if (contentElement) {
        contentElement.style.animationDuration = `${speed}s`;
      }
    }
  }, [speed, duplicatedHeadlines]);

  // Pause marquee on hover
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);
  
  // If no headlines, don't render anything
  if (headlines.length === 0) {
    return null;
  }

  // Format timestamp for the marquee
  const formatTime = (date) => {
    if (!date) return '';
    
    return new Date(date).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div 
      className={`marquee-container ${isPaused ? 'paused' : ''} ${darkMode ? 'dark-mode' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={marqueeRef}
    >
      <div className="marquee-label">{label}</div>
      <div className="marquee-content">
        {duplicatedHeadlines.map((headline, index) => (
          <span key={`${headline.id || index}-${index}`} className="marquee-item">
            <span className="marquee-title">{headline.title}</span>
            {headline.category && (
              <span className={`marquee-category ${headline.category.toLowerCase().replace(/\s+/g, '-')}`}>
                {headline.category}
              </span>
            )}
            {headline.date && (
              <span className="marquee-time">{formatTime(headline.date)}</span>
            )}
            <a 
              href={headline.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="marquee-link"
              onClick={(e) => e.stopPropagation()}
            >
              Read more
            </a>
            <span className="marquee-separator">•</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;