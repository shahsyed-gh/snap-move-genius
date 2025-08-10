import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Camera from '@/components/Camera';
import AIProcessing from '@/components/AIProcessing';
import ItemForm from '@/components/ItemForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Camera as CameraIcon } from 'lucide-react';
import { analyzePhoto, AIAnalysisResult } from '@/services/mockAI';

interface Room {
  id: string;
  name: string;
  room_type: string;
  move_id: string;
}

const AddItem = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [step, setStep] = useState<'camera' | 'processing' | 'form'>('camera');
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<File[]>([]);
  const [aiResults, setAIResults] = useState<AIAnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (roomId) {
      fetchRoom();
    }
  }, [user, roomId, navigate]);

  const fetchRoom = async () => {
    if (!roomId) return;
    
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (error) throw error;

      // Verify this room belongs to the user's move
      const { data: move, error: moveError } = await supabase
        .from('moves')
        .select('customer_id')
        .eq('id', data.move_id)
        .single();

      if (moveError) throw moveError;

      if (move.customer_id !== user?.id) {
        throw new Error('Unauthorized');
      }

      setRoom(data);
    } catch (error) {
      console.error('Error fetching room:', error);
      toast({
        title: "Error",
        description: "Failed to load room data",
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleStartCamera = () => {
    setShowCamera(true);
  };

  const handlePhotoCaptured = (file: File) => {
    setCapturedPhotos(prev => [...prev, file]);
  };

  const handleCameraClose = () => {
    setShowCamera(false);
    if (capturedPhotos.length > 0) {
      processPhotos();
    }
  };

  const processPhotos = async () => {
    if (capturedPhotos.length === 0) return;

    setStep('processing');

    try {
      // Process the first photo (for demo purposes)
      const results = await analyzePhoto(capturedPhotos[0]);
      setAIResults(results);
      setStep('form');
    } catch (error) {
      console.error('Error processing photos:', error);
      toast({
        title: "Processing Error",
        description: "Failed to analyze photos. Please try again.",
        variant: "destructive",
      });
      setStep('camera');
    }
  };

  const handleItemSaved = () => {
    // Reset state
    setCapturedPhotos([]);
    setAIResults([]);
    setStep('camera');
    
    toast({
      title: "Items Added!",
      description: "Your items have been successfully cataloged.",
    });
  };

  const handleRetake = () => {
    setCapturedPhotos([]);
    setAIResults([]);
    setStep('camera');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin-slow w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Room Not Found</h2>
          <Button onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (showCamera) {
    return (
      <Camera
        onPhotoCaptured={handlePhotoCaptured}
        onClose={handleCameraClose}
        maxPhotos={3}
      />
    );
  }

  if (step === 'processing') {
    return <AIProcessing />;
  }

  if (step === 'form' && aiResults.length > 0) {
    return (
      <ItemForm
        room={room}
        photos={capturedPhotos}
        aiResults={aiResults}
        onSaved={handleItemSaved}
        onRetake={handleRetake}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container-mobile py-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/room/${roomId}`)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Add Items</h1>
              <p className="text-sm text-muted-foreground">{room.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-mobile py-6">
        {/* Camera Prompt */}
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CameraIcon className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>Ready to Catalog Items?</CardTitle>
            <CardDescription>
              Take photos of items in {room.name} and our AI will automatically identify and catalog them for you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleStartCamera} className="w-full btn-scale" size="lg">
              <CameraIcon className="w-5 h-5 mr-2" />
              Start Taking Photos
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Position items clearly in the camera view for best results
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Photography Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-success text-sm font-bold">1</span>
              </div>
              <div>
                <p className="text-sm font-medium">Good Lighting</p>
                <p className="text-xs text-muted-foreground">Use natural light when possible</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-success text-sm font-bold">2</span>
              </div>
              <div>
                <p className="text-sm font-medium">Clear View</p>
                <p className="text-xs text-muted-foreground">Keep items within the frame guides</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-success text-sm font-bold">3</span>
              </div>
              <div>
                <p className="text-sm font-medium">Multiple Angles</p>
                <p className="text-xs text-muted-foreground">Take 2-3 photos for better identification</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddItem;