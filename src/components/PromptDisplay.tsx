// components/PromptDisplay.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain } from 'lucide-react';

interface PromptDisplayProps {
  currentPrompt: string;
}

const PromptDisplay: React.FC<PromptDisplayProps> = ({ currentPrompt }) => {
  return (
    <Card className="card-elevated border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-sm">
          <Brain className="w-4 h-4" />
          <span>Assistant Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="p-3 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-700 leading-relaxed">
              {currentPrompt}
            </p>
          </div>
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>💡 <strong>Tips:</strong></p>
            <ul className="ml-4 space-y-1 list-disc">
              <li>Speak clearly and at a normal pace</li>
              <li>Wait for the assistant to finish speaking</li>
              <li>Ask follow-up questions for clarification</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromptDisplay;