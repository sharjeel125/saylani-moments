"use client";

import { useEffect, useState } from "react";
import { Download, DownloadCloud, Search } from "lucide-react";
import { db } from "../../lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  query,
  where,
  getDoc,
  getDocs,
} from "firebase/firestore";
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
  imageUrl?: string;
  timestamp?: any;
}

function base64ToBlob(base64Data: string, contentType = "image/jpeg") {
  const byteCharacters = atob(base64Data.split(",")[1]);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    byteArrays.push(new Uint8Array(byteNumbers));
  }

  return new Blob(byteArrays, { type: contentType });
}

export default function MatchedImagesDisplay() {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [user, setUser] = useState<User | null | any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userRaw = localStorage.getItem("nief-user");
    if (userRaw) {
      try {
        const parsedUser: User = JSON.parse(userRaw);
        setUser(parsedUser);
        getUserInfoFromFirebase(parsedUser.phone);
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

  const getUserInfoFromFirebase = async (phone) => {
    const userRef = collection(db, "registrations");
    const q = query(userRef, where("phone", "==", phone));
    const userinfo = await getDocs(q);
    if (userinfo?.docs[0]?.data()) {
      setUser(userinfo?.docs[0]?.data());
    }
  };

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

  const fetchMoreImages = async () => {
    if (!user || !user.imageUrl || !user.name) return;

    try {
      setLoading(true);
      console.log("user=>", user);
      const imageResponse = await fetch(user.imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(imageBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );

      console.log("imageBuffer=>", imageBuffer);
      const blob = base64ToBlob(base64);
      const form = new FormData();
      form.append("file", blob, `${user.name}_selfie.jpg`);

      const res = await fetch(
        "https://k94g77i1lc.execute-api.ap-southeast-1.amazonaws.com/default/AmazonImageAnalyze",
        {
          method: "POST",
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_FACE_API_KEY!,
          },
          body: form,
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`API error: ${res.status} - ${errText}`);
      }

      const data = await res.json();
      const urls = data.matches.map((m: Match) => m.signedUrl);
      localStorage.setItem("imagedData", JSON.stringify(data));
      setImageUrls(urls);
    } catch (err) {
      console.error("Face match fetch failed:", err);
      alert("Face match API failed. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      <Header showBackLink={true} hideRegisterLink={true} backLinkText="Home" />

      <div className="container mx-auto px-4 py-6 mt-10">
        <div className="relative mb-12">
          {/* Profile Image */}
          {user?.imageUrl && (
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-10">
              <img
                src={user.imageUrl}
                className="rounded-ful object-cover rounded-full border-4 border-white h-[120px] w-[120px] shadow-md"
                alt="Profile"
              />
            </div>
          )}

          {/* Card */}
          <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
            <div className="p-6 md:p-5 bg-gradient-to-r from-teal-50 to-emerald-50">
              <h1 className="text-2xl text-center md:text-3xl font-bold text-teal-800 pt-14">
                Welcome{user?.name ? `, ${user.name}` : ""}!
              </h1>
            </div>
          </div>
        </div>

        {imageUrls.length === 0 ? (
          <div className="max-w-4xl text-center">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No matched images found
              </h3>
              <p className="text-gray-500">
                We couldn't find any matches based on your selfie.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
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

        {/* <div className="flex justify-center items-center mt-10">
          <button
            onClick={fetchMoreImages}
            className="bg-gradient-to-r from-teal-700 rounded-xl text-sm via-teal-600 to-emerald-500 text-white px-6 py-3 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Loading..." : "View More Images"}
          </button>
        </div> */}
      </div>
    </div>
  );
}
