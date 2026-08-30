import {
  useEffect,
  useState,
  type FC,
} from "react";

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

import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";

import {
  loginWithEmail,
  loginWithGoogle,
} from "../services/authService";

WebBrowser.maybeCompleteAuthSession();

const redirectUri = makeRedirectUri({
  scheme: "app-chat",
});

console.log("REDIRECT URI:", redirectUri);

type LoginScreenProps = {
  onRegister: () => void;
};

const LoginScreen: FC<LoginScreenProps> = ({
  onRegister,
}) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [request, response, promptAsync] =
    Google.useAuthRequest({
      webClientId:
        "268092858690-c6ee0mu2uda5o562rgsmjrd5u0bn9gbf.apps.googleusercontent.com",

      androidClientId:
        "268092858690-kvegv6mj4vkd95fvida7kpbac30597lq.apps.googleusercontent.com",

      redirectUri,

      responseType: "id_token",

      scopes: [
        "openid",
        "profile",
        "email",
      ],
    });

  useEffect(() => {
    console.log("GOOGLE RESPONSE:", response);

    if (!response) {
      return;
    }

    if (response.type !== "success") {
      console.log(
        "GOOGLE AUTH NÃO FOI CONCLUÍDO:",
        response
      );

      setLoading(false);
      return;
    }

    const handleGoogleResponse =
      async (): Promise<void> => {
        console.log(
          "GOOGLE AUTH SUCESSO:",
          response
        );

        const idToken =
          response.authentication?.idToken ??
          response.params?.id_token;

        if (!idToken) {
          console.error(
            "Google não retornou ID token:",
            response
          );

          setLoading(false);

          Alert.alert(
            "Erro no login",
            "O Google não retornou o ID token necessário."
          );

          return;
        }

        try {
          setLoading(true);

          await loginWithGoogle(idToken);
        } catch (error) {
          console.error(
            "Erro Firebase Google:",
            error
          );

          Alert.alert(
            "Erro no login",
            "Não foi possível entrar com o Google."
          );
        } finally {
          setLoading(false);
        }
      };

    void handleGoogleResponse();
  }, [response]);

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
    } catch (error) {
      console.error(
        "Erro no login:",
        error
      );

      Alert.alert(
        "Erro no login",
        "E-mail ou senha inválidos."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (): Promise<void> => {
    if (!request || loading) {
      return;
    }

    try {
      setLoading(true);

      const result = await promptAsync();

      console.log(
        "GOOGLE PROMPT RESULT:",
        result
      );

      if (
        result.type !== "success"
      ) {
        setLoading(false);
      }
    } catch (error) {
      console.error(
        "Erro ao iniciar Google:",
        error
      );

      setLoading(false);

      Alert.alert(
        "Erro no login",
        "Não foi possível iniciar o login com Google."
      );
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
        <Text style={styles.title}>
          Chat
        </Text>

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
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          editable={!loading}
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
          style={[
            styles.googleButton,
            (!request || loading) &&
              styles.disabledButton,
          ]}
          onPress={handleGoogleLogin}
          disabled={!request || loading}
        >
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.googleText}>
              Entrar com Google
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

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
  },

  googleText: {
    fontSize: 16,
    fontWeight: "600",
  },

  disabledButton: {
    opacity: 0.5,
  },
});