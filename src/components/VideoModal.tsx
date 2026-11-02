import React from "react";
import { X } from "lucide-react";
import { VIDEO_TITLE, VIDEO_AUTHOR, VIDEO_EMBED_URL } from "../data/videoData";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#000000] text-white rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex flex-col">
        {/* Minimal Header with Title and Close Button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/60">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-sm font-bold text-slate-200">
              {VIDEO_TITLE} &bull; <span className="text-slate-400 font-normal">{VIDEO_AUTHOR}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            aria-label="Close video"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* YouTube Video Player */}
        <div className="relative aspect-video w-full bg-black overflow-hidden">
          <iframe
            src={VIDEO_EMBED_URL}
            title={VIDEO_TITLE}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};
