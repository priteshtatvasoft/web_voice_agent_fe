import React, { useRef, useState } from "react";
import axios from "axios";

const BLAND_API_KEY = "org_4a7ec6f5e065e74a7f1ec6cd4080785549f9a4f20636f66499669e5ec61303cc5a9b29609e03451d267469";

export default function BlandConversation() {
  const [transcript, setTranscript] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("You are a helpful assistant.");
  const [status, setStatus] = useState<"idle" | "connecting" | "live">("idle");

  const ws = useRef<WebSocket | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);

  /* ---------- 1. create the call & get the web socket url ---------- */
  const startConversation = async () => {
    setStatus("connecting");

    const { data } = await axios.post(
      "https://api.bland.ai/v1/calls",
      {
        api_key: BLAND_API_KEY,
        phone_number: "+14155551234", // dummy – will not dial because web_call=true
        task: prompt,
        max_duration: 180,
        web_call: true, // 👈 this is the magic flag
      },
      { headers: { "Content-Type": "application/json", authorization: BLAND_API_KEY } }
    );

    const socketUrl = data.web_socket_url; // supplied by Bland
    if (!socketUrl) throw new Error("No web socket returned");

    /* ---------- 2. open the socket ---------- */
    const socket = new WebSocket(socketUrl);
    ws.current = socket;

    socket.onopen = async () => {
      setStatus("live");

      /* microphone */
      stream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      recorder.current = new MediaRecorder(stream.current, {
        mimeType: "audio/webm;codecs=opus",
      });

      recorder.current.ondataavailable = (e) => {
        e.data.arrayBuffer().then((buf) => {
          const base64 = btoa(
            new Uint8Array(buf).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ""
            )
          );
          socket.send(JSON.stringify({ type: "audio", data: base64 }));
        });
      };

      recorder.current.start(250); // 250 ms chunks
    };

    socket.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.type === "transcript") {
        setTranscript((t) => [...t, `Agent: ${msg.text}`]);
      }
      if (msg.type === "user_transcript") {
        setTranscript((t) => [...t, `You: ${msg.text}`]);
      }
    };

    socket.onclose = () => setStatus("idle");
  };

  const stopConversation = () => {
    recorder.current?.stop();
    stream.current?.getTracks().forEach((t) => t.stop());
    ws.current?.close();
    setStatus("idle");
  };

  /* prompt update */
  const updatePrompt = (text: string) => {
    setPrompt(text);
    ws.current?.send(JSON.stringify({ type: "update_prompt", prompt: text }));
  };

  /* ---------- render ---------- */
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Bland.ai Web Agent</h1>

      <label className="block">
        <span className="text-sm font-medium">Prompt</span>
        <textarea
          className="w-full border rounded p-2"
          rows={2}
          value={prompt}
          onChange={(e) => updatePrompt(e.target.value)}
        />
      </label>

      <div>
        {status === "idle" && (
          <button
            onClick={startConversation}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Start Conversation
          </button>
        )}
        {status === "connecting" && <span>Connecting…</span>}
        {status === "live" && (
          <>
            <span className="mr-4 text-green-600">🟢 Live</span>
            <button
              onClick={stopConversation}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Stop
            </button>
          </>
        )}
      </div>

      <div className="border rounded p-4 h-80 overflow-y-auto bg-gray-50">
        {transcript.map((line, i) => (
          <p key={i} className="text-sm">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
