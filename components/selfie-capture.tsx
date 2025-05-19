"use client";

import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { Button } from "./ui/button";
import { Camera, X } from "lucide-react";

interface SelfieCaptureProps {
  onCapture: (imageSrc: string) => void;
  onCancel: () => void;
}

export function SelfieCapture({ onCapture, onCancel }: SelfieCaptureProps) {
  // Define ref type for Webcam
  const webcamRef = useRef<Webcam | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onCapture(imageSrc);
      }
    }
  }, [onCapture]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-teal-800">Take a Selfie</h3>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-square">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            facingMode: "user",
          }}
          onUserMedia={() => setIsCameraReady(true)}
          className="w-full h-full object-cover"
        />
        {!isCameraReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <p className="text-gray-500">Loading camera...</p>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-4">
        <Button
          onClick={capture}
          disabled={!isCameraReady}
          className="bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-700 hover:to-emerald-600"
        >
          <Camera className="mr-2 h-4 w-4" />
          Capture Photo
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
