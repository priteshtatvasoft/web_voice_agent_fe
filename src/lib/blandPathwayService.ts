// services/blandService.ts
import axios from "axios";

const API_KEY =
  "org_9f8039ca6a1aea840e79edd862f876c9f300a3f20e6e61626b447cd9e41cac04ede8280d3652ae50155369"; // Store this in your .env file

const BASE_API = "https://api.bland.ai/v1";
const US_BASE_API = "https://us.api.bland.ai/v1";
const SPEAK_API = "https://api.bland.ai/v1/speak";

const blandApi = axios.create({
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
});

export const createPathway = async () => {
  const res = await blandApi.post(`${BASE_API}/pathway/create`, {
    name: "My Web Agent Chat",
  });
  return res.data.data;
};

export const createChat = async (pathway_id: string) => {
  console.log("pathway_id", pathway_id);
  const res = await blandApi.post(`${US_BASE_API}/pathway/chat/create`, {
    pathway_id,
  });
  return res.data.data;
};

export const sendChatMessage = async (chat_id: string, prompt: string) => {
  const res = await blandApi.post(`${US_BASE_API}/pathway/chat/${chat_id}`, {
    prompt,
  });
  return res.data.data;
};

export const speakMessage = async (text: string) => {
  const res = await fetch(SPEAK_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      voice: "Maeve",
      text: text,
      output_format: "pcm_44100",
    }),
  });

  const blob = await res.blob();
  return URL.createObjectURL(blob); // Return audio URL
};
