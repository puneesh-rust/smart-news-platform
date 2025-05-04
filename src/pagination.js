import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Always show first page
    pageNumbers.push(1);
    
    // Current page and neighbors
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (pageNumbers[pageNumbers.length - 1] !== i - 1) {
        // Add ellipsis if there's a gap
        pageNumbers.push('...');
      }
      pageNumbers.push(i);
    }
    
    // Always show last page if there are more than 1 pages
    if (totalPages > 1) {
      if (pageNumbers[pageNumbers.length - 1] !== totalPages - 1) {
        // Add ellipsis if there's a gap
        pageNumbers.push('...');
      }
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  return (
    <div className="pagination-container">
      <button 
        className="pagination-button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        &laquo; Previous
      </button>
      
      <div className="pagination-numbers">
        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
          ) : (
            <button
              key={`page-${page}`}
              className={`pagination-number ${currentPage === page ? 'active' : ''}`}
              onClick={() => onPageChange(page)}
              disabled={currentPage === page}
            >
              {page}
            </button>
          )
        ))}
      </div>
      
      <button 
        className="pagination-button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Next &raquo;
      </button>
    </div>
  );
};

export default Pagination;