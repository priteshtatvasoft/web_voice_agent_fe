// pages/VoiceAgent.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  LogOut,
  Volume2,
  AlertCircle,
  Send,
  Settings,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import VoiceVisualizer from "@/components/VoiceVisualizer";
import TranscriptDisplay from "@/components/TranscriptDisplay";
import PromptDisplay from "@/components/PromptDisplay";
import { blandService, type BlandAIConfig } from "@/services/blandClient";

interface TranscriptEntry {
  id: number;
  speaker: string;
  text: string;
  timestamp: string;
  isError?: boolean;
}

const VoiceAgent = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState(
    "Welcome! I'm your AI assistant. Click 'Start Conversation' to begin chatting."
  );
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected" | "listening"
  >("disconnected");
  const [conversationDuration, setConversationDuration] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [textMessage, setTextMessage] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const conversationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const configRef = useRef<BlandAIConfig | null>(null);

  const addTranscriptEntry = useCallback(
    (entry: Omit<TranscriptEntry, "id">) => {
      setTranscript((prev) => [
        ...prev,
        { ...entry, id: Date.now() + Math.random() },
      ]);
    },
    []
  );

  const startConversationTimer = useCallback(() => {
    stopConversationTimer();
    conversationTimerRef.current = setInterval(() => {
      setConversationDuration((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopConversationTimer = useCallback(() => {
    if (conversationTimerRef.current) {
      clearInterval(conversationTimerRef.current);
      conversationTimerRef.current = null;
    }
  }, []);

  // Initialize Bland AI configuration
  useEffect(() => {
    // Check authentication
    if (!localStorage.getItem("authToken")) {
      navigate("/");
      return;
    }

    // Get API key from environment or localStorage
    const storedApiKey =
      localStorage.getItem("blandApiKey") || import.meta.env.VITE_BLAND_API_KEY;
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }

    // Setup Bland AI configuration
    configRef.current = {
      apiKey: storedApiKey || "",
      onTranscript: (text: string, speaker: "user" | "assistant") => {
        const displaySpeaker = speaker === "user" ? "You" : "Assistant";
        addTranscriptEntry({
          speaker: displaySpeaker,
          text,
          timestamp: new Date().toLocaleTimeString(),
        });

        if (speaker === "user") {
          setCurrentPrompt("I'm processing your message...");
          setIsSpeaking(true);
        }
      },
      onResponse: (text: string) => {
        addTranscriptEntry({
          speaker: "Assistant",
          text,
          timestamp: new Date().toLocaleTimeString(),
        });
        setCurrentPrompt("How can I assist you further?");
        setIsSpeaking(false);
      },
      onError: (error: Error) => {
        console.error("Bland.ai error:", error);
        setError(error.message);
        addTranscriptEntry({
          speaker: "System",
          text: `Error: ${error.message}`,
          timestamp: new Date().toLocaleTimeString(),
          isError: true,
        });
        setIsSpeaking(false);
      },
      onStatusChange: (status: string) => {
        console.log("Bland.ai status:", status);
        setConnectionStatus(status as any);

        if (status === "connected") {
          setIsConnected(true);
          setCurrentPrompt("Connected! You can now start speaking or typing.");
          startConversationTimer();
        } else if (status === "disconnected") {
          setIsConnected(false);
          setIsListening(false);
          setIsSpeaking(false);
          setCurrentPrompt(
            "Disconnected. Start a new conversation to continue."
          );
          stopConversationTimer();
        } else if (status === "listening") {
          setIsListening(true);
          setIsSpeaking(false);
          setCurrentPrompt("I'm listening... speak now.");
        } else if (status === "connecting") {
          setCurrentPrompt("Connecting to voice service...");
        }
      },
    };

    // Initialize Bland service
    const initBlandService = async () => {
      try {
        await requestMicrophonePermission();
        await blandService.initialize(configRef.current!);
      } catch (error) {
        console.error("Failed to initialize Bland.ai:", error);
        setError(
          "Failed to initialize voice service. Please check your API key."
        );
      }
    };

    if (storedApiKey) {
      initBlandService();
    }

    return () => {
      endConversation();
    };
  }, [
    navigate,
    addTranscriptEntry,
    startConversationTimer,
    stopConversationTimer,
  ]);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      stream.getTracks().forEach((track) => track.stop());
      setError(null);
      return true;
    } catch (error) {
      console.error("Microphone access denied:", error);
      setHasPermission(false);
      setError("Microphone access is required for voice conversations");
      return false;
    }
  };

  const saveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Bland AI API key",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem("blandApiKey", apiKey);

    // Update the configuration
    if (configRef.current) {
      configRef.current.apiKey = apiKey;
      blandService.initialize(configRef.current);
    }

    setShowSettings(false);
    toast({
      title: "API Key Saved",
      description: "You can now start voice conversations",
    });
  };

  const startConversation = async () => {
    if (!apiKey.trim()) {
      setShowSettings(true);
      toast({
        title: "API Key Required",
        description: "Please configure your Bland AI API key first",
        variant: "destructive",
      });
      return;
    }

    if (!hasPermission) {
      const granted = await requestMicrophonePermission();
      if (!granted) return;
    }

    setConnectionStatus("connecting");
    setError(null);

    try {
      await blandService.connect();
      toast({
        title: "Connected to Voice Assistant",
        description: "You can now start speaking or typing messages",
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
      setError(
        "Failed to connect to voice service. Please check your API key and internet connection."
      );
      setConnectionStatus("disconnected");
    }
  };

  const endConversation = async () => {
    try {
      await blandService.close();
      const duration = blandService.getSessionDuration();

      toast({
        title: "Conversation Ended",
        description: `Duration: ${formatDuration(duration)}`,
      });

      setCurrentPrompt(
        "Conversation ended. Start a new conversation to continue chatting."
      );
      setConversationDuration(0);
      setError(null);
    } catch (error) {
      console.error("Error ending conversation:", error);
      setError("Failed to end conversation properly");
    }
  };

  const toggleListening = async () => {
    if (!isConnected) {
      await startConversation();
      return;
    }

    try {
      if (isListening) {
        await blandService.stopListening();
        setIsListening(false);
        setCurrentPrompt("Stopped listening. Click to speak again.");
      } else {
        setIsSpeaking(true);
        setCurrentPrompt("Starting to listen...");
        await blandService.startListening();
      }
    } catch (error) {
      console.error("Error toggling listening:", error);
      setError("Failed to toggle listening mode");
      setIsListening(false);
      setIsSpeaking(false);
    }
  };

  const sendTextMessage = async () => {
    if (!textMessage.trim() || !isConnected) return;

    try {
      await blandService.sendMessage(textMessage.trim());
      setTextMessage("");
      setCurrentPrompt("Processing your message...");
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
  };

  const handleLogout = () => {
    endConversation().finally(() => {
      localStorage.removeItem("authToken");
      navigate("/");
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const clearTranscript = () => {
    setTranscript([]);
    toast({
      title: "Transcript Cleared",
      description: "Conversation history has been cleared",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center shadow-lg">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Voice Assistant
              </h1>
              <p className="text-gray-600">Powered by Bland AI</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Badge
              variant={
                connectionStatus === "connected" ? "default" : "secondary"
              }
              className={connectionStatus === "connected" ? "bg-green-500" : ""}
            >
              {connectionStatus}
            </Badge>
            {isConnected && (
              <Badge
                variant="outline"
                className="border-blue-500 text-blue-600"
              >
                {formatDuration(conversationDuration)}
              </Badge>
            )}
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg">API Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Bland AI API Key
                </label>
                <div className="flex space-x-2">
                  <Input
                    type="password"
                    placeholder="Enter your Bland AI API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={saveApiKey}>Save</Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Get your API key from{" "}
                  <a
                    href="https://bland.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    bland.ai
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Voice Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Voice Control */}
            <Card className="shadow-lg border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Volume2 className="w-5 h-5" />
                  <span>Voice Control</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="relative">
                  <VoiceVisualizer
                    isListening={isListening}
                    isSpeaking={isSpeaking}
                    isConnected={isConnected}
                  />
                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                      <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center space-x-4">
                  {!isConnected ? (
                    <Button
                      onClick={startConversation}
                      className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                      size="lg"
                      disabled={!apiKey.trim()}
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
                        className={
                          !isListening
                            ? "bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                            : ""
                        }
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
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">
                      Microphone access is required for voice conversations.{" "}
                      <Button
                        variant="link"
                        className="text-red-600 underline p-0 ml-1"
                        onClick={requestMicrophonePermission}
                      >
                        Grant permission
                      </Button>
                    </p>
                  </div>
                )}

                {/* Text Input Alternative */}
                {isConnected && (
                  <div className="mt-4 border-t pt-4">
                    <p className="text-sm text-gray-500 mb-2">
                      Or type your message:
                    </p>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Type your message here..."
                        value={textMessage}
                        onChange={(e) => setTextMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                      />
                      <Button
                        onClick={sendTextMessage}
                        disabled={!textMessage.trim()}
                        size="icon"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transcript */}
            <div className="relative">
              <TranscriptDisplay transcript={transcript} />
              {transcript.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearTranscript}
                  className="absolute top-4 right-4"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Prompt */}
            <PromptDisplay currentPrompt={currentPrompt} />

            {/* Conversation Stats */}
            <Card className="shadow-lg border-gray-200">
              <CardHeader>
                <CardTitle className="text-sm">Session Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Duration</span>
                  <span className="text-sm font-medium">
                    {formatDuration(conversationDuration)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Messages</span>
                  <span className="text-sm font-medium">
                    {transcript.filter((t) => !t.isError).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      connectionStatus === "connected"
                        ? "border-green-500 text-green-600"
                        : "border-gray-400 text-gray-600"
                    }`}
                  >
                    {connectionStatus}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">API Key</span>
                  <Badge variant="outline" className="text-xs">
                    {apiKey ? "✓ Set" : "✗ Missing"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg border-gray-200">
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={requestMicrophonePermission}
                  disabled={hasPermission}
                >
                  <Mic className="w-4 h-4 mr-2" />
                  {hasPermission ? "Microphone Ready" : "Enable Microphone"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  API Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAgent;
