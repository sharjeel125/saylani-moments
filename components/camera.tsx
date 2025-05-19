"use client";
import { useRef, useState, useEffect } from "react";
import { performOCR } from "../lib/ocr";
import { addVisitor } from "../lib/firestore";

export default function Camera({ onVisitorCaptured = (visitorInfo: any) => { } }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState("user");
  const [visitorInfo, setVisitorInfo] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isCameraOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isCameraOpen, facingMode]);

  const startCamera = async () => {
    try {
      stopCamera(); // Stop any existing stream first

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch((err) => {
            console.error("Error playing video:", err);
            setError("Could not start camera preview");
          });
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Could not access camera. Please check permissions.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const capturePhoto = () => {
    if (!videoRef.current || !streamRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          const imageDataUrl = reader.result;
          setPreview(imageDataUrl);
          setIsCameraOpen(false);
          processImage(imageDataUrl);
        };
        reader.readAsDataURL(blob);
      },
      "image/jpeg",
      0.9
    );
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string" && result.startsWith("data:image/")) {
        setPreview(result);
        processImage(result);
      } else {
        setError("Invalid image file");
      }
    };
    reader.onerror = () => setError("Failed to read file");
    reader.readAsDataURL(file);
  };

  const processImage = async (base64Image) => {
    try {
      setIsProcessing(true);
      setError(null);
      setSuccess(false);

      let result = await performOCR(base64Image);

      if (typeof result === "string") {
        result = result.replace(/```json|```/g, "").trim();
        result = JSON.parse(result);
      }

      setVisitorInfo(result); // show to user
    } catch (err) {
      console.error("Processing error:", err);
      setError(err.message || "Failed to process image");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setPreview(null);
    setSuccess(false);
    setError(null);
    setIsCameraOpen(false);
    setVisitorInfo(null);
    setIsVerified(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#EAF6F9]">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-center text-[#2C3E50] mb-4 sm:mb-6">
            Visitor Registration
          </h1>

          {/* Camera/Preview Area */}
          <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4 sm:mb-6 border border-gray-200">
            {isCameraOpen ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 flex justify-center space-x-3">
                  <button
                    onClick={switchCamera}
                    className="p-2 bg-white/30 rounded-full cursor-pointer hover:bg-white/50 transition"
                    title="Switch camera"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-switch-camera-icon lucide-switch-camera"><path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" /><path d="M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5" /><circle cx="12" cy="12" r="3" /><path d="m18 22-3-3 3-3" /><path d="m6 2 3 3-3 3" /></svg>
                  </button>
                  <button
                    onClick={capturePhoto}
                    className="p-2 bg-white rounded-full cursor-pointer h-12 w-12 flex items-center justify-center hover:bg-gray-100 transition"
                    title="Take photo"
                  >
                    <div className="h-8 w-8 bg-[#5CA0AF] rounded-full"></div>
                  </button>
                  <button
                    onClick={() => setIsCameraOpen(false)}
                    className="p-2 bg-white/30 rounded-full cursor-pointer hover:bg-white/50 transition"
                    title="Close camera"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </>
            ) : preview ? (
              <img
                src={preview}
                alt="Captured"
                className="w-full h-full object-contain"
              />
            ) : (
              <div
                className="w-full h-full flex flex-col items-center justify-center text-center cursor-pointer p-4"
                onClick={() => setIsCameraOpen(true)}
              >
                <div className="bg-[#EAF6F9] p-4 rounded-full mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 mx-auto text-[#5CA0AF]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <p className="mt-2 text-gray-600 text-sm sm:text-base">Click to open camera</p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG or JPEG (MAX. 5MB)
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {!isCameraOpen && !preview && (
              <>
                <button
                  onClick={() => setIsCameraOpen(true)}
                  className="w-full py-2.5 px-4 cursor-pointer rounded-lg bg-[#5CA0AF] hover:bg-[#4a8a99] text-white font-medium text-base transition-colors flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Open Camera
                </button>

                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="w-full py-2.5 px-4 rounded-lg bg-white border border-[#5CA0AF] text-[#5CA0AF] font-medium text-base text-center cursor-pointer transition-colors flex items-center justify-center hover:bg-[#EAF6F9]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Upload Photo
                </label>
              </>
            )}

            {visitorInfo && !isVerified && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await addVisitor(visitorInfo);
                    setSuccess(true);
                    setIsVerified(true);
                    onVisitorCaptured(visitorInfo);
                  } catch (err) {
                    setError("Failed to save visitor info.");
                  }
                }}
                className="space-y-3 mt-4"
              >
                {Object.entries(visitorInfo).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600 capitalize">
                      {key}
                    </label>
                    <input
                      type="text"
                   value={(value as string) ?? ""}
                      onChange={(e) =>
                        setVisitorInfo((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5CA0AF] focus:border-[#5CA0AF] text-sm"
                    />
                  </div>
                ))}

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 cursor-pointer rounded-lg bg-[#5CA0AF] hover:bg-[#4a8a99] text-white font-medium text-base transition-colors mt-3"
                >
                  Submit Visitor Info
                </button>
              </form>
            )}

            {(preview || isProcessing) && (
              <button
                onClick={resetForm}
                disabled={isProcessing}
                className="w-full py-2.5 px-4 cursor-pointer rounded-lg bg-white border border-gray-300 text-gray-700 font-medium text-base transition-colors disabled:opacity-50 hover:bg-gray-50"
              >
                {isProcessing ? "Processing..." : "Start Over"}
              </button>
            )}
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mt-3 p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs sm:text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-3 p-2.5 bg-green-50 border border-green-200 text-green-600 rounded-lg text-xs sm:text-sm">
              Visitor data successfully captured and stored!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}