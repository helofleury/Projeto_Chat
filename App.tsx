import { useState } from "react";

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import { AuthProvider } from "./src/contexts/AuthContext";
import { useAuth } from "./src/hooks/useAuth";

import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import ContactsScreen from "./src/screens/ContactsScreen";
import ChatScreen from "./src/screens/ChatScreen";

import type { ChatUser } from "./src/types/user";

const AppContent = () => {
  const { user, loading } = useAuth();

  const [showRegister, setShowRegister] =
    useState<boolean>(false);

  const [selectedPartner, setSelectedPartner] =
    useState<ChatUser | null>(null);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    // Ao deslogar, garante que a próxima vez que alguém
    // logar comece pela lista de contatos, não direto numa
    // conversa antiga que já estava aberta na tela.
    if (selectedPartner) {
      setSelectedPartner(null);
    }

    if (showRegister) {
      return (
        <RegisterScreen
          onBackToLogin={() =>
            setShowRegister(false)
          }
        />
      );
    }

    return (
      <LoginScreen
        onRegister={() =>
          setShowRegister(true)
        }
      />
    );
  }

  /*
   * Usuário autenticado, mas ainda não escolheu com quem
   * conversar: mostra a lista de contatos compatíveis.
   */
  if (!selectedPartner) {
    return (
      <ContactsScreen
        onSelectUser={setSelectedPartner}
      />
    );
  }

  /*
   * Usuário autenticado e com um parceiro selecionado: abre
   * a conversa 1 para 1 com essa pessoa. "Voltar" aqui
   * apenas retorna para a lista de contatos — o logout de
   * verdade fica na tela de Contatos, pra não sair
   * acidentalmente enquanto conversa.
   */
  return (
    <ChatScreen
      partner={selectedPartner}
      onBack={() => setSelectedPartner(null)}
    />
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});