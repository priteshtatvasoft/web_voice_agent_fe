import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  LogOut,
  Volume2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import VoiceVisualizer from "@/components/VoiceVisualizer";
import TranscriptDisplay from "@/components/TranscriptDisplay";
import PromptDisplay from "@/components/PromptDisplay";

const VoiceAgent = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [currentPrompt, setCurrentPrompt] = useState(
    "Welcome! I'm your AI assistant. How can I help you today?"
  );
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [conversationDuration, setConversationDuration] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const conversationTimerRef = useRef(null);

  useEffect(() => {
    // Check authentication
    if (!localStorage.getItem("authToken")) {
      navigate("/");
      return;
    }

    // Request microphone permission on load
    requestMicrophonePermission();

    return () => {
      if (conversationTimerRef.current) {
        clearInterval(conversationTimerRef.current);
      }
    };
  }, [navigate]);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach((track) => track.stop());

      toast({
        title: "Microphone Access Granted",
        description: "You can now start voice conversations",
      });
    } catch (error) {
      setHasPermission(false);
      toast({
        title: "Microphone Access Denied",
        description: "Please enable microphone access to use voice features",
        variant: "destructive",
      });
    }
  };

  const startConversation = async () => {
    if (!hasPermission) {
      await requestMicrophonePermission();
      return;
    }

    setIsConnected(true);
    setConnectionStatus("connecting");

    // Simulate connection to Bland.ai
    setTimeout(() => {
      setConnectionStatus("connected");
      setCurrentPrompt(
        "Great! I'm listening. What would you like to talk about?"
      );

      // Start conversation timer
      conversationTimerRef.current = setInterval(() => {
        setConversationDuration((prev) => prev + 1);
      }, 1000);

      // Add initial system message
      setTranscript((prev) => [
        ...prev,
        {
          id: Date.now(),
          speaker: "Assistant",
          text: "Hello! I'm your AI voice assistant. I'm ready to chat with you.",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);

      toast({
        title: "Connected to Bland.ai",
        description: "Voice conversation started successfully",
      });
    }, 2000);
  };

  const endConversation = () => {
    setIsConnected(false);
    setIsListening(false);
    setIsSpeaking(false);
    setConnectionStatus("disconnected");

    if (conversationTimerRef.current) {
      clearInterval(conversationTimerRef.current);
    }

    toast({
      title: "Conversation Ended",
      description: `Duration: ${Math.floor(conversationDuration / 60)}:${(
        conversationDuration % 60
      )
        .toString()
        .padStart(2, "0")}`,
    });

    setConversationDuration(0);
    setCurrentPrompt(
      "Conversation ended. Start a new conversation to continue chatting."
    );
  };

  const toggleListening = () => {
    if (!isConnected) return;

    setIsListening(!isListening);

    if (!isListening) {
      // Simulate speech recognition
      setTimeout(() => {
        const userMessage =
          "This is a simulated user message for demonstration";
        setTranscript((prev) => [
          ...prev,
          {
            id: Date.now(),
            speaker: "You",
            text: userMessage,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);

        setIsListening(false);
        setIsSpeaking(true);

        // Simulate AI response
        setTimeout(() => {
          const responses = [
            "That's interesting! Could you tell me more about that?",
            "I understand. What else would you like to discuss?",
            "Great question! Let me think about that for a moment.",
            "That's a fascinating topic. What's your experience with it?",
            "I see what you mean. Would you like to explore this further?",
          ];

          const response =
            responses[Math.floor(Math.random() * responses.length)];

          setTranscript((prev) => [
            ...prev,
            {
              id: Date.now(),
              speaker: "Assistant",
              text: response,
              timestamp: new Date().toLocaleTimeString(),
            },
          ]);

          setCurrentPrompt(
            "I'm ready for your next question or comment. What's on your mind?"
          );
          setIsSpeaking(false);
        }, 2000);
      }, 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-voice rounded-lg flex items-center justify-center shadow-voice">
              <Mic className="w-5 h-5 text-background" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Voice Assistant
              </h1>
              <p className="text-muted-foreground">Welcome back, User</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge
              variant={
                connectionStatus === "connected" ? "default" : "secondary"
              }
              className="bg-accent text-accent-foreground"
            >
              {connectionStatus}
            </Badge>
            {isConnected && (
              <Badge variant="outline" className="border-primary text-primary">
                {formatDuration(conversationDuration)}
              </Badge>
            )}
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Voice Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Voice Control */}
            <Card className="card-elevated border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Volume2 className="w-5 h-5" />
                  <span>Voice Control</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <VoiceVisualizer
                  isListening={isListening}
                  isSpeaking={isSpeaking}
                  isConnected={isConnected}
                />

                <div className="flex items-center justify-center space-x-4">
                  {!isConnected ? (
                    <Button
                      onClick={startConversation}
                      className="btn-voice"
                      size="lg"
                      disabled={!hasPermission}
                    >
                      <Phone className="w-5 h-5 mr-2" />
                      Start Conversation
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={toggleListening}
                        variant={isListening ? "destructive" : "default"}
                        size="lg"
                        className={isListening ? "" : "btn-voice"}
                      >
                        {isListening ? (
                          <>
                            <MicOff className="w-5 h-5 mr-2" />
                            Stop Speaking
                          </>
                        ) : (
                          <>
                            <Mic className="w-5 h-5 mr-2" />
                            Press to Speak
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={endConversation}
                        variant="destructive"
                        size="lg"
                      >
                        <PhoneOff className="w-5 h-5 mr-2" />
                        End Call
                      </Button>
                    </>
                  )}
                </div>

                {!hasPermission && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">
                      Microphone access is required for voice conversations.
                      <Button
                        variant="link"
                        className="text-destructive underline p-0 ml-1"
                        onClick={requestMicrophonePermission}
                      >
                        Grant permission
                      </Button>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transcript */}
            <TranscriptDisplay transcript={transcript} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Prompt */}
            <PromptDisplay currentPrompt={currentPrompt} />

            {/* Conversation Stats */}
            <Card className="card-elevated border-border/50">
              <CardHeader>
                <CardTitle className="text-sm">Session Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Duration
                  </span>
                  <span className="text-sm font-medium">
                    {formatDuration(conversationDuration)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Messages
                  </span>
                  <span className="text-sm font-medium">
                    {transcript.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="outline" className="text-xs">
                    {connectionStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAgent;
