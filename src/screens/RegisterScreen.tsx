import { useState, type FC } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  getAuthErrorMessage,
  registerWithEmail,
} from "../services/authService";

import ErrorMessage from "../components/ErrorMessage";

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
  const [error, setError] = useState<string>("");

  const handleRegister = async (): Promise<void> => {
    setError("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Preencha nome, e-mail e senha.");
      return;
    }

    if (password.length < 6) {
      setError(
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

      // Não precisa de alerta de sucesso: assim que a conta é
      // criada, o `onAuthStateChanged` (AuthContext) detecta o
      // login automático e o app já navega sozinho para a
      // tela de Contatos.
    } catch (err) {
      // IMPORTANTE: mostramos a mensagem real do erro (via
      // getAuthErrorMessage), em vez de sempre exibir "dados
      // inválidos". Isso evita reportar uma conta válida como
      // inválida quando o problema real é outro (e-mail já
      // cadastrado, falha de rede, permissão do banco etc.).
      console.error("Erro no cadastro:", err);
      setError(getAuthErrorMessage(err));
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

        {!!error && <ErrorMessage message={error} />}

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