import { useCallback, useEffect, useState, type FC } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "../hooks/useAuth";
import {
  getCompatibleUsers,
  getUserById,
} from "../services/userService";

import type { ChatUser } from "../types/user";

type UsersScreenProps = {
  onSelectUser: (user: ChatUser) => void;
  onLogout: () => Promise<void>;
};

const UsersScreen: FC<UsersScreenProps> = ({
  onSelectUser,
  onLogout,
}) => {
  const { user } = useAuth();

  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState<boolean>(false);

  const loadUsers = useCallback(async (): Promise<void> => {
    if (!user) {
      setUsers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const currentUser = await getUserById(user.uid);

      if (!currentUser) {
        setError(
          "Não foi possível encontrar os dados do seu usuário."
        );
        return;
      }

      const compatibleUsers = await getCompatibleUsers(
        currentUser
      );

      setUsers(compatibleUsers);
    } catch {
      setError(
        "Não foi possível carregar os usuários."
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handleLogout = async (): Promise<void> => {
    try {
      setLoggingOut(true);
      await onLogout();
    } catch {
      setError("Não foi possível realizar o logout.");
    } finally {
      setLoggingOut(false);
    }
  };

  const renderUser = ({
    item,
  }: {
    item: ChatUser;
  }) => {
    const providerName =
      item.provider === "password"
        ? "E-mail e senha"
        : item.provider === "google"
          ? "Google"
          : "Apple";

    return (
      <Pressable
        style={styles.userItem}
        onPress={() => onSelectUser(item)}
      >
        <View>
          <Text style={styles.userName}>
            {item.name}
          </Text>

          <Text style={styles.provider}>
            {providerName}
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Carregando usuários...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Conversas
          </Text>

          <Text style={styles.subtitle}>
            Pessoas disponíveis para conversar
          </Text>
        </View>

        <Pressable
          onPress={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.logout}>
              Sair
            </Text>
          )}
        </Pressable>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error}
          </Text>

          <Pressable onPress={loadUsers}>
            <Text style={styles.retry}>
              Tentar novamente
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.uid}
          renderItem={renderUser}
          contentContainerStyle={
            users.length === 0
              ? styles.emptyList
              : styles.list
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>
                Nenhum contato disponível
              </Text>

              <Text style={styles.emptyText}>
                No momento não existem usuários
                compatíveis para conversar.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default UsersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 60,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 24,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
  },

  subtitle: {
    marginTop: 4,
    color: "#666666",
  },

  logout: {
    fontSize: 15,
    fontWeight: "600",
  },

  list: {
    paddingHorizontal: 24,
  },

  userItem: {
    minHeight: 72,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  userName: {
    fontSize: 17,
    fontWeight: "600",
  },

  provider: {
    marginTop: 5,
    fontSize: 14,
    color: "#666666",
  },

  arrow: {
    fontSize: 28,
    color: "#777777",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#666666",
  },

  emptyList: {
    flexGrow: 1,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },

  emptyText: {
    marginTop: 8,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },

  errorText: {
    textAlign: "center",
    fontSize: 16,
  },

  retry: {
    marginTop: 16,
    fontWeight: "600",
  },
});