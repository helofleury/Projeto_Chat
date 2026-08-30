import type { ChatUser } from "../types/user";

const ALLOWED_PROVIDERS = [
  "password",
  "google",
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