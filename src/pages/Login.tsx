import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login - replace with actual authentication
    if (username && password) {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("username", username);
      
      toast({
        title: "Login Successful",
        description: "Welcome to your Voice Assistant",
      });
      
      setTimeout(() => {
        navigate("/agent");
      }, 1000);
    } else {
      toast({
        title: "Login Failed",
        description: "Please enter both username and password",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
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
          <p className="text-muted-foreground">Powered by Bland.ai</p>
        </div>

        <Card className="card-elevated border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-foreground">Welcome Back</CardTitle>
            <CardDescription>Sign in to access your voice assistant</CardDescription>
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
                  className="bg-secondary border-border"
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
                  className="bg-secondary border-border"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full btn-primary text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Demo credentials: Any username and password will work
        </p>
      </div>
    </div>
  );
};

export default Login;