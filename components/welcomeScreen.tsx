"use client";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import confetti from "canvas-confetti";
import { db } from "../lib/firebase";

export default function WelcomeScreen() {
  const [visitors, setVisitors] = useState([]);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef(null);
  const [lastFetchTime, setLastFetchTime] = useState(Date.now());

  const runFireworks = () => {
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 },
      colors: ["#FFD700", "#FF6F61", "#ffffff"],
    });
  };

  useEffect(() => {
    const q = query(collection(db, "visitors"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setVisitors(data);
      if (data.length > 0) {
        setQueue(data);
        setCurrentIndex(0);
        runFireworks();
        setLastFetchTime(Date.now());
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (queue.length === 0) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % queue.length;
        return nextIndex;
      });

      const now = Date.now();
      if (now - lastFetchTime > 10000) {
        const q = query(collection(db, "visitors"), orderBy("timestamp", "desc"));
        onSnapshot(q, (snapshot) => {
          const updated = [];
          snapshot.forEach((doc) => {
            updated.push({ id: doc.id, ...doc.data() });
          });
          setVisitors(updated);
          setQueue(updated);
          setLastFetchTime(Date.now());
        });
      }
    }, 10000);

    return () => clearInterval(timerRef.current);
  }, [queue, lastFetchTime]);

  const currentVisitor = queue[currentIndex] || null;


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f0f9fb] to-[#d8f1f6] text-center relative overflow-hidden px-4 py-8">
      <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzJBN0E4QiIgZmlsbC1vcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcGF0dGVybikiLz48L3N2Zz4=')] z-0"></div>

      <div className="absolute top-[-10%] right-[-5%] w-64 h-64 rounded-full bg-[#2A7A8B] opacity-5 z-0"></div>
      <div className="absolute bottom-[-15%] left-[-10%] w-96 h-96 rounded-full bg-[#2A7A8B] opacity-5 z-0"></div>
      <div className="absolute top-10 left-10 opacity-10 z-0">
        <img src="https://freepngimg.com/download/islam/85350-art-patterns-islamic-architecture-angle-line-geometric.png" alt="Decorative pattern" width={200} height={200} />
      </div>
      <div className="absolute bottom-10 right-10 opacity-10 z-0">
        <img src="https://freepngimg.com/download/islam/85350-art-patterns-islamic-architecture-angle-line-geometric.png" alt="Decorative pattern" width={200} height={200} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="z-10 mb-6"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2A7A8B] tracking-tight">
          National Islamic Economic Forum
        </h1>
        <div className="flex items-center justify-center mt-3 mb-4">
          <div className="h-0.5 w-12 bg-[#2A7A8B] bg-opacity-30 rounded"></div>
          <p className="text-xl text-[#5CA0AF] mx-4 font-light">2025 Edition</p>
          <div className="h-0.5 w-12 bg-[#2A7A8B] bg-opacity-30 rounded"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="relative inline-block"
        >
          <p className="text-2xl sm:text-3xl text-gray-700 font-bold relative z-10">We Welcome</p>
          <div className="absolute inset-x-0 bottom-0 h-3 bg-[#2A7A8B]/10 -z-10 transform translate-y-1"></div>
        </motion.div>
      </motion.div>

      {
        currentVisitor && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="z-10 my-10 w-full max-w-4xl px-4"
          >
            <div className="relative">
              <div className="absolute  opacity-75 -z-10"></div>
              <div className="relative bg-white/50 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-white/50">
                <p className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-[#2A7A8B] leading-tight capitalize">
                  {currentVisitor?.name
                    ? currentVisitor?.name
                      .split(" ")
                      .map((name) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase())
                      .join(" ")
                    : "Honored Guest"}
                </p>

                <p className="text-xl text-[#5CA0AF] mt-4 font-medium">{currentVisitor?.designation}</p>

                {currentVisitor.company && (
                  <div className="mt-6 inline-block">
                    <p className="text-2xl text-gray-600 px-6 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-[#2A7A8B]/10">
                      <span className="text-[#3E8FA0] font-semibold">{currentVisitor?.company}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="z-10 mt-auto mb-6 w-full text-sm text-gray-500 flex flex-col items-center"
      >
        <div className="flex items-center space-x-2 mb-2">
          <div className="h-px w-8 bg-[#2A7A8B]/30"></div>
          <p>
            Organized by <span className="text-[#2A7A8B] font-medium">Saylani Welfare Trust</span>
          </p>
          <div className="h-px w-8 bg-[#2A7A8B]/30"></div>
        </div>
        <p className="text-xs text-gray-400">May 20, 2025 • Karachi, Pakistan</p>
      </motion.div>
    </div>
  );
}