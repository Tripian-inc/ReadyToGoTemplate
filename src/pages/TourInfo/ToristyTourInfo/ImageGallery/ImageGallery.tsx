import React, { useEffect } from "react";
import { SvgIcons } from "@tripian/react";

interface IImageGallery {
  images: { large: string }[];
  isOpen: boolean;
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onChangeIndex: (index: number) => void;
}

const ImageGallery: React.FC<IImageGallery> = ({ images, isOpen, currentIndex, onClose, onNext, onPrev, onChangeIndex }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrev]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-[1501] flex items-center justify-center">
      <button onClick={onClose} className="absolute top-6 right-6 text-white hover:text-gray-300 z-50">
        <SvgIcons.X fill="#fff" className="w-8 h-8" />
      </button>

      <button onClick={onPrev} className="absolute left-6 top-1/2 -translate-y-1/2 text-white hover:text-gray-300">
        <SvgIcons.ChevronLeft className="w-12 h-12" />
      </button>

      <button onClick={onNext} className="absolute right-6 top-1/2 -translate-y-1/2 text-white hover:text-gray-300">
        <SvgIcons.ChevronRight className="w-12 h-12" />
      </button>

      <img src={images[currentIndex].large} alt={`Gallery ${currentIndex + 1}`} className="max-h-[90vh] max-w-[90vw] object-contain" />

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button key={index} onClick={() => onChangeIndex(index)} className={`w-2 h-2 rounded-full transition-all ${currentIndex === index ? "bg-white" : "bg-white/50"}`} />
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
