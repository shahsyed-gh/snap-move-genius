import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, MapPin, Calendar, ArrowRight } from 'lucide-react';

const CreateMove = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    origin_address: '',
    destination_address: '',
    scheduled_date: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.origin_address || !formData.destination_address || !formData.scheduled_date) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to create your move.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('moves')
        .insert([
          {
            customer_id: user?.id,
            origin_address: formData.origin_address,
            destination_address: formData.destination_address,
            scheduled_date: formData.scheduled_date,
            status: 'scheduled'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Create default rooms
      const defaultRooms = [
        { name: 'Living Room', room_type: 'living_room' },
        { name: 'Kitchen', room_type: 'kitchen' },
        { name: 'Master Bedroom', room_type: 'bedroom' },
        { name: 'Bathroom', room_type: 'bathroom' },
        { name: 'Garage', room_type: 'garage' }
      ];

      const roomsToInsert = defaultRooms.map(room => ({
        move_id: data.id,
        name: room.name,
        room_type: room.room_type,
        items_count: 0,
        is_completed: false
      }));

      const { error: roomsError } = await supabase
        .from('rooms')
        .insert(roomsToInsert);

      if (roomsError) throw roomsError;

      toast({
        title: "Move Created!",
        description: "Your move has been set up with default rooms. You can add more rooms later.",
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error creating move:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create move. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
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
              <h1 className="text-lg font-semibold">Create New Move</h1>
              <p className="text-sm text-muted-foreground">Set up your moving details</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-mobile py-6">
        <Card>
          <CardHeader>
            <CardTitle>Move Details</CardTitle>
            <CardDescription>
              Tell us about your upcoming move so we can help you organize everything.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Origin Address */}
              <div className="space-y-2">
                <label className="text-sm font-medium">From Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Enter your current address"
                    value={formData.origin_address}
                    onChange={(e) => handleInputChange('origin_address', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Destination Address */}
              <div className="space-y-2">
                <label className="text-sm font-medium">To Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Enter your destination address"
                    value={formData.destination_address}
                    onChange={(e) => handleInputChange('destination_address', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Scheduled Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Moving Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => handleInputChange('scheduled_date', e.target.value)}
                    className="pl-10"
                    min={getTomorrowDate()}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button type="submit" className="w-full btn-scale" disabled={loading}>
                  {loading ? "Creating Move..." : "Create Move & Continue"}
                  {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">What happens next?</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• We'll create default rooms for your move</li>
              <li>• You can add, remove, or rename rooms anytime</li>
              <li>• Start taking photos of your belongings in each room</li>
              <li>• Our AI will help identify and catalog your items</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateMove;