import {
  useCallback,
  useEffect,
  useState,
  type FC,
} from "react";

import {
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

import UserItem from "../components/UserItem";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

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
  const [loggingOut, setLoggingOut] =
    useState<boolean>(false);

  const loadUsers = useCallback(
    async (): Promise<void> => {
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

        const compatibleUsers =
          await getCompatibleUsers(currentUser);

        setUsers(compatibleUsers);
      } catch {
        setError(
          "Não foi possível carregar os usuários."
        );
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handleLogout = async (): Promise<void> => {
    try {
      setLoggingOut(true);
      setError(null);

      await onLogout();
    } catch {
      setError(
        "Não foi possível realizar o logout."
      );
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <Loading message="Carregando usuários..." />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
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
          style={styles.logoutButton}
        >
          {loggingOut ? (
            <Loading message="" />
          ) : (
            <Text style={styles.logout}>
              Sair
            </Text>
          )}
        </Pressable>
      </View>

      {error && (
        <View style={styles.errorWrapper}>
          <ErrorMessage message={error} />

          <Pressable onPress={loadUsers}>
            <Text style={styles.retry}>
              Tentar novamente
            </Text>
          </Pressable>
        </View>
      )}

      {!error && (
        <FlatList
          data={users}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => (
            <UserItem
              user={item}
              onPress={onSelectUser}
            />
          )}
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

  headerInfo: {
    flex: 1,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
  },

  subtitle: {
    marginTop: 4,
    color: "#666666",
  },

  logoutButton: {
    minWidth: 45,
    minHeight: 35,
    justifyContent: "center",
    alignItems: "center",
  },

  logout: {
    fontSize: 15,
    fontWeight: "600",
  },

  list: {
    paddingHorizontal: 24,
  },

  emptyList: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
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

  errorWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  retry: {
    marginTop: 6,
    fontWeight: "600",
  },
});