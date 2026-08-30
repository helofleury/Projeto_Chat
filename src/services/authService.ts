import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCredential,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  User,
} from "firebase/auth";

import { auth } from "./firebase";
import { createUser } from "./userService";

import type { AuthProvider } from "../types/user";

export const registerWithEmail = async (
  name: string,
  email: string,
  password: string
): Promise<User> => {
  const credential =
    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

  await updateProfile(credential.user, {
    displayName: name,
  });

  await createUser({
    uid: credential.user.uid,
    name,
    email: credential.user.email,
    provider: "password",
  });

  return credential.user;
};

export const loginWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  const credential =
    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

  return credential.user;
};

export const loginWithGoogle = async (
  idToken: string
): Promise<User> => {
  const credential =
    GoogleAuthProvider.credential(idToken);

  const result = await signInWithCredential(
    auth,
    credential
  );

  await createUser({
    uid: result.user.uid,
    name:
      result.user.displayName ??
      "Usuário Google",
    email: result.user.email,
    provider: "google",
  });

  return result.user;
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
};

export const getAuthProvider = (
  user: User
): AuthProvider => {
  const providerId =
    user.providerData[0]?.providerId;

  if (providerId === "google.com") {
    return "google";
  }

  return "password";
};