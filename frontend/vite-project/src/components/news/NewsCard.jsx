const NewsCard = ({ news, onSave, onRecommend, isSaved }) => {
  // ✅ Agar onRecommend prop missing ho toh console mein error aayega
  const handleRecommend = () => {
    if (!onRecommend) {
      console.error("onRecommend prop missing on NewsCard");
      return;
    }
    onRecommend(news.title);
  };

  return (
    <div className="card">
      <h3>{news.title}</h3>
      <p>{news.description}</p>

      <button onClick={handleRecommend}>Similar</button>
      <button onClick={() => onSave(news)}>
        {isSaved ? "Saved" : "Save"}
      </button>
    </div>
  );
};

export default NewsCard;