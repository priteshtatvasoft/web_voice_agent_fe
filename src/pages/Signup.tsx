import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate signup - in real app this would connect to your backend
    setTimeout(() => {
      if (formData.username && formData.email && formData.password) {
        localStorage.setItem('blandai_user', JSON.stringify({ 
          username: formData.username,
          email: formData.email,
          loggedIn: true 
        }));
        toast({
          title: "Signup successful!",
          description: "Your account has been created successfully.",
        });
        navigate('/agent');
      } else {
        toast({
          title: "Signup failed",
          description: "Please fill in all required fields",
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
            Create your account to get started
          </p>
        </div>

        {/* Signup Form */}
        <Card className="border-border bg-card/50 backdrop-blur-sm shadow-card-custom">
          <CardHeader>
            <CardTitle className="text-center text-foreground">Create Account</CardTitle>
            <CardDescription className="text-center">
              Fill in your details to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  className="bg-input border-border"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-input border-border"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="bg-input border-border"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:bg-primary-dark transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Sign Up'}
              </Button>

              <div className="text-center text-sm text-muted-foreground mt-4">
                Already have an account?{' '}
                <Link to="/" className="text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
