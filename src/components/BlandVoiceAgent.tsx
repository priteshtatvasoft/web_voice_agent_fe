import { useRef, useState } from "react";

const BLAND_API_KEY = import.meta.env.VITE_BLAND_API_KEY;
const BLAND_API_URL = "https://api.bland.ai/v1";

export default function VoiceAgent() {
  const [transcript, setTranscript] = useState<string[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const createAgent = async () => {
    const res = await fetch(`${BLAND_API_URL}/agents`, {
      method: "POST",
      headers: {
        Authorization: BLAND_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: "You are a helpful voice assistant.",
        voice: "nat",
        model: "enhanced",
        language: "en",
        max_duration: 60,
        wait_for_greeting: false,
        record: true,
      }),
    });
    const data = await res.json();
    return data.agent_id;
  };

  const startCall = async (agentId: string) => {
    const res = await fetch(`${BLAND_API_URL}/calls`, {
      method: "POST",
      headers: {
        Authorization: BLAND_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agent_id: agentId,
        phone_number: "+15551234567", // ← add this
        wait_for_greeting: false,
        task: "web-session",
        record: true,
      }),
    });
    const data = await res.json();
    return data.websocket_url;
  };

  const connectWebSocket = (url: string) => {
    const ws = new WebSocket(url);
    ws.binaryType = "arraybuffer";
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "transcript") {
        setTranscript((prev) => [...prev, `You: ${msg.transcript.text}`]);
      }

      if (msg.type === "ai_response") {
        setTranscript((prev) => [...prev, `AI: ${msg.response.text}`]);
      }

      if (msg.type === "audio") {
        const audio = new Audio(`data:audio/wav;base64,${msg.audio}`);
        audio.play();
      }
    };

    ws.onerror = (err) => console.error("WebSocket error:", err);
    ws.onclose = () => console.log("WebSocket closed");
  };

  const startMicStreaming = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

    recorder.ondataavailable = async (event) => {
      if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
        const buffer = await event.data.arrayBuffer();
        wsRef.current.send(buffer);
      }
    };

    recorder.start(250); // stream every 250ms
    mediaRecorderRef.current = recorder;
  };

  const startVoiceAgent = async () => {
    const agentId = await createAgent();
    const wsUrl = await startCall(agentId);
    connectWebSocket(wsUrl);
    await startMicStreaming();
  };

  return (
    <div className="p-4">
      <button
        onClick={startVoiceAgent}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Start Voice Assistant
      </button>

      <div className="mt-4 space-y-1 text-sm">
        {transcript.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </div>
  );
}
