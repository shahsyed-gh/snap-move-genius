-- Create moves table
CREATE TABLE moves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  origin_address TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rooms table
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  move_id UUID REFERENCES moves(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  room_type TEXT DEFAULT 'other',
  items_count INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create items table
CREATE TABLE items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  move_id UUID REFERENCES moves(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  condition TEXT CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
  estimated_value DECIMAL(10,2),
  is_fragile BOOLEAN DEFAULT FALSE,
  priority_level INTEGER DEFAULT 1,
  ai_confidence INTEGER,
  requires_verification BOOLEAN DEFAULT FALSE,
  created_by_customer BOOLEAN DEFAULT TRUE,
  photo_urls TEXT[],
  customer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (users can only see their own data)
CREATE POLICY "Users can view their own moves" ON moves FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Users can insert their own moves" ON moves FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Users can update their own moves" ON moves FOR UPDATE USING (customer_id = auth.uid());

CREATE POLICY "Users can view rooms for their moves" ON rooms FOR SELECT USING (
  move_id IN (SELECT id FROM moves WHERE customer_id = auth.uid())
);
CREATE POLICY "Users can insert rooms for their moves" ON rooms FOR INSERT WITH CHECK (
  move_id IN (SELECT id FROM moves WHERE customer_id = auth.uid())
);
CREATE POLICY "Users can update rooms for their moves" ON rooms FOR UPDATE USING (
  move_id IN (SELECT id FROM moves WHERE customer_id = auth.uid())
);

CREATE POLICY "Users can view items for their moves" ON items FOR SELECT USING (
  move_id IN (SELECT id FROM moves WHERE customer_id = auth.uid())
);
CREATE POLICY "Users can insert items for their moves" ON items FOR INSERT WITH CHECK (
  move_id IN (SELECT id FROM moves WHERE customer_id = auth.uid())
);
CREATE POLICY "Users can update items for their moves" ON items FOR UPDATE USING (
  move_id IN (SELECT id FROM moves WHERE customer_id = auth.uid())
);

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public) VALUES ('move-photos', 'move-photos', true);

-- Create storage policies
CREATE POLICY "Users can view their own photos" ON storage.objects FOR SELECT USING (
  bucket_id = 'move-photos' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own photos" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'move-photos' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own photos" ON storage.objects FOR UPDATE USING (
  bucket_id = 'move-photos' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own photos" ON storage.objects FOR DELETE USING (
  bucket_id = 'move-photos' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE moves;
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE items;

-- Set replica identity for realtime
ALTER TABLE moves REPLICA IDENTITY FULL;
ALTER TABLE rooms REPLICA IDENTITY FULL;
ALTER TABLE items REPLICA IDENTITY FULL;

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_moves_updated_at
    BEFORE UPDATE ON moves
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at
    BEFORE UPDATE ON items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();