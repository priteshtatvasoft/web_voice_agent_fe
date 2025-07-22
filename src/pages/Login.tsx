import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication - in real app this would connect to Supabase
    setTimeout(() => {
      if (username && password) {
        localStorage.setItem('blandai_user', JSON.stringify({ username, loggedIn: true }));
        toast({
          title: "Login successful",
          description: "Welcome to Bland.ai Web Agent",
        });
        navigate('/agent');
      } else {
        toast({
          title: "Login failed",
          description: "Please enter valid credentials",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="relative">
              <Phone className="h-8 w-8 text-primary" />
              <Mic className="h-4 w-4 text-primary-glow absolute -bottom-1 -right-1" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Bland.ai
            </h1>
          </div>
          <p className="text-muted-foreground">
            Web Agent - Real-time Voice Conversations
          </p>
        </div>

        {/* Login Form */}
        <Card className="border-border bg-card/50 backdrop-blur-sm shadow-card-custom">
          <CardHeader>
            <CardTitle className="text-center text-foreground">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the voice agent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-input border-border"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-input border-border"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:bg-primary-dark transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground mt-4">
                Dont't have an account?{' '}
                <Link to="/signup" className="text-primary hover:underline">
                  Sign Up
                </Link>
              </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;