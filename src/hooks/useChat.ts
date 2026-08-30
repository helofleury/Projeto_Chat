import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useAuth } from "./useAuth";

import {
  getOrCreateConversation,
  listenToMessages,
  sendMessage,
} from "../services/chatService";

import type {
  ChatMessage,
  Conversation,
} from "../types/chat";

import type { ChatUser } from "../types/user";

type UseChatReturn = {
  conversation: Conversation | null;
  messages: ChatMessage[];
  loading: boolean;
  sending: boolean;
  error: string | null;
  send: (text: string) => Promise<void>;
};

export const useChat = (
  selectedUser: ChatUser
): UseChatReturn => {
  const { user } = useAuth();

  const [conversation, setConversation] =
    useState<Conversation | null>(null);

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [sending, setSending] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string | null>(null);

  const loadConversation = useCallback(
    async (): Promise<(() => void) | undefined> => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const currentConversation =
          await getOrCreateConversation(
            user.uid,
            selectedUser.uid
          );

        setConversation(currentConversation);

        const unsubscribe = listenToMessages(
          currentConversation.id,
          (newMessages) => {
            setMessages(newMessages);
          }
        );

        return unsubscribe;
      } catch {
        setError(
          "Não foi possível carregar a conversa."
        );
      } finally {
        setLoading(false);
      }
    },
    [user, selectedUser.uid]
  );

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const startConversation = async (): Promise<void> => {
      unsubscribe = await loadConversation();
    };

    void startConversation();

    return () => {
      unsubscribe?.();
    };
  }, [loadConversation]);

  const send = useCallback(
    async (text: string): Promise<void> => {
      if (
        !user ||
        !conversation ||
        !text.trim() ||
        sending
      ) {
        return;
      }

      try {
        setSending(true);
        setError(null);

        await sendMessage(
          conversation.id,
          user.uid,
          selectedUser.uid,
          text.trim()
        );
      } catch {
        setError(
          "Não foi possível enviar a mensagem."
        );
        throw new Error(
          "Não foi possível enviar a mensagem."
        );
      } finally {
        setSending(false);
      }
    },
    [
      user,
      conversation,
      selectedUser.uid,
      sending,
    ]
  );

  return {
    conversation,
    messages,
    loading,
    sending,
    error,
    send,
  };
};