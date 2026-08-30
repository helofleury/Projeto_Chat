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
import UsersScreen from "./src/screens/UsersScreen";

import { logout } from "./src/services/authService";
import type { ChatUser } from "./src/types/user";

const AppContent = () => {
  const { user, loading } = useAuth();
  const [showRegister, setShowRegister] = useState<boolean>(false);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    if (showRegister) {
      return (
        <RegisterScreen
          onBackToLogin={() => setShowRegister(false)}
        />
      );
    }

    return (
      <LoginScreen
        onRegister={() => setShowRegister(true)}
      />
    );
  }

  const handleSelectUser = (selectedUser: ChatUser): void => {
    console.log("Usuário selecionado:", selectedUser);
  };

  const handleLogout = async (): Promise<void> => {
    await logout();
  };

  return (
    <UsersScreen
      onSelectUser={handleSelectUser}
      onLogout={handleLogout}
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