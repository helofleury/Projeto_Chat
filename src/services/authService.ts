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

/**
 * Grava (ou atualiza) o registro do usuário em `users/{uid}`
 * sem deixar uma falha nessa escrita ser confundida com uma
 * falha de autenticação.
 *
 * IMPORTANTE: nesse ponto o Firebase Auth já validou as
 * credenciais com sucesso. Se essa gravação falhar (ex.: as
 * regras de segurança do Realtime Database ainda não
 * permitem escrita para o usuário autenticado), o app NÃO
 * deve reportar isso como "e-mail ou senha inválidos" — é um
 * problema diferente (sincronização com o banco), então só
 * avisamos no console em vez de derrubar o login/cadastro.
 */
const syncUserRecord = async (
  user: Parameters<typeof createUser>[0]
): Promise<void> => {
  try {
    await createUser(user);
  } catch (dbError) {
    console.warn(
      "Login/cadastro autenticado com sucesso, mas não foi " +
        "possível sincronizar o usuário no Realtime Database. " +
        "Verifique as regras de segurança do banco.",
      dbError
    );
  }
};

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

  await syncUserRecord({
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
  await syncUserRecord({
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

  await syncUserRecord({
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

  await syncUserRecord({
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

/**
 * Traduz um erro (do Firebase Auth ou de qualquer outra
 * etapa do fluxo de login/cadastro) para uma mensagem
 * compreensível em português.
 *
 * Propositalmente NÃO existe um "catch-all" genérico do tipo
 * "e-mail ou senha inválidos" pra qualquer erro não mapeado:
 * isso é exatamente o que fazia credenciais corretas
 * parecerem inválidas quando o problema era outro (rede,
 * permissão do banco etc.). Erros não mapeados mostram a
 * mensagem original, que ajuda a diagnosticar a causa real.
 */
export const getAuthErrorMessage = (
  error: unknown
): string => {
  const code = (error as { code?: string } | null)?.code;

  switch (code) {
    case "auth/invalid-email":
      return "O e-mail informado não é válido.";

    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
      return "E-mail ou senha inválidos.";

    case "auth/email-already-in-use":
      return "Já existe uma conta cadastrada com esse e-mail. Tente entrar em vez de cadastrar.";

    case "auth/weak-password":
      return "A senha deve possuir pelo menos 6 caracteres.";

    case "auth/too-many-requests":
      return "Muitas tentativas seguidas. Aguarde alguns instantes e tente novamente.";

    case "auth/network-request-failed":
      return "Falha de conexão com o Firebase. Verifique sua internet e tente novamente.";

    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "O login foi cancelado.";

    case "auth/operation-not-allowed":
      return "Esse provedor de login não está ativado no Firebase deste projeto.";

    default:
      if (error instanceof Error && error.message) {
        return error.message;
      }

      return "Não foi possível concluir a operação. Tente novamente.";
  }
};