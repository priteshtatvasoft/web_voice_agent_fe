import { Mic, Volume2, Radio } from "lucide-react";

interface VoiceVisualizerProps {
  isListening: boolean;
  isSpeaking: boolean;
  isConnected: boolean;
}

const VoiceVisualizer = ({ isListening, isSpeaking, isConnected }: VoiceVisualizerProps) => {
  const getVisualizerState = () => {
    if (!isConnected) return "inactive";
    if (isListening) return "listening";
    if (isSpeaking) return "speaking";
    return "ready";
  };

  const state = getVisualizerState();

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Main Voice Circle */}
      <div className="relative">
        <div 
          className={`
            w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500
            ${state === "listening" ? "bg-accent voice-active shadow-voice" : ""}
            ${state === "speaking" ? "bg-primary voice-pulse shadow-primary" : ""}
            ${state === "ready" ? "bg-secondary hover:bg-secondary/80" : ""}
            ${state === "inactive" ? "bg-muted" : ""}
          `}
        >
          {state === "listening" && <Mic className="w-12 h-12 text-accent-foreground" />}
          {state === "speaking" && <Volume2 className="w-12 h-12 text-primary-foreground" />}
          {state === "ready" && <Radio className="w-12 h-12 text-secondary-foreground" />}
          {state === "inactive" && <Mic className="w-12 h-12 text-muted-foreground" />}
        </div>

        {/* Pulsing rings for active states */}
        {(isListening || isSpeaking) && (
          <>
            <div className={`
              absolute inset-0 rounded-full border-2 animate-ping
              ${isListening ? "border-accent/50" : "border-primary/50"}
            `} />
            <div className={`
              absolute -inset-2 rounded-full border border-opacity-30 animate-pulse
              ${isListening ? "border-accent" : "border-primary"}
            `} />
          </>
        )}
      </div>

      {/* Status Text */}
      <div className="text-center">
        <p className="text-lg font-medium text-foreground">
          {state === "listening" && "Listening..."}
          {state === "speaking" && "AI Speaking"}
          {state === "ready" && "Ready to Listen"}
          {state === "inactive" && "Not Connected"}
        </p>
        <p className="text-sm text-muted-foreground">
          {state === "listening" && "Speak now, I'm recording your voice"}
          {state === "speaking" && "AI is responding to your message"}
          {state === "ready" && "Press the microphone button to speak"}
          {state === "inactive" && "Start a conversation to begin"}
        </p>
      </div>

      {/* Audio Wave Visualization (simulated) */}
      {(isListening || isSpeaking) && (
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`
                w-1 bg-current rounded-full animate-pulse
                ${isListening ? "text-accent" : "text-primary"}
              `}
              style={{
                height: `${Math.random() * 20 + 10}px`,
                animationDelay: `${i * 100}ms`,
                animationDuration: "800ms"
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VoiceVisualizer;