import {
  get,
  ref,
  set,
} from "firebase/database";

import { db } from "./firebase";

import type {
  AuthProvider,
  ChatUser,
} from "../types/user";

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

export const getCompatibleUsers = async (
  currentUser: ChatUser
): Promise<ChatUser[]> => {
  const users = await getUsers();

  return users.filter((user) => {
    if (user.uid === currentUser.uid) {
      return false;
    }

    if (currentUser.provider === "password") {
      return (
        user.provider === "google" ||
        user.provider === "password"
      );
    }

    return user.provider === "password";
  });
};