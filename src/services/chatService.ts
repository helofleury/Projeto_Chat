import {
  get,
  onValue,
  push,
  ref,
  serverTimestamp,
  set,
} from "firebase/database";

import { db } from "./firebase";

import type {
  ChatMessage,
  Conversation,
} from "../types/chat";

export const createConversationId = (
  userIdA: string,
  userIdB: string
): string => {
  return [userIdA, userIdB].sort().join("_");
};

export const getOrCreateConversation = async (
  userIdA: string,
  userIdB: string
): Promise<Conversation> => {
  const conversationId = createConversationId(
    userIdA,
    userIdB
  );

  const conversationRef = ref(
    db,
    `conversations/${conversationId}`
  );

  const snapshot = await get(conversationRef);

  if (snapshot.exists()) {
    return snapshot.val() as Conversation;
  }

  const participants: [string, string] =
    [userIdA, userIdB].sort() as [string, string];

  const conversation: Conversation = {
    id: conversationId,
    participants,
    createdAt: Date.now(),
  };

  await set(conversationRef, conversation);

  return conversation;
};

export const sendMessage = async (
  conversationId: string,
  senderId: string,
  receiverId: string,
  text: string
): Promise<ChatMessage> => {
  const messagesRef = ref(
    db,
    `messages/${conversationId}`
  );

  const newMessageRef = push(messagesRef);
  const messageId = newMessageRef.key ?? "";

  /*
   * IMPORTANTE: usamos serverTimestamp() aqui, não
   * Date.now(). Date.now() usa o relógio do próprio
   * aparelho — se o celular e o computador estiverem com
   * horários dessincronizados (bem comum), as mensagens
   * de cada dispositivo acabam "empilhadas" na ordenação
   * em vez de intercaladas na ordem real de envio.
   * serverTimestamp() é substituído pelo Firebase pelo
   * horário do servidor no momento da escrita, garantindo
   * uma ordem cronológica real e consistente pros dois
   * lados da conversa.
   */
  await set(newMessageRef, {
    id: messageId,
    conversationId,
    senderId,
    receiverId,
    text,
    createdAt: serverTimestamp(),
  });

  return {
    id: messageId,
    conversationId,
    senderId,
    receiverId,
    text,
    createdAt: Date.now(),
  };
};

export const listenToMessages = (
  conversationId: string,
  callback: (messages: ChatMessage[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  const messagesRef = ref(
    db,
    `messages/${conversationId}`
  );

  // IMPORTANTE: passamos um callback de erro pro `onValue`.
  // Sem ele, se o Realtime Database recusar a leitura (ex.:
  // regras de segurança sem permissão para o path
  // `messages/{conversationId}`), a escuta falha em SILÊNCIO —
  // o callback de sucesso simplesmente nunca é chamado de
  // novo, as mensagens não aparecem/atualizam, e nenhum erro
  // chega à tela.
  const unsubscribe = onValue(
    messagesRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      const data = snapshot.val() as Record<
        string,
        ChatMessage
      >;

      const messages = Object.values(data).sort(
        (a, b) => a.createdAt - b.createdAt
      );

      callback(messages);
    },
    (error) => {
      console.error(
        "Erro ao escutar mensagens (verifique as regras do Realtime Database em `messages`):",
        error
      );

      onError?.(error as unknown as Error);
    }
  );

  return unsubscribe;
};