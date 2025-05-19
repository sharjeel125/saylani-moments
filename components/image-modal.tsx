"use client";
import Image from "next/image";
import { X, Download, Share2 } from "lucide-react";

interface ImageType {
  url?: string;
  title: string;
  category?: string;
}

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: ImageType;
}

export function ImageModal({ isOpen, onClose, image }: ImageModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full bg-white rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="relative aspect-square w-full">
          <Image
            src={image.url || "/placeholder.svg"}
            alt={image.title}
            fill
            className="object-contain"
          />
        </div>

        <div className="p-4 bg-white">
          <h3 className="text-xl font-bold text-teal-800 mb-1">{image.title}</h3>
          <p className="text-sm text-gray-500 mb-4">{image.category}</p>

          <div className="flex justify-between">
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-700 hover:to-emerald-600 text-white rounded-lg">
              <Download size={16} />
              <span>Download</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-teal-300 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors">
              <Share2 size={16} />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
