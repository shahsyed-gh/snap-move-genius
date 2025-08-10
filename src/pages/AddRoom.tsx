import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Home, ArrowRight } from 'lucide-react';

const roomTypes = [
  { value: 'living_room', label: 'Living Room', icon: '🛋️' },
  { value: 'bedroom', label: 'Bedroom', icon: '🛏️' },
  { value: 'kitchen', label: 'Kitchen', icon: '🍳' },
  { value: 'bathroom', label: 'Bathroom', icon: '🚿' },
  { value: 'dining_room', label: 'Dining Room', icon: '🍽️' },
  { value: 'office', label: 'Office/Study', icon: '💻' },
  { value: 'garage', label: 'Garage', icon: '🚗' },
  { value: 'basement', label: 'Basement', icon: '🏠' },
  { value: 'attic', label: 'Attic', icon: '🏠' },
  { value: 'storage', label: 'Storage Room', icon: '📦' },
  { value: 'laundry', label: 'Laundry Room', icon: '🧺' },
  { value: 'other', label: 'Other', icon: '🏠' }
];

const AddRoom = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentMove, setCurrentMove] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    room_type: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchCurrentMove();
  }, [user, navigate]);

  const fetchCurrentMove = async () => {
    try {
      const { data: moves, error } = await supabase
        .from('moves')
        .select('*')
        .eq('customer_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (moves && moves.length > 0) {
        setCurrentMove(moves[0]);
      } else {
        navigate('/create-move');
      }
    } catch (error) {
      console.error('Error fetching move:', error);
      toast({
        title: "Error",
        description: "Failed to load move data",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRoomTypeSelect = (value: string) => {
    const selectedType = roomTypes.find(type => type.value === value);
    setFormData(prev => ({
      ...prev,
      room_type: value,
      name: prev.name || selectedType?.label || ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.room_type) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (!currentMove) {
      toast({
        title: "No Active Move",
        description: "Please create a move first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert([
          {
            move_id: currentMove.id,
            name: formData.name,
            room_type: formData.room_type,
            items_count: 0,
            is_completed: false
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Room Added!",
        description: `${formData.name} has been added to your move.`,
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error adding room:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add room. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container-mobile py-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Add New Room</h1>
              <p className="text-sm text-muted-foreground">Add a room to your move</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-mobile py-6">
        <Card>
          <CardHeader>
            <CardTitle>Room Details</CardTitle>
            <CardDescription>
              Choose a room type and give it a name to start cataloging items.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Room Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Room Type</label>
                <Select onValueChange={handleRoomTypeSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          <span>{type.icon}</span>
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Room Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Room Name</label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Enter room name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  You can customize the name (e.g., "Master Bedroom", "Guest Bathroom")
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button type="submit" className="w-full btn-scale" disabled={loading}>
                  {loading ? "Adding Room..." : "Add Room"}
                  {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Room Type Grid Preview */}
        {formData.room_type && (
          <Card className="mt-6">
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Room Preview</h3>
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Home className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-medium">{formData.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {roomTypes.find(type => type.value === formData.room_type)?.label}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AddRoom;