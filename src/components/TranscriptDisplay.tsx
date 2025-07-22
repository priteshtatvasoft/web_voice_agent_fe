import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, User, Bot } from "lucide-react";

interface TranscriptMessage {
  id: number;
  speaker: string;
  text: string;
  timestamp: string;
}

interface TranscriptDisplayProps {
  transcript: TranscriptMessage[];
}

const TranscriptDisplay = ({ transcript }: TranscriptDisplayProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [transcript]);

  return (
    <Card className="card-elevated border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5" />
          <span>Live Transcript</span>
          <Badge variant="outline" className="ml-auto text-xs">
            {transcript.length} messages
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 overflow-y-auto space-y-4 scroll-smooth">
          {transcript.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No conversation yet</p>
              <p className="text-sm">Start talking to see the transcript here</p>
            </div>
          ) : (
            transcript.map((message) => (
              <div
                key={message.id}
                className={`
                  flex items-start space-x-3 p-3 rounded-lg transition-all duration-300 transcript-enter
                  ${message.speaker === "You" 
                    ? "bg-primary/10 border-l-2 border-primary" 
                    : "bg-accent/10 border-l-2 border-accent"
                  }
                `}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                  ${message.speaker === "You" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-accent text-accent-foreground"
                  }
                `}>
                  {message.speaker === "You" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-foreground text-sm">
                      {message.speaker}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {message.text}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
    </Card>
  );
};

export default TranscriptDisplay;