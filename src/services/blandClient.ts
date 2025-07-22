// services/blandClient.ts
const BLAND_API_URL = 'https://api.bland.ai';

export interface BlandAIConfig {
  apiKey: string;
  onTranscript?: (text: string, speaker: 'user' | 'assistant') => void;
  onResponse?: (text: string) => void;
  onError?: (error: Error) => void;
  onStatusChange?: (status: string) => void;
}

export interface AgentConfig {
  prompt: string;
  voice: string;
  model: string;
  language: string;
  max_duration: number;
  answered_by_enabled: boolean;
  wait_for_greeting: boolean;
  record: boolean;
}

class BlandService {
  private config: BlandAIConfig | null = null;
  private callId: string | null = null;
  private sessionStartTime: number = 0;
  private isInitialized = false;
  private eventSource: EventSource | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private isRecording = false;

  async initialize(config?: BlandAIConfig) {
    if (config) {
      this.config = config;
    }
    this.isInitialized = true;
  }

  async createAgent(agentConfig: AgentConfig) {
    if (!this.config?.apiKey) {
      throw new Error('API key not configured');
    }

    try {
      const response = await fetch(`${BLAND_API_URL}/v1/agents`, {
        method: 'POST',
        headers: {
          'authorization': this.config.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(agentConfig)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to create agent: ${response.status} ${errorData}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating agent:', error);
      throw error;
    }
  }

  async startCall(phoneNumber?: string) {
    if (!this.config?.apiKey) {
      throw new Error('API key not configured');
    }
  
    try {
      const agent = await this.createAgent({
        prompt: "You are a helpful AI assistant. Be conversational, friendly, and concise in your responses.",
  voice: "nat",
  model: "enhanced",
  language: "en",
  max_duration: 30,
  answered_by_enabled: false,
  wait_for_greeting: false,
  record: true
      });
  
      const callPayload: any = {
        agent_id: agent.agent_id,
        wait_for_greeting: false,
        record: true,
        task: "web-session"
      };
  
      if (phoneNumber) {
        callPayload.phone_number = phoneNumber;
      }
  
      console.log("Payload sent to Bland:", callPayload); // debug
  
      const response = await fetch(`${BLAND_API_URL}/v1/calls`, {
        method: 'POST',
        headers: {
          authorization: this.config.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(callPayload)
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to start call: ${response.status} ${errorText}`);
      }
  
      const data = await response.json();
      this.callId = data.call_id;
      this.sessionStartTime = Date.now();
  
      this.config.onStatusChange?.('connecting');
      this.monitorCall();
  
      return data;
    } catch (error) {
      console.error('Error starting call:', error);
      this.config.onError?.(error as Error);
      throw error;
    }
  }
  

  async monitorCall() {
    if (!this.callId || !this.config?.apiKey) return;

    try {
      // Poll for call status and transcript
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`${BLAND_API_URL}/v1/calls/${this.callId}`, {
            headers: {
              'authorization': this.config!.apiKey,
            }
          });

          if (response.ok) {
            const callData = await response.json();
            
            // Update status
            if (callData.status) {
              this.config!.onStatusChange?.(callData.status);
              
              if (callData.status === 'completed' || callData.status === 'failed') {
                clearInterval(pollInterval);
                this.config!.onStatusChange?.('disconnected');
              }
            }

            // Handle transcript
            if (callData.transcript && Array.isArray(callData.transcript)) {
              callData.transcript.forEach((entry: any) => {
                if (entry.text && entry.user) {
                  const speaker = entry.user.toLowerCase() === 'user' ? 'user' : 'assistant';
                  this.config!.onTranscript?.(entry.text, speaker);
                  
                  if (speaker === 'assistant') {
                    this.config!.onResponse?.(entry.text);
                  }
                }
              });
            }
          }
        } catch (error) {
          console.error('Error polling call status:', error);
        }
      }, 2000); // Poll every 2 seconds

    } catch (error) {
      console.error('Error monitoring call:', error);
      this.config?.onError?.(error as Error);
    }
  }

  async connect() {
    if (!this.isInitialized) {
      throw new Error('Bland service not initialized');
    }

    try {
      // Request microphone permission
      this.audioStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });

      // Start the call without phone number for web-based interaction
      await this.startCall("");
      
      this.config?.onStatusChange?.('connected');
      return true;
    } catch (error) {
      console.error('Error connecting:', error);
      this.config?.onError?.(error as Error);
      throw error;
    }
  }

  async startListening() {
    if (!this.audioStream) {
      throw new Error('No audio stream available');
    }

    try {
      this.mediaRecorder = new MediaRecorder(this.audioStream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          // Here you would typically send the audio data to Bland AI
          // For now, we'll simulate transcription
          this.simulateTranscription();
        }
      };

      this.mediaRecorder.start(1000); // Collect data every second
      this.isRecording = true;
      this.config?.onStatusChange?.('listening');
      
    } catch (error) {
      console.error('Error starting recording:', error);
      this.config?.onError?.(error as Error);
    }
  }

  async stopListening() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.config?.onStatusChange?.('connected');
    }
  }

  // Simulate transcription for demo purposes
  private simulateTranscription() {
    // This is a placeholder - in a real implementation, you'd send audio to Bland AI
    setTimeout(() => {
      const responses = [
        "I understand what you're saying.",
        "That's an interesting point.",
        "How can I help you with that?",
        "Let me think about that for a moment.",
        "Is there anything else you'd like to know?"
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      this.config?.onResponse?.(randomResponse);
    }, 2000);
  }

  async sendMessage(message: string) {
    if (!this.callId || !this.config?.apiKey) {
      throw new Error('No active call');
    }

    try {
      // Send message to the call
      const response = await fetch(`${BLAND_API_URL}/v1/calls/${this.callId}/send`, {
        method: 'POST',
        headers: {
          'authorization': this.config.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }

      this.config.onTranscript?.(message, 'user');
      
    } catch (error) {
      console.error('Error sending message:', error);
      this.config.onError?.(error as Error);
    }
  }

  async close() {
    try {
      // Stop recording
      if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.stop();
        this.isRecording = false;
      }

      // Close audio stream
      if (this.audioStream) {
        this.audioStream.getTracks().forEach(track => track.stop());
        this.audioStream = null;
      }

      // End the call
      if (this.callId && this.config?.apiKey) {
        await fetch(`${BLAND_API_URL}/v1/calls/${this.callId}/stop`, {
          method: 'POST',
          headers: {
            'authorization': this.config.apiKey,
            'Content-Type': 'application/json'
          }
        });
      }

      this.callId = null;
      this.config?.onStatusChange?.('disconnected');
      
    } catch (error) {
      console.error('Error closing connection:', error);
      this.config?.onError?.(error as Error);
    }
  }

  getSessionDuration(): number {
    if (!this.sessionStartTime) return 0;
    return Math.floor((Date.now() - this.sessionStartTime) / 1000);
  }

  isConnected(): boolean {
    return !!this.callId;
  }

  // Event listener methods for compatibility
  on(event: string, callback: Function) {
    // This is for compatibility with the existing code structure
    console.log(`Event listener registered for: ${event}`);
  }
}

export const blandService = new BlandService();