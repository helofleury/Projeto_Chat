import {
  get,
  onValue,
  ref,
  set,
} from "firebase/database";

import { db } from "./firebase";

import type { ChatUser } from "../types/user";

export const createUser = async (
  user: ChatUser
): Promise<void> => {
  const userRef = ref(db, `users/${user.uid}`);

  await set(userRef, user);
};

export const getUserById = async (
  uid: string
): Promise<ChatUser | null> => {
  const userRef = ref(db, `users/${uid}`);
  const snapshot = await get(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.val() as ChatUser;
};

export const getUsers = async (): Promise<ChatUser[]> => {
  const usersRef = ref(db, "users");
  const snapshot = await get(usersRef);

  if (!snapshot.exists()) {
    return [];
  }

  const data = snapshot.val() as Record<string, ChatUser>;

  return Object.values(data);
};

/**
 * Escuta em tempo real a lista completa de usuários em
 * `users`. Usado pela tela de Contatos: assim que uma nova
 * pessoa se cadastra/loga, ela aparece na lista sozinha, sem
 * precisar recarregar o app.
 */
export const listenToUsers = (
  callback: (users: ChatUser[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  const usersRef = ref(db, "users");

  const unsubscribe = onValue(
    usersRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      const data = snapshot.val() as Record<string, ChatUser>;

      callback(Object.values(data));
    },
    (error) => {
      console.error(
        "Erro ao escutar usuários (verifique as regras do Realtime Database em `users`):",
        error
      );

      onError?.(error as unknown as Error);
    }
  );

  return unsubscribe;
};

/**
 * Quem é "compatível" pra aparecer na tela de Contatos do
 * usuário atual.
 *
 * Regra do projeto: o e-mail/senha é sempre um dos dois lados
 * da conversa. Google e Apple só conversam com quem logou por
 * e-mail/senha — nunca entre si (Google ↔ Apple não é
 * permitido) e nunca com o mesmo provider (nem e-mail↔e-mail,
 * nem Google↔Google, nem Apple↔Apple). Isso também garante,
 * por consequência, que o usuário nunca vê a si mesmo na
 * lista.
 */
export const filterCompatibleUsers = (
  users: ChatUser[],
  currentUser: ChatUser
): ChatUser[] => {
  return users.filter((user) => {
    if (user.uid === currentUser.uid) {
      return false;
    }

    if (user.provider === currentUser.provider) {
      return false;
    }

    return (
      currentUser.provider === "password" ||
      user.provider === "password"
    );
  });
};

/**
 * Versão "uma vez só" (sem listener) de `filterCompatibleUsers`,
 * útil fora de componentes React (ex.: scripts, testes).
 */
export const getCompatibleUsers = async (
  currentUser: ChatUser
): Promise<ChatUser[]> => {
  const users = await getUsers();

  return filterCompatibleUsers(users, currentUser);
};