const US_BASE_API = "https://us.api.bland.ai/v1";
const SPEAK_API = "https://api.bland.ai/v1/speak";

export const createChat = async (pathway_id: string, apiKey: string) => {
  const options = {
    method: 'POST',
    headers: {authorization: apiKey, 'Content-Type': 'application/json'},
    body: JSON.stringify({
      pathway_id: pathway_id,
      start_node_id: "2b65da4e-2f5e-4306-8dba-efb04ce09167"
    })
  };
  const res = await fetch(`${US_BASE_API}/pathway/chat/create`, options);
  const data = await res.json();
  return data.data;
};

export const sendChatMessage = async (
  chat_id: string,
  prompt: string,
  apiKey: string
) => {
  const res = await fetch(`${US_BASE_API}/pathway/chat/${chat_id}`, {
    method: "POST",
    headers: {
      Authorization: apiKey,
    },
    body: JSON.stringify({
      prompt,
    }),
  });
  const data = await res.json();
  return data.data;
};

export const speakMessage = async (text: string, apiKey: string) => {
  const res = await fetch(SPEAK_API, {
    method: "POST",
    headers: {
      Authorization: apiKey,
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
