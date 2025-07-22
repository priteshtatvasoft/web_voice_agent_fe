// components/TranscriptDisplay.tsx
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, User, Bot } from 'lucide-react';

interface TranscriptEntry {
  id: number;
  speaker: string;
  text: string;
  timestamp: string;
  isError?: boolean;
}

interface TranscriptDisplayProps {
  transcript: TranscriptEntry[];
}

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ transcript }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  const getSpeakerIcon = (speaker: string) => {
    if (speaker === 'You' || speaker === 'user') {
      return <User className="w-4 h-4" />;
    } else if (speaker === 'Assistant' || speaker === 'assistant') {
      return <Bot className="w-4 h-4" />;
    }
    return <MessageSquare className="w-4 h-4" />;
  };

  const getSpeakerColor = (speaker: string, isError?: boolean) => {
    if (isError) return 'text-red-500';
    if (speaker === 'You' || speaker === 'user') return 'text-blue-500';
    if (speaker === 'Assistant' || speaker === 'assistant') return 'text-green-500';
    return 'text-gray-500';
  };

  const getMessageBg = (speaker: string, isError?: boolean) => {
    if (isError) return 'bg-red-50 border-red-200';
    if (speaker === 'You' || speaker === 'user') return 'bg-blue-50 border-blue-200';
    if (speaker === 'Assistant' || speaker === 'assistant') return 'bg-green-50 border-green-200';
    return 'bg-gray-50 border-gray-200';
  };

  return (
    <Card className="card-elevated border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5" />
          <span>Conversation Transcript</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={scrollRef}
          className="h-96 overflow-y-auto space-y-4 pr-2"
        >
          {transcript.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No messages yet</p>
                <p className="text-xs mt-1">Start a conversation to see the transcript</p>
              </div>
            </div>
          ) : (
            transcript.map((entry) => (
              <div
                key={entry.id}
                className={`p-3 rounded-lg border transition-all ${getMessageBg(entry.speaker, entry.isError)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`flex items-center space-x-2 ${getSpeakerColor(entry.speaker, entry.isError)}`}>
                    {getSpeakerIcon(entry.speaker)}
                    <span className="font-medium text-sm">
                      {entry.speaker}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {entry.timestamp}
                  </span>
                </div>
                <p className={`text-sm ${entry.isError ? 'text-red-600' : 'text-gray-700'}`}>
                  {entry.text}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TranscriptDisplay;