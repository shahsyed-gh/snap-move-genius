import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Camera, Package, CheckCircle } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  room_type: string;
  items_count: number;
  is_completed: boolean;
}

interface Item {
  id: string;
  name: string;
  category: string;
  condition: string;
  ai_confidence: number;
  photo_urls: string[];
}

const Room = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (roomId) {
      fetchRoomData();
    }
  }, [user, roomId, navigate]);

  const fetchRoomData = async () => {
    if (!roomId) return;
    
    try {
      // Fetch room
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (roomError) throw roomError;

      setRoom(roomData);

      // Fetch items for this room
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('id, name, category, condition, ai_confidence, photo_urls')
        .eq('room_id', roomId);

      if (itemsError) throw itemsError;

      setItems(itemsData || []);
    } catch (error) {
      console.error('Error fetching room data:', error);
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
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container-mobile py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold">{room.name}</h1>
                <p className="text-sm text-muted-foreground">{items.length} items</p>
              </div>
            </div>
            <Badge variant={room.is_completed ? "default" : "secondary"}>
              {room.is_completed ? <CheckCircle className="w-3 h-3 mr-1" /> : null}
              {room.is_completed ? "Complete" : "In Progress"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container-mobile py-6 space-y-6">
        {/* Add Items Button */}
        <Button 
          onClick={() => navigate(`/add-item/${roomId}`)} 
          className="w-full btn-scale" 
          size="lg"
        >
          <Camera className="w-5 h-5 mr-2" />
          Add Items to {room.name}
        </Button>

        {/* Items List */}
        {items.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No Items Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by taking photos of items in this room
              </p>
              <Button 
                onClick={() => navigate(`/add-item/${roomId}`)} 
                variant="outline" 
                className="btn-scale"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Item
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {items.map((item) => (
              <Card key={item.id} className="card-hover">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      {item.photo_urls && item.photo_urls.length > 0 ? (
                        <img 
                          src={item.photo_urls[0]} 
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                      <Badge 
                        size="sm" 
                        variant={item.ai_confidence >= 85 ? "default" : "secondary"}
                        className="mt-1"
                      >
                        {item.ai_confidence}% confidence
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Room;