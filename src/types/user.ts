export type AuthProvider = 'password' | 'google' | 'apple';

export type ChatUser = {
  uid: string;
  name: string;
  email: string | null;
  provider: AuthProvider;
  /**
   * Uid do parceiro de conversa travado (ver
   * `userService.getChatPartner`). Ausente enquanto o
   * pareamento ainda não foi feito.
   */
  partnerUid?: string;
};