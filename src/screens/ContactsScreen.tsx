import type { FC } from "react";

import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "../hooks/useAuth";
import { useUsers } from "../hooks/useUsers";

import { getAuthProvider, logout } from "../services/authService";

import {
  canStartConversation,
  getProviderLabel,
} from "../utils/chatRules";

import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";

import type { ChatUser } from "../types/user";

type ContactsScreenProps = {
  onSelectUser: (user: ChatUser) => void;
};

const ContactsScreen: FC<ContactsScreenProps> = ({
  onSelectUser,
}) => {
  const { user } = useAuth();
  const { users, loading, error } = useUsers();

  if (!user) {
    return null;
  }

  const currentChatUser: ChatUser = {
    uid: user.uid,
    name: user.displayName ?? "Usuário",
    email: user.email,
    provider: getAuthProvider(user),
  };

  const handleLogout = (): void => {
    // IMPORTANTE: `Alert.alert` com botões customizados não
    // funciona de forma confiável em React Native Web (o
    // onPress dos botões pode nunca disparar). Na web,
    // usamos `window.confirm`, que é nativo do navegador; nas
    // plataformas nativas (iOS/Android), usamos o Alert normal.
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Deseja encerrar a sessão?"
      );

      if (confirmed) {
        void logout();
      }

      return;
    }

    Alert.alert(
      "Sair",
      "Deseja encerrar a sessão?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: () => {
            void logout();
          },
        },
      ]
    );
  };

  const handleSelect = (selected: ChatUser): void => {
    // Trava de segurança: além do filtro de compatibilidade
    // já aplicado pela lista, garante em tempo de seleção que
    // o usuário nunca inicia uma conversa consigo mesmo (nem
    // com alguém inválido/incompatível).
    if (!canStartConversation(currentChatUser, selected)) {
      Alert.alert(
        "Não é possível conversar",
        "Este usuário não está disponível para conversa."
      );
      return;
    }

    onSelectUser(selected);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Conversas</Text>
          <Text style={styles.subtitle}>
            {currentChatUser.name}
          </Text>
        </View>

        <Pressable
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Sair</Text>
        </Pressable>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <ErrorMessage message={error} />
        </View>
      )}

      {loading ? (
        <Loading message="Carregando usuários..." />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.uid}
          contentContainerStyle={
            users.length === 0
              ? styles.emptyList
              : styles.list
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.userCard}
              onPress={() => handleSelect(item)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.name?.charAt(0)?.toUpperCase() ||
                    "?"}
                </Text>
              </View>

              <View style={styles.userInfo}>
                <Text
                  style={styles.userName}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>

                <Text style={styles.userProvider}>
                  {getProviderLabel(item.provider)}
                </Text>
              </View>

              <Text style={styles.chevron}>›</Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Text style={styles.emptyIconText}>
                  👥
                </Text>
              </View>

              <Text style={styles.emptyTitle}>
                Nenhum usuário compatível ainda
              </Text>

              <Text style={styles.emptyText}>
                Assim que alguém compatível se cadastrar
                ou entrar no app, essa pessoa aparece
                aqui automaticamente.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default ContactsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#ECEEF2",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#171923",
  },

  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: "#737783",
  },

  logoutButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },

  logoutText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#B00020",
  },

  errorContainer: {
    paddingHorizontal: 14,
    paddingTop: 8,
  },

  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },

  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#6C63FF",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  userInfo: {
    flex: 1,
    marginLeft: 12,
  },

  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#171923",
  },

  userProvider: {
    marginTop: 2,
    fontSize: 13,
    color: "#737783",
  },

  chevron: {
    fontSize: 22,
    color: "#C4C7CE",
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#EDEBFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  emptyIconText: {
    fontSize: 28,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#171923",
    textAlign: "center",
  },

  emptyText: {
    marginTop: 8,
    color: "#737783",
    textAlign: "center",
    lineHeight: 21,
    fontSize: 14,
    maxWidth: 280,
  },
});