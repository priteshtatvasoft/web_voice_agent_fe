import { useEffect, useRef } from "react";
import { BlandWebClient } from "bland-client-js-sdk";

interface BlandAiConfig {
  apiKey?: string;
  agentId?: string;
  sessionToken?: string;
}

interface BlandAiIntegrationProps {
  config: BlandAiConfig;
  onTranscript: (transcript: any) => void;
  onPromptUpdate: (prompt: string) => void;
  onConnectionChange: (status: string) => void;
  onError: (error: string) => void;
}

const BlandAiIntegration = ({ 
  config, 
  onTranscript, 
  onPromptUpdate, 
  onConnectionChange, 
  onError 
}: BlandAiIntegrationProps) => {
  
  const blandClientRef = useRef<BlandWebClient | null>(null);
  
  useEffect(() => {
    if (!config.agentId || !config.sessionToken) {
      onError("Bland.ai Agent ID and Session Token are required");
      return;
    }
    
    initializeBlandAi();
    
    return () => {
      if (blandClientRef.current) {
        blandClientRef.current.stopConversation();
      }
    };
  }, [config.agentId, config.sessionToken]);
  
  const initializeBlandAi = async () => {
    try {
      onConnectionChange("connecting");
      onPromptUpdate("Connecting to Bland.ai...");
      
      blandClientRef.current = new BlandWebClient(
        config.agentId!,
        config.sessionToken!
      );
      
      // Set up event listeners
      blandClientRef.current.on('conversationStarted', () => {
        onConnectionChange("connected");
        onPromptUpdate("Connected to Bland.ai successfully!");
      });
      
      blandClientRef.current.on('transcript', (data: any) => {
        onTranscript({
          id: Date.now(),
          speaker: data.user ? "User" : "Assistant",
          text: data.text,
          timestamp: new Date().toLocaleTimeString()
        });
      });
      
      blandClientRef.current.on('conversationEnded', () => {
        onConnectionChange("disconnected");
        onPromptUpdate("Conversation ended");
      });
      
      blandClientRef.current.on('error', (error: any) => {
        onError(`Bland.ai error: ${error.message || error}`);
        onConnectionChange("error");
      });
      
      // Initialize the conversation
      await blandClientRef.current.initConversation({
        callId: `call_${Date.now()}`,
        sampleRate: 44100,
      });
      
    } catch (error: any) {
      onError(`Failed to connect to Bland.ai: ${error.message || error}`);
      onConnectionChange("error");
    }
  };

  return (
    <div className="hidden">
      {/* Bland.ai integration running in the background */}
    </div>
  );
};

export default BlandAiIntegration;