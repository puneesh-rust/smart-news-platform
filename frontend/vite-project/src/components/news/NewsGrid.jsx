import NewsCard from "./NewsCard";

const NewsGrid = ({ newsList, toggleReadLater, fetchRecommendations, isReadLater }) => {
  return (
    <div className="news-grid">
      {newsList.map((news, i) => (
        <NewsCard
          key={i}
          news={news}
          onSave={toggleReadLater}
          onRecommend={fetchRecommendations}
          isSaved={isReadLater(news.title)}
        />
      ))}
      
    </div>
  );
};

export default NewsGrid;