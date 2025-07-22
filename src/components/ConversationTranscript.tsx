import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, Clock } from 'lucide-react';
import { Message } from '@/pages/WebAgent';

interface ConversationTranscriptProps {
  messages: Message[];
  isConnected: boolean;
}

const ConversationTranscript = ({ messages, isConnected }: ConversationTranscriptProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (!isConnected && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Bot className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground">Ready to Start</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Click "Start Conversation" to begin your voice chat with the Bland.ai agent. 
              Your conversation will appear here in real-time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 animate-fade-in ${
              message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <Avatar className="h-8 w-8 mt-1">
              <AvatarFallback className={
                message.type === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-voice-active text-primary-foreground'
              }>
                {message.type === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </AvatarFallback>
            </Avatar>

            {/* Message Content */}
            <div className={`flex-1 max-w-[80%] ${
              message.type === 'user' ? 'text-right' : 'text-left'
            }`}>
              {/* Message Bubble */}
              <div className={`
                inline-block px-4 py-2 rounded-2xl text-sm
                ${message.type === 'user' 
                  ? 'bg-primary text-primary-foreground rounded-br-md' 
                  : 'bg-muted text-foreground rounded-bl-md'
                }
                max-w-full word-wrap break-words
              `}>
                {message.content}
              </div>
              
              {/* Timestamp */}
              <div className={`flex items-center gap-1 text-xs text-muted-foreground mt-1 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}>
                <Clock className="h-3 w-3" />
                <span>{formatTime(message.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator (when agent is processing) */}
        {isConnected && messages.length > 0 && (
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 mt-1">
              <AvatarFallback className="bg-voice-active text-primary-foreground">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="inline-block px-4 py-2 rounded-2xl rounded-bl-md bg-muted">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty div for scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default ConversationTranscript;