import NewsCard from "./NewsCard";

const NewsGrid = ({
  newsList,
  toggleReadLater,
  fetchRecommendations,
  isReadLater,
}) => {
  return (
    <div
      className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-3
        gap-5
        mb-8
      "
    >
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