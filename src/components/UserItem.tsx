import type { FC } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { ChatUser } from "../types/user";

type UserItemProps = {
  user: ChatUser;
  onPress: (user: ChatUser) => void;
};

const UserItem: FC<UserItemProps> = ({
  user,
  onPress,
}) => {
  const providerName =
    user.provider === "password"
      ? "E-mail e senha"
      : user.provider === "google"
        ? "Google"
        : "Apple";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={() => onPress(user)}
    >
      <View style={styles.info}>
        <Text style={styles.name}>
          {user.name}
        </Text>

        <Text style={styles.provider}>
          Login com {providerName}
        </Text>
      </View>

      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
};

export default UserItem;

const styles = StyleSheet.create({
  container: {
    minHeight: 72,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  pressed: {
    opacity: 0.7,
  },

  info: {
    flex: 1,
  },

  name: {
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
    marginLeft: 12,
  },
});