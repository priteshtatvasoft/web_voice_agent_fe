"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  createPathway,
  createChat,
  sendChatMessage,
  speakMessage,
} from "../lib/blandPathwayService";

type Message = {
  role: "user" | "agent";
  text: string;
};

const VoiceChat = () => {
  const [pathwayId, setPathwayId] = useState("");
  const [chatId, setChatId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create Pathway on load
  useEffect(() => {
    const initChat = async () => {
      const pathway = await createPathway();
      setPathwayId(pathway.pathway_id);
    };
    initChat();
  }, []);

  // Create Chat after pathway
  useEffect(() => {
    if (!pathwayId) return;
    const initChat = async () => {
      const chat = await createChat(pathwayId);
      setChatId(chat.chat_id);
    };
    initChat();
  }, [pathwayId]);

  // Handle sending prompt
  const handleSend = async (prompt: string) => {
    if (!chatId || !prompt) return;

    setMessages((prev) => [...prev, { role: "user", text: prompt }]);
    setLoading(true);

    try {
      const res = await sendChatMessage(chatId, prompt);
      const responseText = res?.assistant_responses?.[0] ?? "[No response]";
      setMessages((prev) => [...prev, { role: "agent", text: responseText }]);

      // Play the TTS audio of agent response
      const audioUrl = await speakMessage(responseText);
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle manual text input
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).elements.namedItem("prompt") as HTMLInputElement;
    const prompt = input.value.trim();
    if (!prompt) return;

    await handleSend(prompt);
    input.value = "";
  };

  // Start microphone listening
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = async (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      await handleSend(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <h2 className="text-xl font-semibold">🎤 Bland Voice Chat</h2>

      <div className="border rounded p-4 space-y-2 bg-white h-80 overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-sm ${
              msg.role === "user" ? "text-blue-600" : "text-green-600"
            }`}
          >
            <strong>{msg.role === "user" ? "You" : "Agent"}:</strong> {msg.text}
          </div>
        ))}
        {loading && <div className="text-gray-500">Agent is typing...</div>}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          name="prompt"
          className="flex-1 border px-2 py-1 rounded"
          placeholder="Type your message..."
        />
        <button className="bg-blue-600 text-white px-4 py-1 rounded" type="submit">
          Send
        </button>
      </form>

      <button
        className={`w-full px-4 py-2 rounded ${
          isListening ? "bg-red-500" : "bg-green-600"
        } text-white`}
        onClick={startListening}
        disabled={loading}
      >
        {isListening ? "Listening..." : "🎤 Speak"}
      </button>

      <audio ref={audioRef} />
    </div>
  );
};

export default VoiceChat;
