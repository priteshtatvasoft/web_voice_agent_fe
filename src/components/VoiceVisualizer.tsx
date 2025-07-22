// components/VoiceVisualizer.tsx
import React from 'react';

interface VoiceVisualizerProps {
  isListening: boolean;
  isSpeaking: boolean;
  isConnected: boolean;
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ 
  isListening, 
  isSpeaking, 
  isConnected 
}) => {
  const getVisualizerState = () => {
    if (!isConnected) return 'disconnected';
    if (isListening) return 'listening';
    if (isSpeaking) return 'speaking';
    return 'connected';
  };

  const state = getVisualizerState();

  const getBarsClass = () => {
    switch (state) {
      case 'listening':
        return 'animate-pulse bg-blue-500';
      case 'speaking':
        return 'animate-bounce bg-green-500';
      case 'connected':
        return 'bg-gray-400';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusText = () => {
    switch (state) {
      case 'listening':
        return 'Listening...';
      case 'speaking':
        return 'Speaking...';
      case 'connected':
        return 'Connected - Ready to chat';
      default:
        return 'Not connected';
    }
  };

  const getStatusColor = () => {
    switch (state) {
      case 'listening':
        return 'text-blue-500';
      case 'speaking':
        return 'text-green-500';
      case 'connected':
        return 'text-gray-600';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Voice Visualizer Bars */}
      <div className="flex items-end justify-center space-x-1 h-20">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className={`w-2 transition-all duration-300 rounded-full ${getBarsClass()}`}
            style={{
              height: state === 'listening' || state === 'speaking' 
                ? `${20 + Math.random() * 40}px`
                : '20px',
              animationDelay: `${index * 0.1}s`
            }}
          />
        ))}
      </div>

      {/* Status Text */}
      <p className={`text-sm font-medium transition-colors ${getStatusColor()}`}>
        {getStatusText()}
      </p>

      {/* Connection Indicator */}
      <div className="flex items-center space-x-2">
        <div 
          className={`w-3 h-3 rounded-full transition-colors ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} 
        />
        <span className="text-xs text-gray-500">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    </div>
  );
};

export default VoiceVisualizer;