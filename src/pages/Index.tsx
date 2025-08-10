import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Camera, CheckCircle, Smartphone, ArrowRight } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin-slow w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-success/10">
      {/* Hero Section */}
      <div className="container-mobile pt-12 pb-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-6">
            <Home className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">MoveMe</h1>
          <p className="text-xl text-muted-foreground mb-2">
            AI-powered moving inventory
          </p>
          <p className="text-muted-foreground">
            Photograph your belongings and let AI catalog everything for your move
          </p>
        </div>

        {/* CTA */}
        <div className="text-center mb-12">
          <Button size="lg" onClick={() => navigate('/auth')} className="btn-scale">
            Get Started Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Features */}
      <div className="container-mobile pb-12">
        <div className="grid gap-6">
          <Card className="card-hover">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <Camera className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Smart Photo Recognition</CardTitle>
              <CardDescription>
                Take photos of your items and our AI automatically identifies and catalogs them
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mb-3">
                <Home className="w-6 h-6 text-success" />
              </div>
              <CardTitle className="text-lg">Room-by-Room Organization</CardTitle>
              <CardDescription>
                Organize your inventory by rooms to make packing and unpacking easier
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mb-3">
                <Smartphone className="w-6 h-6 text-warning" />
              </div>
              <CardTitle className="text-lg">Mobile-First Design</CardTitle>
              <CardDescription>
                Designed for your phone, so you can catalog items anywhere in your home
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mb-3">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <CardTitle className="text-lg">Progress Tracking</CardTitle>
              <CardDescription>
                Track your progress room by room and never lose track of your belongings
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Demo CTA */}
      <div className="container-mobile pb-12">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">Ready to get organized?</h3>
            <p className="text-primary-foreground/90 mb-4">
              Start cataloging your move today with our free account
            </p>
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="btn-scale"
            >
              Create Free Account
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
