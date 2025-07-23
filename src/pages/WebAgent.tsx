import React, { useEffect, useRef, useState } from "react";
import ConversationPanel from "../components/conversation/ConversationPanel";
import PromptPanel from "../components/conversation/PromptPanel";
import { BlandWebClient } from "bland-client-js-sdk";
import {
  createBlandAgent,
  getCorrectedTranscript,
  getSessionToken,
} from "@/lib/blandService";
import { v4 as uuidv4 } from "uuid";

interface Message {
  sender: "user" | "agent";
  text: string;
}

const WebAgentPage = () => {
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("Say hello to start the conversation");
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const sdkRef = useRef<BlandWebClient | null>(null);
  const callId = uuidv4();

  const startBlandVoiceChat = async () => {
    try {
      const agentId = await createBlandAgent("You are a helpful voice agent.");
      const token = await getSessionToken(agentId);

      const sdk = new BlandWebClient(agentId, token);
      sdkRef.current = sdk;

      sdk.initConversation({
        sampleRate: 44100,
        callId,
      });

      console.log("sdk::", sdk)

    //   const callId: string = sdk.callId;

    //   setStartTime(Date.now());
    //   await sdk.stopConversation();

    console.log("callId::", callId);
      const aligned = await getCorrectedTranscript(callId);
      console.log("Aligned::", aligned);

    //   aligned.forEach((item) => {
    //     const sender = item.user === "assistant" ? "agent" : "user";
    //     setConversation((prev) => [
    //       ...prev,
    //       { sender, text: item.text.trim() },
    //     ]);
    //   });

      // Later you can call sdk.stopConversation() when needed
      console.log("🔊 Voice session started.");
    } catch (err) {
      console.error("Failed to start Bland voice session:", err);
    }
  };

  useEffect(() => {
    const requestMicAccess = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasMicPermission(true);
      } catch (err) {
        setError(
          "Microphone access denied. Please allow mic access to continue."
        );
      }
    };

    requestMicAccess();
  }, []);

  const handleStart = async () => {
    setPrompt("Starting conversation...");
    await startBlandVoiceChat();
    setPrompt("Listening...");
  };

  const handleStop = async () => {
    setPrompt("Stopping conversation...");
    if (sdkRef.current) {
      await sdkRef.current.stopConversation();
    }
    setPrompt("Conversation stopped.");
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-indigo-600 text-white px-6 py-4 text-lg font-semibold">
        Bland.ai Web Agent
      </header>

      {!hasMicPermission && error && (
        <div className="bg-red-100 text-red-700 p-4 text-sm">{error}</div>
      )}

      {hasMicPermission && (
        <>
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <ConversationPanel conversation={conversation} />
          </div>

          <PromptPanel prompt={prompt} />

          <div className="border-t p-4 flex justify-center gap-2">
            <button
              onClick={handleStart}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
            >
              Start Conversation
            </button>

            <button
              onClick={handleStop}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
            >
              Stop Conversation
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default WebAgentPage;
