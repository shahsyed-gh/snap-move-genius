import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Loader2 } from 'lucide-react';

const AIProcessing = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container-mobile">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Brain className="w-10 h-10 text-primary" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-success rounded-full flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-success-foreground animate-spin" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-2">AI is Analyzing...</h2>
            <p className="text-muted-foreground mb-6">
              Our artificial intelligence is identifying items in your photos. This usually takes just a few seconds.
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span>Detecting objects...</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <span>Identifying categories...</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                <span>Estimating values...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIProcessing;