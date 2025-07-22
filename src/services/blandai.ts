// Bland.ai Web Client Integration
// This would normally use the official Bland.ai SDK, but for demo purposes
// we'll create a simulation that matches the expected API

export interface BlandAIConfig {
  apiKey?: string;
  agentId?: string;
  voice?: string;
}

export interface ConversationEvent {
  type: "transcript" | "audio" | "status" | "error";
  data: any;
  timestamp: Date;
}

export class BlandAIWebClient {
  private config: BlandAIConfig;
  private isConnected: boolean = false;
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private eventListeners: { [key: string]: Function[] } = {};
  private conversationActive: boolean = false;

  constructor(config: BlandAIConfig) {
    this.config = config;
  }

  // Event listener management
  on(event: string, callback: Function) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(
        (cb) => cb !== callback
      );
    }
  }

  private emit(event: string, data: any) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach((callback) => callback(data));
    }
  }

  // Initialize audio context and media
  async initialize(): Promise<boolean> {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Initialize audio context
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Set up media recorder
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      this.setupMediaRecorderEvents();

      this.emit("initialized", { success: true });
      return true;
    } catch (error) {
      this.emit("error", {
        error: "Failed to initialize audio",
        details: error,
      });
      return false;
    }
  }

  private setupMediaRecorderEvents() {
    if (!this.mediaRecorder) return;

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        // In a real implementation, this would send audio to Bland.ai
        this.emit("audioData", { data: event.data });

        // Simulate speech recognition for demo
        this.simulateSpeechRecognition();
      }
    };

    this.mediaRecorder.onstart = () => {
      this.emit("recordingStarted", { timestamp: new Date() });
    };

    this.mediaRecorder.onstop = () => {
      this.emit("recordingStopped", { timestamp: new Date() });
    };
  }

  // Start conversation
  async startConversation(): Promise<boolean> {
    if (!this.mediaRecorder || !this.audioContext) {
      const initialized = await this.initialize();
      if (!initialized) return false;
    }

    try {
      this.isConnected = true;
      this.conversationActive = true;

      // Resume audio context if suspended
      if (this.audioContext!.state === "suspended") {
        await this.audioContext!.resume();
      }

      // Start recording
      this.mediaRecorder!.start(1000); // 1-second chunks

      this.emit("conversationStarted", {
        timestamp: new Date(),
        status: "connected",
      });

      // Simulate initial agent response
      setTimeout(() => {
        this.simulateAgentResponse(
          "Hello! I'm your Bland.ai voice assistant. I can hear you clearly. How can I help you today?"
        );
      }, 1500);

      return true;
    } catch (error) {
      this.emit("error", {
        error: "Failed to start conversation",
        details: error,
      });
      return false;
    }
  }

  // End conversation
  async endConversation(): Promise<void> {
    this.conversationActive = false;

    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
    }

    // Stop all audio tracks
    if (this.mediaRecorder?.stream) {
      this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }

    this.isConnected = false;

    this.emit("conversationEnded", {
      timestamp: new Date(),
      status: "disconnected",
    });
  }

  // Send text message (for testing)
  sendMessage(text: string): void {
    if (!this.isConnected) return;

    this.emit("userMessage", {
      type: "user",
      content: text,
      timestamp: new Date(),
    });

    // Simulate agent response after delay
    setTimeout(() => {
      this.generateAgentResponse(text);
    }, 1000 + Math.random() * 2000);
  }

  // Simulate speech recognition (for demo)
  private simulateSpeechRecognition(): void {
    const sampleTexts = [
      "I'm interested in learning about AI and machine learning",
      "Can you tell me more about your capabilities?",
      "What kind of projects can you help me with?",
      "I'd like to discuss career opportunities in tech",
      "How does voice recognition technology work?",
    ];

    if (this.conversationActive && Math.random() > 0.7) {
      // 30% chance to simulate user speech
      const randomText =
        sampleTexts[Math.floor(Math.random() * sampleTexts.length)];

      setTimeout(() => {
        this.emit("userMessage", {
          type: "user",
          content: randomText,
          timestamp: new Date(),
        });

        // Generate agent response
        setTimeout(() => {
          this.generateAgentResponse(randomText);
        }, 1500);
      }, 2000);
    }
  }

  // Simulate agent response
  private simulateAgentResponse(userInput: string): void {
    this.emit("agentSpeaking", { started: true });

    setTimeout(() => {
      const response = this.generateResponse(userInput);

      this.emit("agentMessage", {
        type: "agent",
        content: response,
        timestamp: new Date(),
      });

      this.emit("agentSpeaking", { started: false });
    }, 2000);
  }

  private generateAgentResponse(userInput: string): void {
    this.simulateAgentResponse(userInput);
  }

  private generateResponse(userInput: string): string {
    const responses = {
      ai: "That's a great question about AI! Artificial Intelligence is transforming industries worldwide. What specific aspect interests you most - the technical implementation or practical applications?",
      career:
        "Career development in tech is very exciting right now. There are opportunities in software development, data science, AI/ML, and more. What's your current background and what direction interests you?",
      capabilities:
        "I can help you with a wide range of topics including technical discussions, career advice, learning resources, and general conversation. What would you like to explore together?",
      projects:
        "I'd love to help with your projects! I can assist with planning, problem-solving, technical guidance, and brainstorming. What kind of project are you working on or considering?",
      technology:
        "Voice recognition uses advanced signal processing and machine learning. The audio is converted to spectrograms, then neural networks identify patterns to transcribe speech. Would you like me to go deeper into any specific aspect?",
    };

    // Simple keyword matching for demo
    const input = userInput.toLowerCase();
    if (input.includes("ai") || input.includes("machine learning")) {
      return responses.ai;
    } else if (input.includes("career") || input.includes("job")) {
      return responses.career;
    } else if (input.includes("capabilities") || input.includes("help")) {
      return responses.capabilities;
    } else if (input.includes("project")) {
      return responses.projects;
    } else if (input.includes("voice") || input.includes("recognition")) {
      return responses.technology;
    }

    // Default responses
    const defaultResponses = [
      "That's interesting! Can you tell me more about what you'd like to explore?",
      "I'd be happy to help with that. What specific aspect would you like to focus on?",
      "Great topic! How can I assist you further with this?",
      "I'm here to help! What questions do you have about this?",
      "Let's dive deeper into that. What would you like to know more about?",
    ];

    return defaultResponses[
      Math.floor(Math.random() * defaultResponses.length)
    ];
  }

  // Get connection status
  getStatus(): { connected: boolean; recording: boolean } {
    return {
      connected: this.isConnected,
      recording: this.mediaRecorder?.state === "recording" || false,
    };
  }

  // Mute/unmute
  setMuted(muted: boolean): void {
    if (this.mediaRecorder?.stream) {
      this.mediaRecorder.stream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }

    this.emit("muteChanged", { muted });
  }
}

// Export a singleton instance
export const blandAIClient = new BlandAIWebClient({
  // These would be real config values in production
  apiKey: "demo-api-key",
  agentId: "demo-agent-id",
  voice: "default",
});
