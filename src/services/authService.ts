import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCredential,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  OAuthProvider,
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

  // Garante (self-heal) que o registro em `users/{uid}`
  // existe. Sem isso, se por qualquer motivo o registro
  // não foi salvo no cadastro (ex.: falha de rede logo
  // após criar a conta), essa pessoa nunca aparece como
  // parceiro de conversa para o outro usuário.
  await createUser({
    uid: credential.user.uid,
    name:
      credential.user.displayName ??
      "Usuário",
    email: credential.user.email,
    provider: "password",
  });

  return credential.user;
};

export const loginWithGoogle = async (
  idToken: string
): Promise<User> => {
  if (!idToken) {
    throw new Error(
      "Google ID token não foi informado."
    );
  }

  const credential =
    GoogleAuthProvider.credential(idToken);

  const result =
    await signInWithCredential(
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

export const loginWithApple = async (
  identityToken: string,
  rawNonce: string,
  fullName?: string | null
): Promise<User> => {
  if (!identityToken) {
    throw new Error(
      "Apple identity token não foi informado."
    );
  }

  const provider = new OAuthProvider("apple.com");

  const credential = provider.credential({
    idToken: identityToken,
    rawNonce,
  });

  const result =
    await signInWithCredential(
      auth,
      credential
    );

  /*
   * IMPORTANTE: a Apple só envia o nome completo (fullName) no
   * PRIMEIRO login que a pessoa faz no app — nos logins
   * seguintes esse campo vem null, mesmo que a pessoa tenha
   * autorizado o compartilhamento antes. Por isso, gravamos o
   * nome no perfil do Firebase assim que ele aparece pela
   * primeira vez, pra não perdê-lo depois.
   */
  if (fullName && !result.user.displayName) {
    await updateProfile(result.user, {
      displayName: fullName,
    });
  }

  await createUser({
    uid: result.user.uid,
    name:
      fullName ??
      result.user.displayName ??
      "Usuário Apple",
    email: result.user.email,
    provider: "apple",
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

  if (providerId === "apple.com") {
    return "apple";
  }

  return "password";
};