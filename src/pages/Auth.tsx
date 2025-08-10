import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Mail, Lock, Package, LogIn, UserPlus } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password);
    
    if (error) {
      if (error.message.includes('already registered')) {
        toast({
          title: "Account Exists",
          description: "This email is already registered. Try signing in instead.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account.",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{ background: 'var(--gradient-hero)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-background/50 to-background/80" />
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-32 h-32 rounded-full opacity-20 blur-xl animate-pulse"
           style={{ background: 'var(--gradient-primary)' }} />
      <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full opacity-15 blur-2xl animate-pulse delay-1000"
           style={{ background: 'var(--gradient-secondary)' }} />
      
      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo and Title */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl btn-glow">
            <Package className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MoveMe
            </h1>
            <p className="text-muted-foreground text-lg">Smart moving made simple</p>
          </div>
        </div>

        <Card className="border-0 card-glow backdrop-blur-xl bg-card/90">
          <CardContent className="p-8">
            <Tabs value={isSignUp ? "signup" : "signin"} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 backdrop-blur-sm">
                <TabsTrigger 
                  value="signin" 
                  onClick={() => setIsSignUp(false)}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  onClick={() => setIsSignUp(true)}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-6">
                  <div className="space-y-4">
                     <div className="relative group">
                       <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors z-10" />
                       <Input
                         type="email"
                         placeholder="Enter your email"
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         className="pl-12 py-4 bg-background/80 border-2 border-muted hover:border-primary/50 focus:border-primary transition-all duration-300 relative"
                         required
                       />
                     </div>
                     <div className="relative group">
                       <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors z-10" />
                       <Input
                         type="password"
                         placeholder="Enter your password"
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         className="pl-12 py-4 bg-background/80 border-2 border-muted hover:border-primary/50 focus:border-primary transition-all duration-300 relative"
                         required
                       />
                     </div>
                  </div>
                   <Button 
                     type="submit" 
                     className="w-full btn-glass text-foreground font-semibold py-4 text-lg btn-scale hover:scale-105 relative z-20 border border-primary/30 hover:border-primary/50"
                     disabled={loading}
                   >
                     {loading ? (
                       <div className="flex items-center space-x-2">
                         <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                         <span>Signing in...</span>
                       </div>
                     ) : (
                       <div className="flex items-center space-x-2">
                         <LogIn className="w-5 h-5" />
                         <span>Sign In</span>
                       </div>
                     )}
                   </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="space-y-4">
                     <div className="relative group">
                       <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors z-10" />
                       <Input
                         type="email"
                         placeholder="Enter your email"
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         className="pl-12 py-4 bg-background/80 border-2 border-muted hover:border-primary/50 focus:border-primary transition-all duration-300 relative"
                         required
                       />
                     </div>
                     <div className="relative group">
                       <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors z-10" />
                       <Input
                         type="password"
                         placeholder="Create a password (min. 6 characters)"
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         className="pl-12 py-4 bg-background/80 border-2 border-muted hover:border-primary/50 focus:border-primary transition-all duration-300 relative"
                         required
                         minLength={6}
                       />
                     </div>
                  </div>
                   <Button 
                     type="submit" 
                     className="w-full btn-glass text-foreground font-semibold py-4 text-lg btn-scale hover:scale-105 relative z-20 border border-primary/30 hover:border-primary/50"
                     disabled={loading}
                   >
                     {loading ? (
                       <div className="flex items-center space-x-2">
                         <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                         <span>Creating account...</span>
                       </div>
                     ) : (
                       <div className="flex items-center space-x-2">
                         <UserPlus className="w-5 h-5" />
                         <span>Create Account</span>
                       </div>
                     )}
                   </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;