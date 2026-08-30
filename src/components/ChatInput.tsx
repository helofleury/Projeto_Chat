import { useState, type FC } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type ChatInputProps = {
  onSend: (text: string) => Promise<void>;
  sending: boolean;
};

const ChatInput: FC<ChatInputProps> = ({
  onSend,
  sending,
}) => {
  const [text, setText] = useState<string>("");

  const handleSend = async (): Promise<void> => {
    const message = text.trim();

    if (!message || sending) {
      return;
    }

    try {
      await onSend(message);
      setText("");
    } catch {
      // O erro já é tratado pelo useChat.
    }
  };

  return (
    <View style={styles.container}>
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
        onPress={handleSend}
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
  );
};

export default ChatInput;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    backgroundColor: "#FFFFFF",
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
});