import { useState, type FC } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { loginWithEmail } from "../services/authService";

type LoginScreenProps = {
  onRegister: () => void;
};

const LoginScreen: FC<LoginScreenProps> = ({ onRegister }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (): Promise<void> => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        "Campos obrigatórios",
        "Preencha o e-mail e a senha."
      );
      return;
    }

    try {
      setLoading(true);

      await loginWithEmail(
        email.trim(),
        password
      );
    } catch {
      Alert.alert(
        "Erro no login",
        "E-mail ou senha inválidos."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat</Text>

      <Text style={styles.subtitle}>
        Entre na sua conta
      </Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />

      <Pressable
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.loginButtonText}>
            Entrar
          </Text>
        )}
      </Pressable>

      <Pressable
        style={styles.registerButton}
        onPress={onRegister}
        disabled={loading}
      >
        <Text style={styles.registerText}>
          Ainda não tenho uma conta
        </Text>
      </Pressable>

      <View style={styles.divider}>
        <View style={styles.line} />

        <Text style={styles.dividerText}>
          ou
        </Text>

        <View style={styles.line} />
      </View>

      <Pressable
        style={styles.googleButton}
        disabled={loading}
      >
        <Text style={styles.googleText}>
          Entrar com Google
        </Text>
      </Pressable>

      <Pressable
        style={styles.appleButton}
        disabled={loading}
      >
        <Text style={styles.appleText}>
          Entrar com Apple
        </Text>
      </Pressable>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
  },

  title: {
    fontSize: 36,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },

  loginButton: {
    height: 52,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#222222",
    marginBottom: 16,
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  registerButton: {
    alignItems: "center",
    paddingVertical: 12,
  },

  registerText: {
    fontSize: 14,
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#DDDDDD",
  },

  dividerText: {
    marginHorizontal: 12,
    color: "#777777",
  },

  googleButton: {
    height: 52,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  googleText: {
    fontSize: 16,
    fontWeight: "600",
  },

  appleButton: {
    height: 52,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },

  appleText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});