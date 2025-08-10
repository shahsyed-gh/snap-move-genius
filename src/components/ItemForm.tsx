import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Save, RotateCcw } from 'lucide-react';
import { AIAnalysisResult, getConfidenceBadgeStyle, getConfidenceBadgeText } from '@/services/mockAI';

interface ItemFormProps {
  room: { id: string; name: string; move_id: string };
  photos: File[];
  aiResults: AIAnalysisResult[];
  onSaved: () => void;
  onRetake: () => void;
}

const categories = [
  'furniture', 'electronics', 'appliances', 'clothing', 'books', 
  'kitchenware', 'decor', 'tools', 'sports', 'toys', 'other'
];

const conditions = [
  { value: 'excellent', label: 'Excellent', emoji: '✨' },
  { value: 'good', label: 'Good', emoji: '👍' },
  { value: 'fair', label: 'Fair', emoji: '👌' },
  { value: 'poor', label: 'Poor', emoji: '⚠️' }
];

const ItemForm: React.FC<ItemFormProps> = ({ room, photos, aiResults, onSaved, onRetake }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState(
    aiResults.map((result, index) => ({
      ...result,
      id: `temp-${index}`,
      customer_notes: ''
    }))
  );
  const [loading, setLoading] = useState(false);

  const updateItem = (index: number, field: string, value: any) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      // Upload photos to Supabase Storage
      const photoUrls: string[] = [];
      for (const photo of photos) {
        const fileName = `${user!.id}/${Date.now()}-${photo.name}`;
        const { data, error } = await supabase.storage
          .from('move-photos')
          .upload(fileName, photo);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('move-photos')
          .getPublicUrl(fileName);

        photoUrls.push(publicUrl);
      }

      // Save items to database
      const itemsToInsert = items.map(item => ({
        move_id: room.move_id,
        room_id: room.id,
        name: item.name,
        description: item.description,
        category: item.category,
        condition: item.condition,
        estimated_value: item.estimated_value,
        is_fragile: item.is_fragile,
        ai_confidence: item.confidence,
        requires_verification: item.confidence < 85,
        photo_urls: photoUrls,
        customer_notes: item.customer_notes
      }));

      const { error } = await supabase
        .from('items')
        .insert(itemsToInsert);

      if (error) throw error;

      // Update room items count
      const { error: updateError } = await supabase
        .from('rooms')
        .update({ items_count: items.length })
        .eq('id', room.id);

      if (updateError) throw updateError;

      onSaved();
    } catch (error: any) {
      console.error('Error saving items:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save items",
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={onRetake}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold">Review & Edit Items</h1>
                <p className="text-sm text-muted-foreground">{items.length} items detected</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onRetake}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container-mobile py-6 space-y-6">
        {/* Items List */}
        {items.map((item, index) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <Badge className={getConfidenceBadgeStyle(item.confidence)}>
                  {getConfidenceBadgeText(item.confidence)}
                </Badge>
              </div>
              <CardDescription>
                AI detected this item with {item.confidence}% confidence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Item Name</label>
                <Input
                  value={item.name}
                  onChange={(e) => updateItem(index, 'name', e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select 
                  value={item.category} 
                  onValueChange={(value) => updateItem(index, 'category', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Condition */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Condition</label>
                <Select 
                  value={item.condition} 
                  onValueChange={(value) => updateItem(index, 'condition', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map(cond => (
                      <SelectItem key={cond.value} value={cond.value}>
                        {cond.emoji} {cond.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Value */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Estimated Value ($)</label>
                <Input
                  type="number"
                  value={item.estimated_value || ''}
                  onChange={(e) => updateItem(index, 'estimated_value', parseFloat(e.target.value) || 0)}
                />
              </div>

              {/* Fragile Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Fragile Item</label>
                <Switch
                  checked={item.is_fragile}
                  onCheckedChange={(checked) => updateItem(index, 'is_fragile', checked)}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes (Optional)</label>
                <Textarea
                  placeholder="Add any additional notes about this item..."
                  value={item.customer_notes}
                  onChange={(e) => updateItem(index, 'customer_notes', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          className="w-full btn-scale" 
          size="lg" 
          disabled={loading}
        >
          {loading ? "Saving Items..." : "Save All Items"}
          {!loading && <Save className="ml-2 w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
};

export default ItemForm;