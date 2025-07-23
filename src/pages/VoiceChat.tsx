"use client";

import React, { useEffect, useState, useRef } from "react";
import {
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
  const [inputValue, setInputValue] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    const storedApiKey = import.meta.env.VITE_BLAND_API_KEY;
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }

    const storedPathwayId = import.meta.env.VITE_PATHWAY_ID;
    if (storedPathwayId) {
      setPathwayId(storedPathwayId);
    }
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Create Chat after pathway
  useEffect(() => {
    if (!pathwayId || !apiKey) return;
    const initChat = async () => {
      try {
        const chat = await createChat(pathwayId, apiKey);
        setChatId(chat.chat_id);
        // Add welcome message
        setMessages([
          { role: "agent", text: "Hello! How can I help you today?" },
        ]);
      } catch (err) {
        console.error("Error initializing chat:", err);
      }
    };
    initChat();
  }, [pathwayId, apiKey]);

  // Handle sending prompt
  const handleSend = async (prompt: string) => {
    if (!chatId || !prompt) return;

    const prompts = prompt.trim();
    setMessages((prev) => [...prev, { role: "user", text: prompts }]);
    setLoading(true);
    setInputValue("");

    try {
      const res = await sendChatMessage(chatId, prompt, apiKey);
      const responseText =
        res?.assistant_responses?.[0] ??
        "I couldn't process that request. Please try again.";
      setMessages((prev) => [...prev, { role: "agent", text: responseText }]);

      // Play the TTS audio of agent response
      const audioUrl = await speakMessage(responseText, apiKey);
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current
          .play()
          .catch((e) => console.error("Audio play error:", e));
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          text: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle manual text input
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    await handleSend(inputValue);
  };

  // Start/stop microphone listening
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported in your browser. Please use Chrome or Edge."
      );
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
    <div className="flex flex-col h-screen max-w-md mx-auto py-12">
      <div className="flex flex-col bg-gray-50 h-[calc(100vh-64px)]">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 shadow-md">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
            Voice Assistant
          </h1>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-blue-100 text-black border border-gray-200 rounded-bl-none shadow-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg rounded-bl-none px-4 py-2 shadow-sm">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              name="prompt"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your message..."
              disabled={loading || isListening}
            />
            <button
              className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              type="submit"
              disabled={loading || isListening || !inputValue.trim()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </form>

          <div className="mt-2 flex justify-center">
            <button
              className={`flex items-center justify-center rounded-full w-14 h-14 ${
                isListening
                  ? "bg-red-500 animate-pulse"
                  : "bg-green-500 hover:bg-green-600"
              } text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all`}
              onClick={toggleListening}
              disabled={loading}
              aria-label={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              )}
            </button>
          </div>

          {isListening && (
            <div className="mt-2 text-center text-sm text-gray-500">
              Speak now...
            </div>
          )}
        </div>

        <audio ref={audioRef} />
      </div>
    </div>
  );
};

export default VoiceChat;
