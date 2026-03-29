// 📅 Format Date (Top Bar)
export const formatFullDate = (date) => {
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// 📅 Format Short Date (Card / Button)
export const formatShortDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
};

// 🔍 Filter News (Search)
export const filterNews = (newsList, searchQuery) => {
  if (!searchQuery) return newsList;

  const q = searchQuery.toLowerCase();

  return newsList.filter((n) => {
    return (
      n.title?.toLowerCase().includes(q) ||
      n.description?.toLowerCase().includes(q)
    );
  });
};

// 📄 Pagination Logic
export const paginate = (items, currentPage, itemsPerPage) => {
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  return items.slice(indexOfFirstItem, indexOfLastItem);
};

// 📊 Total Pages
export const getTotalPages = (totalItems, itemsPerPage) => {
  return Math.ceil(totalItems / itemsPerPage);
};

// ⭐ Toggle Read Later
export const toggleReadLaterHelper = (list, news) => {
  const exists = list.find((n) => n.title === news.title);

  if (exists) {
    return list.filter((n) => n.title !== news.title);
  } else {
    return [...list, news];
  }
};

// ⭐ Check Read Later
export const isReadLaterHelper = (list, title) => {
  return list.some((n) => n.title === title);
};