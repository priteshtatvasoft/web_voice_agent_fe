import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import authService from "@/services/authService";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: ""
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
      // Call authService to register the user
      const response = await authService.signup({
        username: formData.username,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      
      // Show success message
      toast({
        title: "Account Created!",
        description: "Your account has been created successfully. Please sign in.",
      });
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate("/");
      }, 1500);
      
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Extract error message from the response or use a default message
      const errorMessage = error.response?.data?.message || "An error occurred while creating your account. Please try again.";
      
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-voice rounded-full flex items-center justify-center shadow-voice">
              <Mic className="w-8 h-8 text-background" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Voice Assistant</h1>
          <p className="text-muted-foreground">Create your account</p>
        </div>

        <Card className="card-elevated border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-foreground">Create Account</CardTitle>
            <CardDescription>Sign up to access your voice assistant</CardDescription>
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
                  className="bg-secondary border-border"
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
                  className="bg-secondary border-border"
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
                  className="bg-secondary border-border"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full btn-primary text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>
              
              <p className="text-center text-sm text-muted-foreground mt-4">
                Already have an account?{" "}
                <Link to="/" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
