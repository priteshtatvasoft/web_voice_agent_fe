import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import authService from '@/services/authService';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
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

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call the authService to register the user
      await authService.signup({
        username: formData.username,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      // Show success message
      toast({
        title: "Success!",
        description: "Your account has been created successfully. Please log in.",
      });

      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/');
      }, 1500);

    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Show error message from the server or a generic error
      const errorMessage = error.response?.message || 'Failed to create account. Please try again.';
      
      toast({
        title: "Signup failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
