import React from "react";

interface Message {
  sender: "user" | "agent";
  text: string;
}

interface Props {
  conversation: Message[];
}

const ConversationPanel: React.FC<Props> = ({ conversation }) => {
  return (
    <div className="flex flex-col gap-2 p-4 h-full overflow-y-auto">
      {conversation.map((msg, idx) => (
        <div
          key={idx}
          className={`p-2 rounded-lg max-w-xs ${
            msg.sender === "user"
              ? "bg-blue-100 self-end"
              : "bg-gray-100 self-start"
          }`}
        >
          <span className="text-sm text-gray-800">{msg.text}</span>
        </div>
      ))}
    </div>
  );
};

export default ConversationPanel;
