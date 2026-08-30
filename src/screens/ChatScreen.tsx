import type { FC } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "../hooks/useAuth";
import { useChat } from "../hooks/useChat";

import ChatInput from "../components/ChatInput";
import ChatMessage from "../components/ChatMessage";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";

import type { ChatUser } from "../types/user";

type ChatScreenProps = {
  selectedUser: ChatUser;
  onBack: () => void;
};

const ChatScreen: FC<ChatScreenProps> = ({
  selectedUser,
  onBack,
}) => {
  const { user } = useAuth();

  const {
    messages,
    loading,
    sending,
    error,
    send,
  } = useChat(selectedUser);

  if (loading) {
    return <Loading message="Carregando conversa..." />;
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <ErrorMessage message="Usuário não autenticado." />

        <Pressable
          style={styles.backButton}
          onPress={onBack}
        >
          <Text style={styles.backButtonText}>
            Voltar
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
      keyboardVerticalOffset={
        Platform.OS === "ios" ? 90 : 0
      }
    >
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View style={styles.headerInfo}>
          <Text style={styles.title}>
            {selectedUser.name}
          </Text>

          <Text style={styles.provider}>
            {selectedUser.provider === "password"
              ? "E-mail e senha"
              : selectedUser.provider === "google"
                ? "Google"
                : "Apple"}
          </Text>
        </View>
      </View>

      {error && (
        <ErrorMessage message={error} />
      )}

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatMessage
            message={item}
            currentUserId={user.uid}
          />
        )}
        contentContainerStyle={
          messages.length === 0
            ? styles.emptyMessages
            : styles.messagesList
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              Nenhuma mensagem ainda
            </Text>

            <Text style={styles.emptyText}>
              Envie uma mensagem para começar a
              conversa.
            </Text>
          </View>
        }
      />

      <ChatInput
        onSend={send}
        sending={sending}
      />
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  header: {
    height: 90,
    paddingTop: 35,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },

  backButton: {
    padding: 8,
  },

  backText: {
    fontSize: 34,
    lineHeight: 34,
  },

  headerInfo: {
    marginLeft: 8,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
  },

  provider: {
    marginTop: 3,
    fontSize: 13,
    color: "#666666",
  },

  messagesList: {
    padding: 16,
    paddingBottom: 12,
  },

  emptyMessages: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
  },

  emptyContainer: {
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
  },

  emptyText: {
    marginTop: 8,
    color: "#666666",
    textAlign: "center",
  },

  backButtonText: {
    fontWeight: "600",
  },
});