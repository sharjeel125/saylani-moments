"use client";

import { useEffect, useState } from "react";
import { Download, DownloadCloud, Search } from "lucide-react";
import { db } from "../../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Header from "../../components/header";

interface Match {
  faceId: string;
  similarity: number;
  signedUrl: string;
}

interface MatchData {
  matches: Match[];
}

interface User {
  name: string;
  email: string;
  phone: string;
}

export default function MatchedImagesDisplay() {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);

useEffect(() => {
  const userRaw = localStorage.getItem("nief-user");
  if (userRaw) {
    try {
      const parsedUser: User = JSON.parse(userRaw);
      setUser(parsedUser);
    } catch (e) {
      console.error("Failed to parse user data");
    }
  }

  const raw = localStorage.getItem("imagedData");
  if (raw) {
    try {
      const parsed: MatchData = JSON.parse(raw);
      const urls = parsed.matches.map((m) => m.signedUrl);
      setImageUrls(urls);
    } catch (err) {
      console.error("Failed to parse match data:", err);
    }
  }
}, []);

const downloadImage = (url: string, index: number) => {
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.download = `matched-image-${index + 1}.jpg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

  return (
   <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
  <Header showBackLink={true} hideRegisterLink={true} backLinkText="Home" />
  
  <div className="max-w-[97%] mx-auto mt-2 p-4 mb-8">
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="p-6 md:p-8 bg-gradient-to-r from-teal-50 to-emerald-50">
        <h1 className="text-2xl md:text-3xl font-bold text-teal-800 mb-3">
          Welcome{user?.name ? `, ${user.name}` : ""}!
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          Based on your selfie, we've matched you with these beautiful images. 
          Click any image to view or download your favorites.
        </p>
      </div>
    </div>
  </div>

  {imageUrls.length === 0 ? (
    <div className="max-w-4xl  mx-auto text-center ">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">No matched images found</h3>
        <p className="text-gray-500">We couldn't find any matches based on your selfie.</p>
      </div>
    </div>
  ) : (
    <div className="max-w-6xl p-[18px] mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {imageUrls.map((url, idx) => (
          <div
            key={idx}
            className="group relative rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 hover:border-teal-300"
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={url}
                alt={`Matched image ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                onClick={() => downloadImage(url, idx)}
              />
            </div>
            
            {/* Download Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                downloadImage(url, idx);
              }}
              className="absolute top-3 right-3 bg-white/90 text-teal-600 rounded-full p-2 shadow-sm hover:bg-white hover:text-teal-700 hover:shadow-md transition-all opacity-0 group-hover:opacity-100"
              aria-label={`Download image ${idx + 1}`}
            >
              <Download className="w-4 h-4" />
            </button>
            
            {/* Image Number Badge */}
            <span className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              {idx + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  )}
</div>

  );
}
