"use client";

import { useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

interface VideoDisplayProps {
  isCameraOn: boolean;
  children: React.ReactNode;
}

export function VideoDisplay({ isCameraOn, children }: VideoDisplayProps) {
  // This is a mock implementation - in a real app, you would use the browser's
  // getUserMedia API to access the camera
  useEffect(() => {
    if (isCameraOn) {
      // In a real implementation, you would do something like:
      // navigator.mediaDevices.getUserMedia({ video: true })
      //   .then(stream => {
      //     if (videoRef.current) {
      //       videoRef.current.srcObject = stream;
      //     }
      //   })
      //   .catch(err => console.error("Error accessing camera:", err));

      console.log("Camera would be turned on here");
    } else {
      // In a real implementation, you would stop the tracks:
      // if (videoRef.current && videoRef.current.srcObject) {
      //   const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      //   tracks.forEach(track => track.stop());
      //   videoRef.current.srcObject = null;
      // }

      console.log("Camera would be turned off here");
    }

    // Cleanup function
    return () => {
      // Stop any active tracks when component unmounts
      console.log("Cleanup: camera would be turned off here");
    };
  }, [isCameraOn]);

  return (
    <>
      {isCameraOn ? (
        children
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-500">
          <Avatar className="h-24 w-24 bg-gray-800">
            <AvatarFallback className="bg-gray-800 text-gray-400">
              <Camera className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
          <p className="mt-4 text-center text-lg">Camera is off</p>
          <p className="text-center text-sm text-gray-600">
            Click the camera button to turn it on
          </p>
        </div>
      )}
    </>
  );
}
