import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Mic, 
  MicOff, 
  Phone, 
  LogOut, 
  Volume2, 
  VolumeX,
  Settings,
  MessageSquare,
  Brain
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import VoiceVisualizer from '@/components/VoiceVisualizer';
import ConversationTranscript from '@/components/ConversationTranscript';
import PromptPanel from '@/components/PromptPanel';
import { blandAIClient } from '@/services/blandai';

export interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

const WebAgent = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState("You are a helpful AI assistant. Engage in natural conversation and ask follow-up questions to keep the dialogue flowing.");
  const [conversationDuration, setConversationDuration] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const conversationStartRef = useRef<Date | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('blandai_user');
    if (!user) {
      navigate('/');
      return;
    }

    // Check microphone permission on mount
    checkMicrophonePermission();

    // Set up Bland.ai event listeners
    setupBlandAIListeners();

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      // Clean up Bland.ai listeners
      cleanupBlandAIListeners();
    };
  }, [navigate]);

  const setupBlandAIListeners = () => {
    blandAIClient.on('userMessage', (data: any) => {
      setIsListening(false);
      addMessage(data.content, 'user');
      
      // Update prompt based on conversation context
      updatePromptBasedOnMessage(data.content);
    });

    blandAIClient.on('agentMessage', (data: any) => {
      addMessage(data.content, 'agent');
      setIsSpeaking(false);
      setIsListening(true);
    });

    blandAIClient.on('agentSpeaking', (data: any) => {
      setIsSpeaking(data.started);
      if (data.started) setIsListening(false);
    });

    blandAIClient.on('conversationStarted', () => {
      setIsConnected(true);
      setIsListening(true);
    });

    blandAIClient.on('conversationEnded', () => {
      setIsConnected(false);
      setIsListening(false);
      setIsSpeaking(false);
    });

    blandAIClient.on('error', (data: any) => {
      toast({
        title: "Connection Error",
        description: data.error,
        variant: "destructive",
      });
    });
  };

  const cleanupBlandAIListeners = () => {
    // Remove all event listeners (simplified for demo)
    // In production, you'd remove specific listeners
  };

  const updatePromptBasedOnMessage = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('ai') || lowerMessage.includes('machine learning')) {
      setCurrentPrompt("The user is asking about AI and machine learning. Provide detailed, engaging responses and ask follow-up questions about their specific interests or experience level.");
    } else if (lowerMessage.includes('career') || lowerMessage.includes('job')) {
      setCurrentPrompt("The user is interested in career topics. Provide helpful career advice and ask about their background, goals, and interests.");
    } else if (lowerMessage.includes('help') || lowerMessage.includes('project')) {
      setCurrentPrompt("The user needs assistance with a project or task. Be helpful and ask clarifying questions to understand their specific needs.");
    } else {
      setCurrentPrompt("Continue the natural conversation. Listen actively and ask engaging follow-up questions to keep the dialogue flowing.");
    }
  };

  const checkMicrophonePermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setHasPermission(permission.state === 'granted');
      
      permission.addEventListener('change', () => {
        setHasPermission(permission.state === 'granted');
      });
    } catch (error) {
      console.warn('Permission API not supported, will request permission on connection');
      setHasPermission(null);
    }
  };

  const requestMicrophoneAccess = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop immediately, we just needed permission
      setHasPermission(true);
      return true;
    } catch (error) {
      setHasPermission(false);
      toast({
        title: "Microphone access required",
        description: "Please allow microphone access to use the voice agent",
        variant: "destructive",
      });
      return false;
    }
  };

  const startConversation = async () => {
    // Request microphone permission if needed
    if (hasPermission === false || hasPermission === null) {
      const granted = await requestMicrophoneAccess();
      if (!granted) return;
    }

    conversationStartRef.current = new Date();
    
    // Start duration tracking
    durationIntervalRef.current = setInterval(() => {
      if (conversationStartRef.current) {
        const elapsed = Math.floor((Date.now() - conversationStartRef.current.getTime()) / 1000);
        setConversationDuration(elapsed);
      }
    }, 1000);

    // Start Bland.ai conversation
    const success = await blandAIClient.startConversation();
    
    if (success) {
      toast({
        title: "Voice agent connected",
        description: "You can now start speaking. The agent will respond naturally.",
      });

      // Add initial agent message
      const initialMessage: Message = {
        id: `msg-${Date.now()}`,
        type: 'agent',
        content: "Hello! I'm your Bland.ai voice assistant. I can hear you clearly. How can I help you today?",
        timestamp: new Date()
      };
      setMessages([initialMessage]);
    }
  };

  const endConversation = async () => {
    await blandAIClient.endConversation();
    
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    toast({
      title: "Conversation ended",
      description: `Duration: ${formatDuration(conversationDuration)}`,
    });

    // Reset for next session
    setTimeout(() => {
      setConversationDuration(0);
      conversationStartRef.current = null;
    }, 2000);
  };


  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    blandAIClient.setMuted(newMutedState);
    
    toast({
      title: newMutedState ? "Muted" : "Unmuted",
      description: newMutedState ? "Your microphone is muted" : "You can now speak to the agent",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('blandai_user');
    navigate('/');
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addMessage = (content: string, type: 'user' | 'agent') => {
    const newMessage: Message = {
      id: `msg-${Date.now()}-${Math.random()}`,
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  // Simulate conversation for demo purposes
  const simulateConversation = () => {
    if (!isConnected) return;

    // Simulate user speaking
    setIsListening(false);
    setIsSpeaking(false);
    
    setTimeout(() => {
      addMessage("I'm interested in learning about AI and machine learning. Can you tell me more about it?", 'user');
      setCurrentPrompt("The user is asking about AI and machine learning. Provide an informative but engaging response and ask about their specific interests or experience level.");
      
      // Simulate agent response
      setTimeout(() => {
        setIsSpeaking(true);
        setTimeout(() => {
          addMessage("That's a fascinating topic! AI and machine learning are revolutionizing many industries. Are you looking to learn for personal interest, or do you have a specific career goal in mind? What's your current experience with programming?", 'agent');
          setIsSpeaking(false);
          setIsListening(true);
          setCurrentPrompt("Continue the conversation about AI/ML. The user seems interested in learning. Ask follow-up questions to understand their goals and current skill level.");
        }, 2000);
      }, 1000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-bg p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Phone className="h-8 w-8 text-primary" />
              <Mic className="h-4 w-4 text-primary-glow absolute -bottom-1 -right-1" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Bland.ai Web Agent</h1>
              <p className="text-sm text-muted-foreground">Real-time voice conversation</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isConnected && (
              <Badge variant="secondary" className="bg-voice-active text-primary-foreground animate-pulse">
                Connected • {formatDuration(conversationDuration)}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Voice Control Panel */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Voice Controls</span>
                </CardTitle>
                <CardDescription>
                  Manage your voice conversation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Voice Visualizer */}
                <VoiceVisualizer 
                  isListening={isListening} 
                  isSpeaking={isSpeaking}
                  isConnected={isConnected}
                />

                {/* Connection Controls */}
                <div className="space-y-2">
                  {!isConnected ? (
                    <Button
                      onClick={startConversation}
                      className="w-full bg-gradient-primary hover:bg-primary-dark"
                      disabled={hasPermission === false}
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      Start Conversation
                    </Button>
                  ) : (
                    <Button
                      onClick={endConversation}
                      variant="destructive"
                      className="w-full"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      End Conversation
                    </Button>
                  )}

                  {isConnected && (
                    <Button
                      onClick={toggleMute}
                      variant="outline"
                      className="w-full"
                    >
                      {isMuted ? (
                        <>
                          <MicOff className="h-4 w-4 mr-2" />
                          Unmute
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4 mr-2" />
                          Mute
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Status Indicators */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-voice-active animate-pulse' : 'bg-muted'}`} />
                    <span className="text-muted-foreground">Listening</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-primary-glow animate-pulse' : 'bg-muted'}`} />
                    <span className="text-muted-foreground">Speaking</span>
                  </div>
                </div>

                {hasPermission === false && (
                  <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
                    <p className="text-sm text-destructive">
                      Microphone access required. Please allow access in your browser settings.
                    </p>
                  </div>
                )}

                {/* Demo Button */}
                {isConnected && (
                  <Button
                    onClick={simulateConversation}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Demo Conversation
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Prompt Panel */}
            <PromptPanel 
              currentPrompt={currentPrompt}
              onPromptChange={setCurrentPrompt}
              isConnected={isConnected}
            />
          </div>

          {/* Conversation Transcript */}
          <div className="lg:col-span-2">
            <Card className="border-border bg-card/50 backdrop-blur-sm h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Conversation</span>
                </CardTitle>
                <CardDescription>
                  Real-time transcript of your voice conversation
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                <ConversationTranscript 
                  messages={messages}
                  isConnected={isConnected}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebAgent;