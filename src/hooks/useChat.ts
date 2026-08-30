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

import {
  getChatPartner,
  getUserById,
  listenToUserRecord,
} from "../services/userService";

import { getAuthProvider } from "../services/authService";

import type {
  ChatMessage,
  Conversation,
} from "../types/chat";

import type { ChatUser } from "../types/user";

type UseChatReturn = {
  conversation: Conversation | null;
  messages: ChatMessage[];
  partner: ChatUser | null;
  loading: boolean;
  sending: boolean;
  error: string | null;
  send: (text: string) => Promise<void>;
};

export const useChat = (): UseChatReturn => {
  const { user } = useAuth();

  const [conversation, setConversation] =
    useState<Conversation | null>(null);

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [partner, setPartner] =
    useState<ChatUser | null>(null);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [sending, setSending] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return undefined;
    }

    // Evita atualizar o estado depois que o efeito já foi
    // "desmontado" (ex.: usuário deslogou no meio do processo).
    let cancelled = false;

    let stopMessagesListener:
      | (() => void)
      | undefined;

    let stopUserListener:
      | (() => void)
      | undefined;

    /*
     * Cria/entra na conversa com o parceiro já encontrado e
     * passa a escutar as mensagens em tempo real.
     */
    const openConversationWith = async (
      chatPartner: ChatUser
    ): Promise<void> => {
      const currentConversation =
        await getOrCreateConversation(
          user.uid,
          chatPartner.uid
        );

      if (cancelled) {
        return;
      }

      setPartner(chatPartner);
      setConversation(currentConversation);

      stopMessagesListener = listenToMessages(
        currentConversation.id,
        (newMessages) => {
          if (!cancelled) {
            setMessages(newMessages);
          }
        }
      );
    };

    const start = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        // Garante que o registro do usuário atual em
        // `users/{uid}` existe (fica faltando, por
        // exemplo, se o login for feito em outro
        // dispositivo antes de qualquer sincronização).
        let currentChatUser =
          await getUserById(user.uid);

        if (!currentChatUser) {
          currentChatUser = {
            uid: user.uid,
            name:
              user.displayName ?? "Usuário",
            email: user.email,
            provider: getAuthProvider(user),
          };
        }

        // Descobre dinamicamente quem é o outro
        // participante (não é um UID fixo: pode ser
        // qualquer pessoa logada com o provider
        // compatível).
        const chatPartner =
          await getChatPartner(currentChatUser);

        if (cancelled) {
          return;
        }

        if (chatPartner) {
          await openConversationWith(chatPartner);
          return;
        }

        /*
         * Ainda não há ninguém compatível cadastrado (ex.: a
         * outra pessoa não fez login ainda). Em vez de desistir,
         * fica escutando o PRÓPRIO registro em tempo real: assim
         * que a outra pessoa logar, o pareamento é travado do
         * lado dela (ver `getChatPartner`/`pairUsers`), o que
         * grava `partnerUid` aqui também — e esse listener
         * dispara sozinho, sem precisar sair e entrar de novo
         * no app.
         */
        setPartner(null);
        setConversation(null);
        setMessages([]);

        stopUserListener = listenToUserRecord(
          user.uid,
          (updatedUser) => {
            if (
              cancelled ||
              !updatedUser?.partnerUid
            ) {
              return;
            }

            // Já achamos o parceiro: não precisa mais
            // escutar essa mudança específica.
            stopUserListener?.();
            stopUserListener = undefined;

            void getUserById(
              updatedUser.partnerUid as string
            ).then((foundPartner) => {
              if (foundPartner && !cancelled) {
                void openConversationWith(
                  foundPartner
                );
              }
            });
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
      stopUserListener?.();
    };
  }, [user]);

  const send = useCallback(
    async (text: string): Promise<void> => {
      if (
        !user ||
        !conversation ||
        !partner ||
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
      conversation,
      partner,
      sending,
    ]
  );

  return {
    conversation,
    messages,
    partner,
    loading,
    sending,
    error,
    send,
  };
};