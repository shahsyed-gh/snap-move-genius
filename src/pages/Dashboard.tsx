import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  Home, 
  Plus, 
  Settings, 
  LogOut, 
  Package, 
  Camera, 
  CheckCircle,
  Clock,
  MapPin
} from 'lucide-react';

interface Move {
  id: string;
  origin_address: string;
  destination_address: string;
  scheduled_date: string;
  status: string;
}

interface Room {
  id: string;
  name: string;
  room_type: string;
  items_count: number;
  is_completed: boolean;
}

interface DashboardStats {
  totalItems: number;
  completedRooms: number;
  totalRooms: number;
  photosTaken: number;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentMove, setCurrentMove] = useState<Move | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalItems: 0,
    completedRooms: 0,
    totalRooms: 0,
    photosTaken: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      // Fetch current move
      const { data: moves, error: movesError } = await supabase
        .from('moves')
        .select('*')
        .eq('customer_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (movesError) throw movesError;

      if (moves && moves.length > 0) {
        const move = moves[0];
        setCurrentMove(move);

        // Fetch rooms for current move
        const { data: roomsData, error: roomsError } = await supabase
          .from('rooms')
          .select('*')
          .eq('move_id', move.id);

        if (roomsError) throw roomsError;

        setRooms(roomsData || []);

        // Fetch items count
        const { data: itemsData, error: itemsError } = await supabase
          .from('items')
          .select('id, photo_urls')
          .eq('move_id', move.id);

        if (itemsError) throw itemsError;

        const totalItems = itemsData?.length || 0;
        const completedRooms = roomsData?.filter(room => room.is_completed).length || 0;
        const totalRooms = roomsData?.length || 0;
        const photosTaken = itemsData?.reduce((acc, item) => acc + (item.photo_urls?.length || 0), 0) || 0;

        setStats({
          totalItems,
          completedRooms,
          totalRooms,
          photosTaken
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleCreateMove = () => {
    navigate('/create-move');
  };

  const handleRoomClick = (roomId: string) => {
    navigate(`/room/${roomId}`);
  };

  const progressPercentage = stats.totalRooms > 0 ? (stats.completedRooms / stats.totalRooms) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin-slow w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
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
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Home className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">MoveMe</h1>
                <p className="text-sm text-muted-foreground">Welcome back!</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-mobile py-6 space-y-6">
        {!currentMove ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Active Move</h2>
            <p className="text-muted-foreground mb-6">Create your first move to start cataloging your belongings</p>
            <Button onClick={handleCreateMove} className="btn-scale">
              <Plus className="w-4 h-4 mr-2" />
              Create New Move
            </Button>
          </div>
        ) : (
          <>
            {/* Current Move Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Current Move</CardTitle>
                    <CardDescription>
                      {new Date(currentMove.scheduled_date).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant={currentMove.status === 'completed' ? 'default' : 'secondary'}>
                    {currentMove.status === 'scheduled' && <Clock className="w-3 h-3 mr-1" />}
                    {currentMove.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {currentMove.status.charAt(0).toUpperCase() + currentMove.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">From:</span>
                  <span>{currentMove.origin_address}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">To:</span>
                  <span>{currentMove.destination_address}</span>
                </div>
              </CardContent>
            </Card>

            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progress Overview</CardTitle>
                <CardDescription>
                  {stats.totalRooms > 0 ? `${stats.completedRooms} of ${stats.totalRooms} rooms completed` : 'No rooms added yet'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
                
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{stats.totalItems}</div>
                    <div className="text-xs text-muted-foreground">Items</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">{stats.completedRooms}</div>
                    <div className="text-xs text-muted-foreground">Rooms Done</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning">{stats.photosTaken}</div>
                    <div className="text-xs text-muted-foreground">Photos</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rooms Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Rooms</h2>
                <Button size="sm" onClick={() => navigate('/add-room')} className="btn-scale">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Room
                </Button>
              </div>

              {rooms.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No rooms added yet</p>
                    <Button onClick={() => navigate('/add-room')} variant="outline" className="btn-scale">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Room
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {rooms.map((room) => (
                    <Card 
                      key={room.id} 
                      className="card-hover cursor-pointer"
                      onClick={() => handleRoomClick(room.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              room.is_completed ? 'bg-success' : 'bg-muted'
                            }`}>
                              {room.is_completed ? (
                                <CheckCircle className="w-5 h-5 text-success-foreground" />
                              ) : (
                                <Home className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium">{room.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {room.items_count} items
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" className="btn-scale">
                              <Camera className="w-4 h-4 mr-1" />
                              Add Items
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;