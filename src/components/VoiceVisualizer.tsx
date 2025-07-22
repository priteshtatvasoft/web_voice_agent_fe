import { useEffect, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceVisualizerProps {
  isListening: boolean;
  isSpeaking: boolean;
  isConnected: boolean;
}

const VoiceVisualizer = ({ isListening, isSpeaking, isConnected }: VoiceVisualizerProps) => {
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    if (isListening || isSpeaking) {
      // Simulate audio level changes
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);
      
      return () => clearInterval(interval);
    } else {
      setAudioLevel(0);
    }
  }, [isListening, isSpeaking]);

  const getStatusColor = () => {
    if (!isConnected) return 'bg-muted';
    if (isSpeaking) return 'bg-primary-glow';
    if (isListening) return 'bg-voice-active';
    return 'bg-voice-inactive';
  };

  const getStatusText = () => {
    if (!isConnected) return 'Disconnected';
    if (isSpeaking) return 'Agent Speaking';
    if (isListening) return 'Listening';
    return 'Ready';
  };

  return (
    <div className="flex flex-col items-center space-y-4 py-6">
      {/* Main Microphone Visual */}
      <div className="relative">
        {/* Outer pulse rings */}
        {(isListening || isSpeaking) && (
          <>
            <div className="absolute inset-0 animate-voice-ring">
              <div className={`w-32 h-32 rounded-full border-2 ${
                isSpeaking ? 'border-primary-glow' : 'border-voice-active'
              } opacity-20`} />
            </div>
            <div className="absolute inset-2 animate-voice-ring" style={{ animationDelay: '0.3s' }}>
              <div className={`w-28 h-28 rounded-full border-2 ${
                isSpeaking ? 'border-primary-glow' : 'border-voice-active'
              } opacity-30`} />
            </div>
          </>
        )}
        
        {/* Main microphone circle */}
        <div className={`
          relative w-32 h-32 rounded-full flex items-center justify-center
          ${getStatusColor()}
          ${(isListening || isSpeaking) ? 'animate-voice-pulse shadow-voice' : ''}
          transition-all duration-300
        `}>
          {isConnected ? (
            <Mic className="h-12 w-12 text-primary-foreground" />
          ) : (
            <MicOff className="h-12 w-12 text-muted-foreground" />
          )}
          
          {/* Audio level indicator */}
          {isConnected && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((bar) => (
                  <div
                    key={bar}
                    className={`w-1 bg-primary-foreground transition-all duration-150 ${
                      audioLevel > bar * 20 ? 'h-3' : 'h-1'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Text */}
      <div className="text-center">
        <div className={`text-lg font-medium ${
          isConnected ? 'text-foreground' : 'text-muted-foreground'
        }`}>
          {getStatusText()}
        </div>
        
        {isConnected && (
          <div className="text-sm text-muted-foreground mt-1">
            {isListening && "Speak now..."}
            {isSpeaking && "Agent is responding..."}
            {!isListening && !isSpeaking && "Ready to listen"}
          </div>
        )}
      </div>

      {/* Visual Equalizer Bars (for speaking) */}
      {isSpeaking && (
        <div className="flex items-end space-x-1 h-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((bar) => (
            <div
              key={bar}
              className="w-2 bg-primary-glow animate-voice-pulse rounded-t"
              style={{
                height: `${20 + (audioLevel + bar * 10) % 50}%`,
                animationDelay: `${bar * 0.1}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VoiceVisualizer;