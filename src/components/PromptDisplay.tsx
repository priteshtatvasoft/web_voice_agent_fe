import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Edit3, Save, X } from "lucide-react";

interface PromptDisplayProps {
  currentPrompt: string;
}

const PromptDisplay = ({ currentPrompt }: PromptDisplayProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(currentPrompt);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);

  useEffect(() => {
    setEditedPrompt(currentPrompt);
    
    // Add to history if it's different from the last one
    if (promptHistory.length === 0 || promptHistory[promptHistory.length - 1] !== currentPrompt) {
      setPromptHistory(prev => [...prev, currentPrompt].slice(-5)); // Keep last 5
    }
  }, [currentPrompt, promptHistory]);

  const handleSave = () => {
    // In a real implementation, this would update the AI's current prompt
    setIsEditing(false);
    console.log("Updated prompt:", editedPrompt);
  };

  const handleCancel = () => {
    setEditedPrompt(currentPrompt);
    setIsEditing(false);
  };

  const getPromptStatus = () => {
    if (currentPrompt.includes("Welcome") || currentPrompt.includes("Hello")) return "greeting";
    if (currentPrompt.includes("listening") || currentPrompt.includes("ready")) return "active";
    if (currentPrompt.includes("ended") || currentPrompt.includes("disconnected")) return "inactive";
    return "responding";
  };

  const promptStatus = getPromptStatus();

  return (
    <Card className="card-elevated border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span>Current Prompt</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline" 
              className={`text-xs ${
                promptStatus === "active" ? "border-accent text-accent" :
                promptStatus === "greeting" ? "border-primary text-primary" :
                promptStatus === "inactive" ? "border-muted-foreground text-muted-foreground" :
                "border-secondary-foreground text-secondary-foreground"
              }`}
            >
              {promptStatus}
            </Badge>
            {!isEditing ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            ) : (
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                >
                  <Save className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="space-y-4">
            <div className={`
              p-4 rounded-lg border transition-all duration-300
              ${promptStatus === "active" ? "bg-accent/10 border-accent/20" :
                promptStatus === "greeting" ? "bg-primary/10 border-primary/20" :
                promptStatus === "inactive" ? "bg-muted/50 border-muted" :
                "bg-secondary/50 border-secondary"
              }
            `}>
              <p className="text-sm leading-relaxed text-foreground">
                {currentPrompt}
              </p>
            </div>

            {promptHistory.length > 1 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Recent Prompts
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {promptHistory.slice(-4, -1).reverse().map((prompt, index) => (
                    <div
                      key={index}
                      className="p-2 text-xs text-muted-foreground bg-muted/30 rounded border"
                    >
                      {prompt.length > 60 ? `${prompt.substring(0, 60)}...` : prompt}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <Textarea
              value={editedPrompt}
              onChange={(e) => setEditedPrompt(e.target.value)}
              placeholder="Enter the AI prompt..."
              className="min-h-24 bg-secondary border-border"
            />
            <p className="text-xs text-muted-foreground">
              Edit the current prompt to guide the AI's responses. Changes will apply to the next interaction.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PromptDisplay;