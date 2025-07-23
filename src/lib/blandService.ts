const API_KEY =
  "org_9f8039ca6a1aea840e79edd862f876c9f300a3f20e6e61626b447cd9e41cac04ede8280d3652ae50155369";
const BASE_URL = "https://api.bland.ai/v1";

export const createBlandAgent = async (prompt: string): Promise<string> => {
  const res = await fetch(`${BASE_URL}/agents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: API_KEY,
    },
    body: JSON.stringify({ prompt }),
  });

  const data = await res.json();
  return data.agent.agent_id;
};

export const getSessionToken = async (agentId: string): Promise<string> => {
  const res = await fetch(`${BASE_URL}/agents/${agentId}/authorize`, {
    method: "POST",
    headers: {
      Authorization: API_KEY,
    },
  });

  const data = await res.json();
  return data.token;
};

export const getCorrectedTranscript = async (callId: string) => {
  const res = await fetch(`${BASE_URL}/calls/${callId}/corrected-transcript`, {
    headers: { Authorization: API_KEY },
  });
  const data = await res.json();
  return data.aligned as Array<{
    id: number;
    text: string;
    user: "assistant" | "user";
  }>;
};
