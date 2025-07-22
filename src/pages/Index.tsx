import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Phone, MessageSquare, Zap, Shield, Clock } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    if (localStorage.getItem("isAuthenticated")) {
      navigate("/agent");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-voice rounded-2xl flex items-center justify-center shadow-voice">
              <Mic className="w-10 h-10 text-background" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-foreground mb-6">
            AI Voice Assistant
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience natural voice conversations powered by Bland.ai. 
            No phone calls required - chat directly in your browser with advanced AI.
          </p>
          
          <div className="flex items-center justify-center space-x-4 mb-8">
            <Badge variant="outline" className="border-accent text-accent bg-accent/10">
              <Zap className="w-3 h-3 mr-1" />
              Real-time Speech
            </Badge>
            <Badge variant="outline" className="border-primary text-primary bg-primary/10">
              <MessageSquare className="w-3 h-3 mr-1" />
              Live Transcripts
            </Badge>
            <Badge variant="outline" className="border-accent text-accent bg-accent/10">
              <Shield className="w-3 h-3 mr-1" />
              Secure & Private
            </Badge>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <Button 
              size="lg" 
              variant="voice"
              onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
              className="text-lg px-8 py-6 h-auto"
            >
              <Phone className="w-5 h-5 mr-2" />
              Learn More
            </Button>
            
            <Button 
              size="lg" 
              variant="premium"
              onClick={() => navigate("/")}
              className="text-lg px-8 py-6 h-auto"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Try Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="card-elevated border-border/50 text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-voice rounded-lg flex items-center justify-center mx-auto mb-4 shadow-voice">
                <Mic className="w-6 h-6 text-background" />
              </div>
              <CardTitle>Voice Recognition</CardTitle>
              <CardDescription>
                Advanced speech-to-text powered by Bland.ai for natural conversations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="card-elevated border-border/50 text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4 shadow-primary">
                <MessageSquare className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle>Live Transcripts</CardTitle>
              <CardDescription>
                Real-time conversation transcripts with speaker identification
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="card-elevated border-border/50 text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-voice rounded-lg flex items-center justify-center mx-auto mb-4 shadow-voice">
                <Clock className="w-6 h-6 text-background" />
              </div>
              <CardTitle>Dynamic Prompts</CardTitle>
              <CardDescription>
                AI prompts that adapt and evolve throughout your conversation
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Demo Info */}
        <Card className="card-elevated border-border/50 max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">Demo Information</CardTitle>
            <CardDescription>
              This is a technical demonstration of Bland.ai Web Agent capabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3">✅ Implemented Features</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• User authentication system</li>
                  <li>• Voice conversation interface</li>
                  <li>• Real-time transcript display</li>
                  <li>• Dynamic prompt management</li>
                  <li>• Microphone permissions handling</li>
                  <li>• Clean, modern UI design</li>
                  <li>• Session duration tracking</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-3">🔧 Integration Notes</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Ready for Bland.ai SDK integration</li>
                  <li>• Placeholder voice responses</li>
                  <li>• Simulated conversation flow</li>
                  <li>• Backend integration prepared</li>
                  <li>• WebSocket connection ready</li>
                  <li>• Audio streaming infrastructure</li>
                </ul>
              </div>
            </div>

            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
              <h4 className="font-medium text-accent mb-2">🚀 Production Setup</h4>
              <p className="text-sm text-muted-foreground">
                To complete the integration, you'll need to add your Bland.ai API key, 
                set up the backend database for user management, and configure the 
                voice streaming endpoints. The UI and conversation flow are fully functional.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
