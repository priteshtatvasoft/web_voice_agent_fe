import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Phone, Brain, MessageSquare, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
      <header className="p-6 border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Phone className="h-8 w-8 text-primary" />
              <Mic className="h-4 w-4 text-primary-glow absolute -bottom-1 -right-1" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Bland.ai Web Agent
              </h1>
              <p className="text-sm text-muted-foreground">Technical Evaluation Demo</p>
            </div>
          </div>
          
          <Button 
            onClick={() => navigate('/')}
            variant="voice"
            size="lg"
          >
            <Mic className="h-5 w-5 mr-2" />
            Launch Web Agent
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-voice-active/10 border border-voice-active/20 rounded-full">
            <span className="text-sm text-voice-active font-medium">Live Demo Ready</span>
          </div>
          
          <h2 className="text-5xl font-bold text-foreground leading-tight">
            Real-time Voice Conversations
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Powered by Bland.ai
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience seamless browser-based voice conversations with AI. No phone calls required - 
            just pure web-based audio interaction with dynamic prompts and real-time transcription.
          </p>
          
          <div className="flex items-center justify-center space-x-4 pt-4">
            <Button 
              onClick={() => navigate('/')}
              variant="voice"
              size="lg"
              className="text-lg px-8 py-4 h-auto"
            >
              <Mic className="h-6 w-6 mr-3" />
              Start Voice Chat
            </Button>
            <Button 
              variant="voice-outline"
              size="lg"
              className="text-lg px-8 py-4 h-auto"
            >
              View Documentation
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <Mic className="h-8 w-8 text-voice-active mb-2" />
              <CardTitle>Browser-Based Audio</CardTitle>
              <CardDescription>
                Direct microphone and speaker access - no phone calls needed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Real-time audio streaming</li>
                <li>• Automatic speech recognition</li>
                <li>• High-quality text-to-speech</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <Brain className="h-8 w-8 text-primary-glow mb-2" />
              <CardTitle>Dynamic Prompts</CardTitle>
              <CardDescription>
                AI context that adapts and updates during conversation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Real-time prompt updates</li>
                <li>• Context-aware responses</li>
                <li>• Customizable agent behavior</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <MessageSquare className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Live Transcript</CardTitle>
              <CardDescription>
                Real-time conversation history with timestamps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Live conversation display</li>
                <li>• Message timestamps</li>
                <li>• Speaker identification</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <Shield className="h-8 w-8 text-voice-active mb-2" />
              <CardTitle>Secure Authentication</CardTitle>
              <CardDescription>
                Simple login system with session management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• User authentication</li>
                <li>• Session persistence</li>
                <li>• Secure data handling</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <Zap className="h-8 w-8 text-primary-glow mb-2" />
              <CardTitle>Performance Optimized</CardTitle>
              <CardDescription>
                Built for speed and reliability with modern web standards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Low latency audio</li>
                <li>• Responsive design</li>
                <li>• Error handling</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <Phone className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Bland.ai Integration</CardTitle>
              <CardDescription>
                Powered by industry-leading voice AI technology
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Natural conversations</li>
                <li>• Advanced voice synthesis</li>
                <li>• Conversation continuity</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Technical Requirements */}
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Technical Implementation</CardTitle>
            <CardDescription>
              Key features delivered for the technical evaluation
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-2">✅ Core Requirements</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• User login & authentication system</li>
                <li>• Real-time voice conversation interface</li>
                <li>• 3+ minute conversation capability</li>
                <li>• Dynamic prompt system</li>
                <li>• Conversation transcript</li>
                <li>• Microphone permission handling</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">✅ Technical Stack</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• React + TypeScript</li>
                <li>• Tailwind CSS design system</li>
                <li>• Bland.ai Web Client integration</li>
                <li>• Modern browser APIs</li>
                <li>• Responsive UI components</li>
                <li>• Real-time state management</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;
