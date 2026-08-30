import {
  useCallback,
  useEffect,
  useState,
  type FC,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "../hooks/useAuth";

import {
  getOrCreateConversation,
  listenToMessages,
  sendMessage,
} from "../services/chatService";

import type {
  ChatMessage,
  Conversation,
} from "../types/chat";

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

  const [conversation, setConversation] =
    useState<Conversation | null>(null);

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [text, setText] = useState<string>("");

  const [loading, setLoading] =
    useState<boolean>(true);

  const [sending, setSending] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string | null>(null);

  const loadConversation = useCallback(
    async (): Promise<(() => void) | undefined> => {
      if (!user) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const currentConversation =
          await getOrCreateConversation(
            user.uid,
            selectedUser.uid
          );

        setConversation(currentConversation);

        const unsubscribe = listenToMessages(
          currentConversation.id,
          setMessages
        );

        return unsubscribe;
      } catch {
        setError(
          "Não foi possível carregar a conversa."
        );
      } finally {
        setLoading(false);
      }
    },
    [user, selectedUser.uid]
  );

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const startConversation = async (): Promise<void> => {
      unsubscribe = await loadConversation();
    };

    void startConversation();

    return () => {
      unsubscribe?.();
    };
  }, [loadConversation]);

  const handleSendMessage = async (): Promise<void> => {
    if (
      !user ||
      !conversation ||
      !text.trim() ||
      sending
    ) {
      return;
    }

    try {
      setSending(true);

      const messageText = text.trim();

      setText("");

      await sendMessage(
        conversation.id,
        user.uid,
        selectedUser.uid,
        messageText
      );
    } catch {
      setError(
        "Não foi possível enviar a mensagem."
      );
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({
    item,
  }: {
    item: ChatMessage;
  }) => {
    const isMine = item.senderId === user?.uid;

    return (
      <View
        style={[
          styles.messageContainer,
          isMine
            ? styles.myMessageContainer
            : styles.otherMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMine
              ? styles.myMessage
              : styles.otherMessage,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMine && styles.myMessageText,
            ]}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Carregando conversa...
        </Text>
      </View>
    );
  }

  if (error && !conversation) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          {error}
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
          : undefined
      }
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
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
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>
            {error}
          </Text>
        </View>
      )}

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
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

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite uma mensagem..."
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
          editable={!sending}
        />

        <Pressable
          style={[
            styles.sendButton,
            (!text.trim() || sending) &&
              styles.disabledButton,
          ]}
          onPress={handleSendMessage}
          disabled={!text.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.sendText}>
              Enviar
            </Text>
          )}
        </Pressable>
      </View>
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

  loadingText: {
    marginTop: 12,
    color: "#666666",
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

  messageContainer: {
    width: "100%",
    marginBottom: 10,
  },

  myMessageContainer: {
    alignItems: "flex-end",
  },

  otherMessageContainer: {
    alignItems: "flex-start",
  },

  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },

  myMessage: {
    backgroundColor: "#222222",
    borderBottomRightRadius: 4,
  },

  otherMessage: {
    backgroundColor: "#EEEEEE",
    borderBottomLeftRadius: 4,
  },

  messageText: {
    fontSize: 16,
    color: "#222222",
  },

  myMessageText: {
    color: "#FFFFFF",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },

  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },

  sendButton: {
    height: 48,
    paddingHorizontal: 16,
    marginLeft: 8,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#222222",
  },

  disabledButton: {
    opacity: 0.5,
  },

  sendText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  errorText: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 16,
  },

  errorBanner: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F5F5F5",
  },

  errorBannerText: {
    textAlign: "center",
    fontSize: 13,
  },

  backButtonText: {
    fontWeight: "600",
  },
});