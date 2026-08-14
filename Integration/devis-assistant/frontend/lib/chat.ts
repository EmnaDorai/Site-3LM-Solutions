// Même convention que lib/api.ts (NEXT_PUBLIC_API_URL pointe déjà vers .../api)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export interface ChatMessageResponse {
  conversation: { id: number; session_id: string };
  user_message: { id: number; sender: string; content: string; timestamp: string };
  assistant_message: { id: number; sender: string; content: string; timestamp: string };
}

export async function postChatMessage(message: string, sessionId: string | null): Promise<ChatMessageResponse> {
  const response = await fetch(`${API_URL}/chat/messages/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, session_id: sessionId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to send message.');
  }

  return response.json();
}
