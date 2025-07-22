// components/BlandVoiceAgent.tsx
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Phone, PhoneOff, Loader2, Volume2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

const BlandVoiceAgentA = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const apiKey = "org_9f8039ca6a1aea840e79edd862f876c9f300a3f20e6e61626b447cd9e41cac04ede8280d3652ae50155369";
  const wsUrl = "wss://api.bland.ai/v1/voice";
  
  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const { toast } = useToast();

  // Initialize WebSocket connection
  useEffect(() => {
    if (!apiKey) {
      setError("API key is required");
      return;
    }

    const connectWebSocket = () => {
      try {
        const socket = new WebSocket(`${wsUrl}?api_key=${encodeURIComponent(apiKey)}`);
        socket.binaryType = 'arraybuffer';

        socket.onopen = () => {
          console.log('WebSocket Connected');
          setIsConnected(true);
          setError(null);
          addSystemMessage("Connected to voice service");
        };

        socket.onmessage = (event) => {
          try {
            // Handle binary audio data
            if (event.data instanceof ArrayBuffer) {
              audioQueueRef.current.push(event.data);
              playAudioQueue();
              return;
            }

            // Handle text messages
            const data = JSON.parse(event.data);
            console.log('Received message:', data);

            if (data.type === 'transcript') {
              addMessage('assistant', data.text);
            } else if (data.type === 'error') {
              throw new Error(data.message || 'Unknown error from voice service');
            }
          } catch (error) {
            console.error('Error processing message:', error);
            setError(error instanceof Error ? error.message : 'Failed to process message');
          }
        };

        socket.onclose = () => {
          console.log('WebSocket Disconnected');
          setIsConnected(false);
          setIsListening(false);
          setIsSpeaking(false);
          
          if (!error) {
            addSystemMessage("Disconnected from voice service");
          }
          
          // Attempt to reconnect after a delay
          setTimeout(() => {
            if (!error) {
              connectWebSocket();
            }
          }, 3000);
        };

        socket.onerror = (error) => {
          console.error('WebSocket Error:', error);
          setError('Failed to connect to voice service');
          setIsConnected(false);
        };

        socketRef.current = socket;

        return () => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.close();
          }
        };
      } catch (error) {
        console.error('Error initializing WebSocket:', error);
        setError('Failed to initialize voice connection');
      }
    };

    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      stopRecording();
    };
  }, [apiKey]);

  // Audio playback queue
  const playAudioQueue = async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) return;
    
    isPlayingRef.current = true;
    setIsSpeaking(true);
    
    try {
      while (audioQueueRef.current.length > 0) {
        const audioData = audioQueueRef.current.shift();
        if (!audioData) continue;
        
        await playAudio(audioData);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setError('Failed to play audio response');
    } finally {
      isPlayingRef.current = false;
      setIsSpeaking(false);
    }
  };

  const playAudio = async (audioData: ArrayBuffer): Promise<void> => {
    return new Promise((resolve) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      audioContext.decodeAudioData(audioData.slice(0))
        .then((buffer) => {
          const source = audioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContext.destination);
          
          source.onended = () => {
            resolve();
          };
          
          source.start(0);
        })
        .catch((error) => {
          console.error('Error decoding audio:', error);
          resolve();
        });
    });
  };

  const startRecording = async () => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setError('Not connected to voice service');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      
      source.connect(processor);
      processor.connect(audioContext.destination);
      
      const audioChunks: Blob[] = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const arrayBuffer = await audioBlob.arrayBuffer();
        
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(arrayBuffer);
        }
      };
      
      mediaRecorder.start(100); // Collect data every 100ms
      mediaRecorderRef.current = mediaRecorder;
      setIsListening(true);
      addMessage('user', '[Listening...]');
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const addMessage = (role: 'user' | 'assistant' | 'system', content: string) => {
    setMessages(prev => [...prev, {
      role,
      content,
      timestamp: new Date()
    }]);
  };

  const addSystemMessage = (content: string) => {
    addMessage('system', content);
  };

  const handleEndCall = () => {
    stopRecording();
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }
    setIsConnected(false);
    addSystemMessage("Call ended");
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-6 h-6" />
            <span>Voice Assistant</span>
            {isConnected ? (
              <span className="h-3 w-3 rounded-full bg-green-500"></span>
            ) : (
              <span className="h-3 w-3 rounded-full bg-red-500"></span>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Status Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${
                isListening ? 'bg-yellow-500' : 'bg-gray-300'
              }`}></div>
              <span className="text-sm text-gray-600">
                {isListening ? 'Listening...' : 'Ready'}
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : message.role === 'assistant'
                      ? 'bg-gray-200 text-gray-800'
                      : 'bg-yellow-100 text-yellow-800 text-sm'
                  }`}
                >
                  <p>{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            {!isConnected ? (
              <Button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Phone className="w-4 h-4 mr-2" />
                Connect
              </Button>
            ) : (
              <>
                <Button
                  onClick={toggleListening}
                  disabled={isSpeaking}
                  className={`${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isListening ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Stop Listening
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Start Speaking
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleEndCall}
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                >
                  <PhoneOff className="w-4 h-4 mr-2" />
                  End Call
                </Button>
              </>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BlandVoiceAgentA;