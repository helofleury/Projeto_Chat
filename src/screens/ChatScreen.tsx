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

type ChatScreenProps = {
  onBack: () => void;
};

const ChatScreen: FC<ChatScreenProps> = ({ onBack }) => {
  const { user } = useAuth();

  const {
    conversation,
    messages,
    partner,
    loading,
    sending,
    error,
    send,
  } = useChat();

  if (!user) {
    return (
      <View style={styles.center}>
        <View style={styles.emptyIcon}>
          <Text style={styles.emptyIconText}>!</Text>
        </View>

        <ErrorMessage message="Usuário não autenticado." />

        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  if (loading) {
    return <Loading message="Carregando conversa..." />;
  }

  if (!conversation || !partner) {
    return (
      <View style={styles.center}>
        <View style={styles.emptyIcon}>
          <Text style={styles.emptyIconText}>💬</Text>
        </View>

        <Text style={styles.emptyTitle}>
          Aguardando conexão
        </Text>

        <Text style={styles.emptyText}>
          Ainda não encontramos alguém compatível
          para conversar com você.
        </Text>

        <Text style={styles.emptySubtext}>
          Peça para a outra pessoa entrar no app
          e volte aqui em seguida.
        </Text>

        <Pressable style={styles.primaryButton} onPress={onBack}>
          <Text style={styles.primaryButtonText}>
            Voltar
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          style={styles.backIconButton}
        >
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {partner.name?.charAt(0)?.toUpperCase() || "?"}
          </Text>
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.title} numberOfLines={1}>
            {partner.name}
          </Text>

          <View style={styles.statusContainer}>
            <View style={styles.onlineDot} />

            <Text style={styles.provider}>
              Online
            </Text>
          </View>
        </View>

        <Pressable
          onPress={onBack}
          style={styles.menuButton}
        >
          <Text style={styles.menuText}>•••</Text>
        </Pressable>
      </View>

      {/* ERROR */}
      {error && (
        <View style={styles.errorContainer}>
          <ErrorMessage message={error} />
        </View>
      )}

      {/* MESSAGES */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatMessage
            message={item}
            currentUserId={user.uid}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          messages.length === 0
            ? styles.emptyMessages
            : styles.messagesList
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.chatIcon}>
              <Text style={styles.chatIconText}>💬</Text>
            </View>

            <Text style={styles.emptyMessageTitle}>
              Comece a conversa
            </Text>

            <Text style={styles.emptyMessageText}>
              Envie uma mensagem para começar
              a conversar com {partner.name}.
            </Text>
          </View>
        }
      />

      {/* INPUT */}
      <View style={styles.inputContainer}>
        <ChatInput
          onSend={send}
          sending={sending}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    backgroundColor: "#F7F8FA",
  },

  /* HEADER */

  header: {
    height: 92,
    paddingTop: 30,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#ECEEF2",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },

  backIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },

  backIcon: {
    fontSize: 36,
    fontWeight: "300",
    color: "#1F2937",
    marginTop: -4,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#6C63FF",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  headerInfo: {
    flex: 1,
    marginLeft: 11,
  },

  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#171923",
  },

  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#22C55E",
    marginRight: 5,
  },

  provider: {
    fontSize: 12,
    color: "#6B7280",
  },

  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  menuText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 1,
  },

  /* MESSAGES */

  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
  },

  emptyMessages: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  chatIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#EDEBFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  chatIconText: {
    fontSize: 28,
  },

  emptyMessageTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#171923",
  },

  emptyMessageText: {
    marginTop: 8,
    color: "#737783",
    textAlign: "center",
    lineHeight: 21,
    fontSize: 14,
    maxWidth: 280,
  },

  /* INPUT */

  inputContainer: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#ECEEF2",
    paddingTop: 6,
  },

  /* ERROR */

  errorContainer: {
    paddingHorizontal: 14,
    paddingTop: 8,
  },

  /* EMPTY STATE */

  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#EDEBFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  emptyIconText: {
    fontSize: 30,
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#171923",
    textAlign: "center",
  },

  emptyText: {
    marginTop: 12,
    color: "#5F636D",
    textAlign: "center",
    lineHeight: 22,
    fontSize: 14,
    maxWidth: 320,
  },

  emptySubtext: {
    marginTop: 6,
    color: "#8A8E98",
    textAlign: "center",
    lineHeight: 20,
    fontSize: 13,
    maxWidth: 300,
  },

  /* BUTTON */

  primaryButton: {
    marginTop: 26,
    backgroundColor: "#6C63FF",
    paddingHorizontal: 32,
    paddingVertical: 13,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#6C63FF",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  backButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  backButtonText: {
    color: "#6C63FF",
    fontSize: 15,
    fontWeight: "600",
  },
});
