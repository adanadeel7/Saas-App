import React, { useState, useEffect } from 'react';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Toggle visibility based on scroll position
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-50 flex items-center justify-center w-12 h-12 rounded-full shadow-lg border border-outline-variant bg-surface-container-high/80 backdrop-blur-md text-primary hover:bg-primary hover:text-on-primary hover:border-primary hover:scale-110 active:scale-95 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      aria-label="Scroll to top"
      title="Scroll to top"
    >
      <span className="material-symbols-outlined font-bold text-2xl">arrow_upward</span>
    </button>
  );
};

export default ScrollToTopButton;
