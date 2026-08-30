import { useEffect, useState } from "react";

import { useAuth } from "./useAuth";

import { getAuthProvider } from "../services/authService";

import {
  filterCompatibleUsers,
  listenToUsers,
} from "../services/userService";

import type { ChatUser } from "../types/user";

type UseUsersReturn = {
  users: ChatUser[];
  loading: boolean;
  error: string | null;
};

/**
 * Lista, em tempo real, os usuários compatíveis pra iniciar
 * uma conversa com o usuário atual (usado pela tela de
 * Contatos). Assim que alguém novo se cadastra/loga, aparece
 * na lista sozinho — sem precisar atualizar a tela.
 */
export const useUsers = (): UseUsersReturn => {
  const { user } = useAuth();

  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setUsers([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError(null);

    const currentChatUser: ChatUser = {
      uid: user.uid,
      name: user.displayName ?? "Usuário",
      email: user.email,
      provider: getAuthProvider(user),
    };

    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = listenToUsers(
        (allUsers) => {
          setUsers(
            filterCompatibleUsers(
              allUsers,
              currentChatUser
            )
          );
          setLoading(false);
        },
        (listenError) => {
          setError(
            "Não foi possível sincronizar a lista de usuários. Verifique as regras do Realtime Database (leitura/escrita em \"users\")."
          );
          setLoading(false);
        }
      );
    } catch (err) {
      console.error(
        "Erro ao carregar usuários:",
        err
      );

      setError(
        "Não foi possível carregar a lista de usuários."
      );

      setLoading(false);
    }

    return () => {
      unsubscribe?.();
    };
  }, [user]);

  return { users, loading, error };
};