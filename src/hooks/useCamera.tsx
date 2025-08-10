import { useState, useRef, useCallback } from 'react';
import { autoCropImage } from '@/utils/autoCrop';

export interface CapturedPhoto {
  file: File;
  url: string;
  timestamp: number;
}

export const useCamera = () => {
  const [isActive, setIsActive] = useState(false);
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsActive(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  const capturePhoto = useCallback(async (): Promise<CapturedPhoto | null> => {
    if (!videoRef.current || !isActive) return null;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return null;

    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(null);
          return;
        }

        try {
          // Create initial file
          const originalFile = new File([blob], `photo-${Date.now()}.jpg`, {
            type: 'image/jpeg'
          });

          // Apply auto-cropping
          console.log('Applying auto-crop to captured photo...');
          const croppedFile = await autoCropImage(originalFile);

          const url = URL.createObjectURL(croppedFile);
          const photo: CapturedPhoto = {
            file: croppedFile,
            url,
            timestamp: Date.now()
          };

          setPhotos(prev => [...prev, photo]);
          resolve(photo);
        } catch (error) {
          console.error('Error processing photo:', error);
          // Fallback to original if cropping fails
          const originalFile = new File([blob], `photo-${Date.now()}.jpg`, {
            type: 'image/jpeg'
          });
          const url = URL.createObjectURL(blob);
          const photo: CapturedPhoto = {
            file: originalFile,
            url,
            timestamp: Date.now()
          };
          setPhotos(prev => [...prev, photo]);
          resolve(photo);
        }
      }, 'image/jpeg', 0.9);
    });
  }, [isActive]);

  const removePhoto = useCallback((timestamp: number) => {
    setPhotos(prev => {
      const photo = prev.find(p => p.timestamp === timestamp);
      if (photo) {
        URL.revokeObjectURL(photo.url);
      }
      return prev.filter(p => p.timestamp !== timestamp);
    });
  }, []);

  const clearPhotos = useCallback(() => {
    photos.forEach(photo => URL.revokeObjectURL(photo.url));
    setPhotos([]);
  }, [photos]);

  return {
    videoRef,
    isActive,
    photos,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
    removePhoto,
    clearPhotos
  };
};