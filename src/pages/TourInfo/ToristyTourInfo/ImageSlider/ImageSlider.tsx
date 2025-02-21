import React, { useState, useEffect } from "react";
import { SvgIcons } from "@tripian/react";

interface IImageSlider {
  images: { orig: string }[];
  title: string;
  goBack: () => void;
  onImageClick: (index: number) => void;
}

const ImageSlider: React.FC<IImageSlider> = ({ images, title, goBack, onImageClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Split title into main and subtitle
  const colonIndex = title.indexOf(":");
  const mainTitle = colonIndex !== -1 ? title.substring(0, colonIndex).trim() : title;
  const subTitle = colonIndex !== -1 ? title.substring(colonIndex + 1).trim() : undefined;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative h-[60vh] overflow-hidden rounded-2xl">
      <button className="absolute z-10 top-4 left-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors" onClick={goBack}>
        <SvgIcons.ArrowLeft className="w-6 h-6" />
      </button>
      <div className="absolute inset-0">
        {images.map((image, index) => (
          <img
            key={index}
            src={image.orig}
            alt={`Slide ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${currentSlide === index ? "opacity-100" : "opacity-0"}`}
            onClick={() => onImageClick(index)}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
      </div>

      <button onClick={prevSlide} className="absolute left-8 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/20 transition-all">
        <SvgIcons.ChevronLeft className="w-6 h-6" />
      </button>
      <button onClick={nextSlide} className="absolute right-8 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/20 transition-all">
        <SvgIcons.ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button key={index} onClick={() => setCurrentSlide(index)} className={`w-2 h-2 rounded-full transition-all ${currentSlide === index ? "bg-white" : "bg-white/50"}`} />
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 py-10 px-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-4 text-white">{mainTitle}</h1>
          {subTitle && <p className="text-xl text-white/90">{subTitle}</p>}
        </div>
      </div>
    </div>
  );
};

export default ImageSlider;
