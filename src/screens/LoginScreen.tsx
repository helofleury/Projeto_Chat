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
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";

import {
  loginWithApple,
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

  const [isAppleAvailable, setIsAppleAvailable] =
    useState<boolean>(false);

  useEffect(() => {
    // Sign in with Apple só existe no iOS. Em outras
    // plataformas nem tentamos checar, pra não chamar um
    // módulo nativo que não existe lá.
    if (Platform.OS !== "ios") {
      return;
    }

    AppleAuthentication.isAvailableAsync().then(
      setIsAppleAvailable
    );
  }, []);

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

  const handleAppleLogin = async (): Promise<void> => {
    if (loading) {
      return;
    }

    try {
      setLoading(true);

      // A Apple exige um "nonce" pra evitar ataques de replay.
      // Mandamos pra ela o hash (SHA-256) do nonce, e guardamos
      // o valor original (rawNonce) pra provar ao Firebase que
      // fomos nós que geramos esse hash.
      const rawNonce = Crypto.randomUUID();

      const hashedNonce =
        await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          rawNonce
        );

      const appleCredential =
        await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope
              .FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope
              .EMAIL,
          ],
          nonce: hashedNonce,
        });

      const { identityToken, fullName } =
        appleCredential;

      if (!identityToken) {
        throw new Error(
          "A Apple não retornou o identity token."
        );
      }

      // A Apple só manda o nome no primeiro login; nas
      // próximas vezes fullName vem null/undefined.
      const displayName = fullName
        ? [
            fullName.givenName,
            fullName.familyName,
          ]
            .filter(Boolean)
            .join(" ")
            .trim() || null
        : null;

      await loginWithApple(
        identityToken,
        rawNonce,
        displayName
      );
    } catch (error: any) {
      // Usuário cancelou o modal da Apple — não é um erro
      // de verdade, não precisa mostrar alerta.
      if (error?.code === "ERR_REQUEST_CANCELED") {
        return;
      }

      console.error("Erro Apple:", error);

      Alert.alert(
        "Erro no login",
        "Não foi possível entrar com a Apple."
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

        {isAppleAvailable && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={
              AppleAuthentication
                .AppleAuthenticationButtonType.SIGN_IN
            }
            buttonStyle={
              AppleAuthentication
                .AppleAuthenticationButtonStyle.BLACK
            }
            cornerRadius={10}
            style={styles.appleButton}
            onPress={handleAppleLogin}
          />
        )}
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

  appleButton: {
    height: 52,
    marginTop: 12,
  },

  disabledButton: {
    opacity: 0.5,
  },
});