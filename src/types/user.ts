export type AuthProvider = 'password' | 'google';

export type ChatUser = {
  uid: string;
  name: string;
  email: string | null;
  provider: AuthProvider;
};