import type { AuthProvider, ChatUser } from "../types/user";

const PROVIDER_LABELS: Record<AuthProvider, string> = {
  password: "E-mail e senha",
  google: "Google",
  apple: "Apple",
};

export const getProviderLabel = (
  provider: AuthProvider
): string => {
  return PROVIDER_LABELS[provider] ?? provider;
};

const ALLOWED_PROVIDERS = [
  "password",
  "google",
  "apple",
] as const;

export const isValidChatUser = (
  user: ChatUser
): boolean => {
  return (
    Boolean(user.uid) &&
    Boolean(user.name) &&
    ALLOWED_PROVIDERS.includes(user.provider)
  );
};

export const canStartConversation = (
  currentUser: ChatUser,
  selectedUser: ChatUser
): boolean => {
  if (!isValidChatUser(currentUser)) {
    return false;
  }

  if (!isValidChatUser(selectedUser)) {
    return false;
  }

  if (currentUser.uid === selectedUser.uid) {
    return false;
  }

  return true;
};

export const canSendMessage = (
  text: string
): boolean => {
  const message = text.trim();

  if (!message) {
    return false;
  }

  if (message.length > 500) {
    return false;
  }

  return true;
};