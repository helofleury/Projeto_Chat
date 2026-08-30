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

/**
 * Abre (ou cria) a conversa 1 para 1 com o `partner` já
 * escolhido na tela de Contatos e escuta as mensagens dessa
 * conversa em tempo real.
 *
 * Diferente da versão antiga, este hook não decide sozinho
 * quem é o parceiro — quem decide é o usuário, na tela de
 * Contatos. Isso mantém a regra de "chat exclusivamente 1
 * para 1" (a conversa sempre tem exatamente dois
 * participantes), mas sem pareamento automático.
 */
export const useChat = (
  partner: ChatUser | null
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

  useEffect(() => {
    if (!user || !partner) {
      setConversation(null);
      setMessages([]);
      setLoading(false);
      return undefined;
    }

    // Evita atualizar o estado depois que o efeito já foi
    // "desmontado" (ex.: usuário voltou pra lista de
    // contatos ou deslogou no meio do processo).
    let cancelled = false;

    let stopMessagesListener:
      | (() => void)
      | undefined;

    const start = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        setMessages([]);

        const currentConversation =
          await getOrCreateConversation(
            user.uid,
            partner.uid
          );

        if (cancelled) {
          return;
        }

        setConversation(currentConversation);

        stopMessagesListener = listenToMessages(
          currentConversation.id,
          (newMessages) => {
            if (!cancelled) {
              setMessages(newMessages);
            }
          },
          (listenError) => {
            if (!cancelled) {
              setError(
                "Não foi possível sincronizar as mensagens em tempo real. Verifique as regras do Realtime Database (leitura/escrita em \"messages\")."
              );
            }
          }
        );
      } catch (err) {
        console.error(
          "Erro ao carregar conversa:",
          err
        );

        if (!cancelled) {
          setError(
            "Não foi possível carregar a conversa."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void start();

    return () => {
      cancelled = true;
      stopMessagesListener?.();
    };
  }, [user, partner]);

  const send = useCallback(
    async (text: string): Promise<void> => {
      if (
        !user ||
        !partner ||
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
          partner.uid,
          text.trim()
        );
      } catch (error) {
        console.error(
          "Erro ao enviar mensagem:",
          error
        );

        setError(
          "Não foi possível enviar a mensagem."
        );

        throw error;
      } finally {
        setSending(false);
      }
    },
    [
      user,
      partner,
      conversation,
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