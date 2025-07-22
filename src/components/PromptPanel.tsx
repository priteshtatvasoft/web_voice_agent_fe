import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Edit, Save, RotateCcw } from 'lucide-react';

interface PromptPanelProps {
  currentPrompt: string;
  onPromptChange: (prompt: string) => void;
  isConnected: boolean;
}

const PromptPanel = ({ currentPrompt, onPromptChange, isConnected }: PromptPanelProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(currentPrompt);

  const defaultPrompts = [
    "You are a helpful AI assistant. Engage in natural conversation and ask follow-up questions to keep the dialogue flowing.",
    "You are a technical support agent. Help users troubleshoot problems and provide clear step-by-step solutions.",
    "You are a friendly customer service representative. Be empathetic and solution-focused in your responses.",
    "You are a creative writing coach. Help users brainstorm ideas and improve their writing skills.",
    "You are a career counselor. Provide guidance on professional development and career planning."
  ];

  const handleSave = () => {
    onPromptChange(editedPrompt);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedPrompt(currentPrompt);
    setIsEditing(false);
  };

  const handlePresetSelect = (preset: string) => {
    setEditedPrompt(preset);
    onPromptChange(preset);
    setIsEditing(false);
  };

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Current Prompt</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {isConnected && (
              <Badge variant="secondary" className="bg-voice-active/20 text-voice-active">
                Active
              </Badge>
            )}
            
            {!isEditing ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-3 w-3" />
              </Button>
            ) : (
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSave}
                >
                  <Save className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Dynamic context that guides the agent's responses during conversation
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current/Editable Prompt */}
        {!isEditing ? (
          <div className="p-3 bg-muted/50 rounded-md border border-border">
            <p className="text-sm text-foreground leading-relaxed">
              {currentPrompt}
            </p>
          </div>
        ) : (
          <Textarea
            value={editedPrompt}
            onChange={(e) => setEditedPrompt(e.target.value)}
            placeholder="Enter the prompt for the AI agent..."
            className="min-h-[100px] bg-input border-border"
          />
        )}

        {/* Preset Prompts */}
        {isEditing && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Quick Presets:</h4>
            <div className="space-y-2">
              {defaultPrompts.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handlePresetSelect(preset)}
                  className="w-full text-left p-2 text-xs bg-muted/30 hover:bg-muted/50 rounded border border-border transition-colors"
                >
                  {preset.substring(0, 80)}...
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Real-time Update Info */}
        {isConnected && (
          <div className="text-xs text-muted-foreground bg-voice-active/10 p-2 rounded border border-voice-active/20">
            <strong>Live Update:</strong> This prompt is actively guiding the agent's responses in your current conversation.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PromptPanel;