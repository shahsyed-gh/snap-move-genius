import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ItemDetails = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border">
        <div className="container-mobile py-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Item Details</h1>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;