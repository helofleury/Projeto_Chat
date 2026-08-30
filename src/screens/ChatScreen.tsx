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

const ChatScreen: FC<ChatScreenProps> = ({
  onBack,
}) => {
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
        <ErrorMessage
          message="Usuário não autenticado."
        />

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

  if (loading) {
    return (
      <Loading
        message="Carregando conversa..."
      />
    );
  }

  if (!conversation || !partner) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>
          Aguardando a outra pessoa
        </Text>

        <Text style={styles.emptyText}>
          Ainda não há ninguém compatível
          cadastrado para conversar com você.
          Peça para a outra pessoa entrar no
          app (com Google ou e-mail/senha) e
          volte aqui em seguida.
        </Text>

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
          : "height"
      }
      keyboardVerticalOffset={
        Platform.OS === "ios" ? 90 : 0
      }
    >
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>
            {partner.name}
          </Text>

          <Text style={styles.provider}>
            {partner.provider === "google"
              ? "Conta Google"
              : "Conta e-mail/senha"}
          </Text>
        </View>

        <Pressable
          onPress={onBack}
          style={styles.logoutButton}
        >
          <Text style={styles.logoutText}>
            Sair
          </Text>
        </Pressable>
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
              Envie uma mensagem para começar
              a conversa.
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
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
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

  logoutButton: {
    padding: 8,
  },

  logoutText: {
    fontSize: 14,
    fontWeight: "600",
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

  backButton: {
    padding: 8,
  },

  backButtonText: {
    fontWeight: "600",
  },
});