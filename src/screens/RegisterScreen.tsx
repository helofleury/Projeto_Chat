import { useState, type FC } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { registerWithEmail } from "../services/authService";

type RegisterScreenProps = {
  onBackToLogin: () => void;
};

const RegisterScreen: FC<RegisterScreenProps> = ({
  onBackToLogin,
}) => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleRegister = async (): Promise<void> => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert(
        "Campos obrigatórios",
        "Preencha nome, e-mail e senha."
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Senha inválida",
        "A senha deve possuir pelo menos 6 caracteres."
      );
      return;
    }

    try {
      setLoading(true);

      await registerWithEmail(
        name.trim(),
        email.trim(),
        password
      );

      Alert.alert(
        "Cadastro realizado",
        "Sua conta foi criada com sucesso."
      );
    } catch {
      Alert.alert(
        "Erro no cadastro",
        "Não foi possível criar a conta. Verifique os dados informados."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Criar conta</Text>

        <Text style={styles.subtitle}>
          Cadastre-se para começar a conversar
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Nome"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoCorrect={false}
        />

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
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.registerButtonText}>
              Criar conta
            </Text>
          )}
        </Pressable>

        <Pressable
          style={styles.backButton}
          onPress={onBackToLogin}
          disabled={loading}
        >
          <Text style={styles.backText}>
            Já tenho uma conta
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666666",
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

  registerButton: {
    height: 52,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#222222",
    marginBottom: 16,
  },

  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  backButton: {
    alignItems: "center",
    paddingVertical: 12,
  },

  backText: {
    fontSize: 14,
  },
});