import type { FC } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { ChatMessage as ChatMessageType } from "../types/chat";

type ChatMessageProps = {
  message: ChatMessageType;
  currentUserId: string;
};

const ChatMessage: FC<ChatMessageProps> = ({
  message,
  currentUserId,
}) => {
  const isMine = message.senderId === currentUserId;

  return (
    <View
      style={[
        styles.container,
        isMine
          ? styles.myContainer
          : styles.otherContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isMine
            ? styles.myBubble
            : styles.otherBubble,
        ]}
      >
        <Text
          style={[
            styles.text,
            isMine && styles.myText,
          ]}
        >
          {message.text}
        </Text>
      </View>
    </View>
  );
};

export default ChatMessage;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 10,
  },

  myContainer: {
    alignItems: "flex-end",
  },

  otherContainer: {
    alignItems: "flex-start",
  },

  bubble: {
    maxWidth: "80%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },

  myBubble: {
    backgroundColor: "#222222",
    borderBottomRightRadius: 4,
  },

  otherBubble: {
    backgroundColor: "#EEEEEE",
    borderBottomLeftRadius: 4,
  },

  text: {
    fontSize: 16,
    color: "#222222",
  },

  myText: {
    color: "#FFFFFF",
  },
});