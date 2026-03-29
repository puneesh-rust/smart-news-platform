import { useState, useEffect, useCallback } from "react";

export const useNews = (selectedDate, selectedCategory) => {
  const [newsHeadlines, setNewsHeadlines] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNewsForDate = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");

      let url = `http://127.0.0.1:8000/headlines/?date=${year}-${month}-${day}`;
      if (selectedCategory) url += `&category=${selectedCategory}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error();

      const data = await res.json();
      setNewsHeadlines(data);
    } catch {
      setError("Failed to fetch news");
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, selectedCategory]);

  useEffect(() => {
    fetchNewsForDate();
  }, [fetchNewsForDate]);

  return { newsHeadlines, isLoading, error };
};