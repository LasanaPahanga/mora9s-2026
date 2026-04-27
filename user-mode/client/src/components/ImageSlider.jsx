import { useState, useEffect } from "react";

function ImageSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Tournament slider images
  const slides = [
    {
      url: "/assets/slider/1.jpeg",
      title: "Mora 9s Hockey Tournament 2026",
      subtitle: "The Ultimate Hockey Championship"
    },
    {
      url: "/assets/slider/2.jpeg",
      title: "Watch Teams Compete",
      subtitle: "Follow Live Matches & Results"
    },
    {
      url: "/assets/slider/3.jpeg",
      title: "Elite Competition",
      subtitle: "The Best Teams Battle It Out"
    },
    {
      url: "/assets/slider/4.jpeg",
      title: "Tournament Action",
      subtitle: "Experience the Thrill of the Game"
    },
    {
      url: "/assets/slider/5.jpeg",
      title: "Team Spirit",
      subtitle: "Unity, Passion, Excellence"
    },
    {
      url: "/assets/slider/6.jpeg",
      title: "Championship Moments",
      subtitle: "Creating Unforgettable Memories"
    },
    {
      url: "/assets/slider/7.jpeg",
      title: "Live Updates",
      subtitle: "Stay Connected with Real-Time Scores"
    },
    {
      url: "/assets/slider/8.jpeg",
      title: "Tournament Highlights",
      subtitle: "Witness Sporting Excellence"
    },
    {
      url: "/assets/slider/9.jpeg",
      title: "Join the Action",
      subtitle: "Be Part of the Hockey Revolution"
    },
    {
      url: "/assets/slider/10.jpeg",
      title: "Victory Awaits",
      subtitle: "Who Will Claim the Championship?"
    },
    {
      url: "/assets/slider/11.jpeg",
      title: "Mora 9s 2026",
      subtitle: "Where Champions Are Made"
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setIsTransitioning(false);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsTransitioning(false);
    }, 500);
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto overflow-hidden rounded-xl sm:rounded-2xl shadow-2xl">
      {/* Slider Container */}
      <div className="relative h-[min(45vh,280px)] sm:h-[min(50vh,380px)] md:h-[500px]">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide
                ? "opacity-100 scale-100 z-10"
                : "opacity-0 scale-95 z-0"
            }`}
          >
            <img
              src={slide.url}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
            
            {/* Slide Text Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3 sm:px-4 z-10">
              <h3 className="text-lg sm:text-3xl md:text-5xl font-bold text-white mb-2 sm:mb-3 drop-shadow-2xl leading-tight">
                {slide.title}
              </h3>
              <p className="text-sm sm:text-lg md:text-xl text-slate-200 max-w-2xl drop-shadow-lg">
                {slide.subtitle}
              </p>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={() => goToSlide((currentSlide - 1 + slides.length) % slides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full transition-all hover:scale-110"
          aria-label="Previous slide"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => goToSlide((currentSlide + 1) % slides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full transition-all hover:scale-110"
          aria-label="Next slide"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Dot Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? "w-12 h-3 bg-gradient-to-r from-emerald-500 to-cyan-500"
                : "w-3 h-3 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute top-6 right-6 z-20 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full">
        <span className="text-white text-sm font-medium">
          {currentSlide + 1} / {slides.length}
        </span>
      </div>
    </div>
  );
}

export default ImageSlider;
