import type { FC } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";

type LoadingProps = {
  message?: string;
};

const Loading: FC<LoadingProps> = ({
  message = "Carregando...",
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />

      <Text style={styles.text}>
        {message}
      </Text>
    </View>
  );
};

export default Loading;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  text: {
    marginTop: 12,
    fontSize: 15,
    color: "#666666",
  },
});