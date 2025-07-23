import React from "react";

interface Props {
  prompt: string;
}

const PromptPanel: React.FC<Props> = ({ prompt }) => {
  return (
    <div className="bg-white border-t px-4 py-2">
      <p className="text-sm text-gray-600">
        <strong>Current Prompt:</strong> {prompt}
      </p>
    </div>
  );
};

export default PromptPanel;
