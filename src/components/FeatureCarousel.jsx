// src/components/FeatureCarousel.jsx
import { useState } from 'react';

const FeatureCarousel = () => {
  const features = [
    {
      title: "Download Notes",
      description: "Pre-downloaded notes as prerequisites display on screen with meeting window.",
      icon: "↓"
    },
    {
      title: "Unstable Network?",
      description: "Audio and video conferencing with adaptive network according to the connection or bandwidth status.",
      icon: "≈"
    },
    {
      title: "Share Notes.",
      description: "Display your notes during meeting on separate screen for better explanation.",
      icon: "⇌"
    },
    {
      title: "Captions",
      description: "Ai generated captions and converted into compressed files for minimal data download purpose.",
      icon: "CC"
    }
  ];

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const handleNext = () => {
    setCurrentSlideIndex((prevIndex) => 
      prevIndex === features.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {
    setCurrentSlideIndex((prevIndex) => 
      prevIndex === 0 ? features.length - 1 : prevIndex - 1
    );
  };

  const currentFeature = features[currentSlideIndex];

  return (
    <section className="feature-carousel-section">
      <button 
        onClick={handlePrev}
        className="carousel-arrow carousel-arrow-left"
      >
        &lt;
      </button>

      <div className="feature-carousel-content">
        <div className="feature-carousel-icon">
          {currentFeature.icon}
        </div>
        <h2 className="feature-carousel-title">
          {currentFeature.title}
        </h2>
        <p className="feature-carousel-description">
          {currentFeature.description}
        </p>
      </div>

      <button 
        onClick={handleNext}
        className="carousel-arrow carousel-arrow-right"
      >
        &gt;
      </button>
    </section>
  );
};

export default FeatureCarousel;