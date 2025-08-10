import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCamera } from '@/hooks/useCamera';
import { Camera as CameraIcon, X, RotateCcw, Check } from 'lucide-react';

interface CameraProps {
  onPhotoCaptured: (file: File) => void;
  onClose: () => void;
  maxPhotos?: number;
}

const Camera: React.FC<CameraProps> = ({ 
  onPhotoCaptured, 
  onClose, 
  maxPhotos = 5 
}) => {
  const {
    videoRef,
    isActive,
    photos,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
    removePhoto,
    clearPhotos
  } = useCamera();

  const [flash, setFlash] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleCapture = async () => {
    if (photos.length >= maxPhotos) return;
    
    // Flash effect
    setFlash(true);
    setTimeout(() => setFlash(false), 150);
    
    const photo = await capturePhoto();
    if (photo) {
      onPhotoCaptured(photo.file);
    }
  };

  const handleRetake = () => {
    clearPhotos();
  };

  const handleConfirm = () => {
    photos.forEach(photo => onPhotoCaptured(photo.file));
    onClose();
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center text-white p-6">
          <CameraIcon className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-semibold mb-2">Camera Access Required</h2>
          <p className="text-white/80 mb-6 max-w-sm">{error}</p>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Flash overlay */}
      {flash && (
        <div className="absolute inset-0 bg-white opacity-70 z-10 pointer-events-none" />
      )}

      {/* Video feed */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        playsInline
        muted
      />

      {/* Camera guide overlay */}
      <div className="camera-guide" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
          <div className="text-white text-sm font-medium">
            {photos.length}/{maxPhotos} Photos
          </div>
          <div className="w-9" /> {/* Spacer */}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute top-20 left-4 right-4 z-20">
        <div className="bg-black/60 rounded-lg p-3 text-center">
          <p className="text-white text-sm">
            Position items within the frame and tap to capture
          </p>
        </div>
      </div>

      {/* Photo thumbnails */}
      {photos.length > 0 && (
        <div className="absolute top-32 left-4 right-4 z-20">
          <div className="flex space-x-2 overflow-x-auto">
            {photos.map((photo) => (
              <div key={photo.timestamp} className="relative flex-shrink-0">
                <img
                  src={photo.url}
                  alt="Captured"
                  className="w-16 h-16 object-cover rounded-lg border-2 border-white"
                />
                <button
                  onClick={() => removePhoto(photo.timestamp)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/70 to-transparent">
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center space-x-8">
            {/* Retake button */}
            {photos.length > 0 && (
              <Button
                variant="ghost"
                size="lg"
                onClick={handleRetake}
                className="text-white hover:bg-white/20 rounded-full w-12 h-12"
              >
                <RotateCcw className="w-6 h-6" />
              </Button>
            )}

            {/* Capture button */}
            <button
              onClick={handleCapture}
              disabled={photos.length >= maxPhotos}
              className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all duration-200 ${
                photos.length >= maxPhotos
                  ? 'bg-gray-500/50 cursor-not-allowed'
                  : 'bg-white/20 hover:bg-white/30 active:scale-90'
              }`}
            >
              <div className={`w-14 h-14 rounded-full ${
                photos.length >= maxPhotos ? 'bg-gray-400' : 'bg-white'
              }`} />
            </button>

            {/* Confirm button */}
            {photos.length > 0 && (
              <Button
                variant="ghost"
                size="lg"
                onClick={handleConfirm}
                className="text-white hover:bg-white/20 rounded-full w-12 h-12 bg-success/70"
              >
                <Check className="w-6 h-6" />
              </Button>
            )}
          </div>
        </div>

        {/* Capture instruction */}
        <div className="text-center pb-4">
          <p className="text-white/80 text-sm">
            {photos.length === 0 
              ? 'Tap the circle to take a photo'
              : photos.length >= maxPhotos
              ? 'Maximum photos reached'
              : 'Take more photos or tap ✓ to continue'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default Camera;