# 💬 Chat Firebase - React Native

Aplicativo de chat desenvolvido em **React Native com TypeScript**, utilizando o **Firebase Authentication** para autenticação dos usuários e o **Firebase Realtime Database** para armazenamento e sincronização das mensagens em tempo real.

O projeto tem como objetivo criar uma aplicação de comunicação **exclusivamente 1 para 1**, com regras específicas de comunicação entre os provedores de autenticação.

---

## 📱 Descrição do Projeto

O aplicativo permite que usuários autenticados encontrem outros usuários compatíveis e iniciem uma conversa individual em tempo real.

A aplicação possui as seguintes formas de autenticação:

- 📧 E-mail e senha
- 🔵 Google
- 🍎 Apple

### Regra de comunicação

O projeto segue as seguintes regras:

| Usuário autenticado com | Pode conversar com |
|---|---|
| 📧 E-mail/Senha | 🔵 Google, 🍎 Apple |
| 🔵 Google | 📧 E-mail/Senha |
| 🍎 Apple | 📧 E-mail/Senha |

Não são permitidas as seguintes combinações:

- ❌ E-mail/Senha ↔ E-mail/Senha
- ❌ Google ↔ Google
- ❌ Apple ↔ Apple
- ❌ Google ↔ Apple

O **e-mail/senha é sempre um dos dois lados da conversa**: Google e Apple nunca conversam diretamente entre si.

> ⚠️ Sign in with Apple é uma exigência da própria Apple: é **exclusivo para iOS** (não funciona no Android nem na web). O botão só aparece quando o app é aberto em um dispositivo iOS compatível.

---

## 🎯 Objetivos

O projeto tem como objetivos:

- Implementar autenticação utilizando Firebase Authentication;
- Permitir login com E-mail/Senha, Google e Apple;
- Identificar cada usuário através do `uid` fornecido pelo Firebase;
- Implementar conversas exclusivamente 1 para 1;
- Aplicar regras de comunicação baseadas no provedor de autenticação;
- Armazenar mensagens no Firebase Realtime Database;
- Atualizar as mensagens em tempo real;
- Utilizar TypeScript com tipagem forte;
- Aplicar Hooks do React;
- Utilizar componentes reutilizáveis;
- Separar a comunicação com o Firebase da interface;
- Implementar loading e tratamento de erros;
- Aplicar regras de segurança no Realtime Database.

---

# 🚀 Tecnologias Utilizadas

## Front-end

- **React Native**
- **Expo**
- **Expo SDK 54**
- **TypeScript**
- **React Hooks**
- **Flexbox**
- **StyleSheet**

## Backend / Serviços

- **Firebase Authentication**
- **Firebase Realtime Database**

## Autenticação

- E-mail e senha
- Google
- Apple (`expo-apple-authentication` + `expo-crypto`, exclusivo iOS)

---

# 🔥 Configuração do Firebase

Para executar o projeto corretamente, é necessário realizar as configurações do **Firebase** antes de iniciar a aplicação.

É necessário configurar:

1. Um **projeto no Firebase**;
2. Um **aplicativo Web (Firebase Web App)** dentro do projeto;
3. O **Firebase Authentication**;
4. Os provedores de autenticação utilizados pela aplicação (**E-mail/Senha**, **Google** e **Apple**);
5. O **Firebase Realtime Database**;
6. As configurações e regras do banco de dados.

### 1. Criar o projeto no Firebase

Crie um projeto no **Firebase Console** e, dentro dele, adicione um **Web App**.

Após registrar o aplicativo Web, o Firebase fornecerá as configurações necessárias, semelhantes a:

```typescript
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  databaseURL: "SUA_DATABASE_URL",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
};
```

### 2. Ativar os provedores de autenticação

No **Firebase Console**, vá em **Authentication → Sign-in method** e ative:

- **E-mail/senha**
- **Google**
- **Apple**

> Sem o provedor **Apple** ativado, o botão "Entrar com Apple" aparece e abre normalmente, mas o login falha ao tentar autenticar no Firebase.

### 3. Configuração adicional para o login com Apple (apenas iOS)

O login com Apple só funciona em dispositivos iOS e exige configuração extra no `app.json`:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.seu.app",
      "usesAppleSignIn": true
    },
    "plugins": ["expo-apple-authentication"]
  }
}
```

Para testes rápidos durante o desenvolvimento, o login com Apple **funciona dentro do Expo Go em um iPhone**, sem necessidade de build nativo. Para gerar um build de produção (EAS Build / App Store), é necessário:

- Conta no **Apple Developer Program**;
- Registrar o `bundleIdentifier` no Apple Developer Console com a capability **Sign In with Apple** habilitada.

---

# 🗂️ Estrutura do Projeto

```text
app-chat/
├── node_modules/
├── src/
│ ├── components/
│ ├── contexts/
│ ├── hooks/
│ ├── screens/
│ ├── services/
│ │ ├── authService.ts
│ │ ├── chatService.ts
│ │ ├── firebase.ts
│ │ └── userService.ts
│ ├── types/
│ └── utils/
│
├── .gitignore
├── app.json
├── App.tsx
├── package.json
├── package-lock.json
└── tsconfig.json
```

### Descrição das Pastas

| Pasta | Responsabilidade |
|---------|------------------|
| `components` | Componentes reutilizáveis da interface |
| `contexts` | Contextos globais utilizando Context API |
| `hooks` | Hooks personalizados da aplicação |
| `screens` | Telas da aplicação |
| `services` | Integração com Firebase e serviços externos |
| `types` | Interfaces e tipagens TypeScript |
| `utils` | Funções utilitárias e regras auxiliares |

---

## ⚙️ Como Executar o Projeto

### 1. Clone o repositório
```bash
git clone <URL_DO_REPOSITORIO>
```

### 2. Acesse a pasta do projeto

```bash
cd nome-do-projeto
```
### 3. Instale as dependências
```bash
npm install
```
### 4. Configure o Firebase

Antes de iniciar a aplicação, é necessário configurar o **Firebase Web App**, o **Firebase Authentication** (E-mail/Senha, Google e Apple) e o **Firebase Realtime Database**.

Após realizar as configurações no Firebase Console, insira as informações do seu projeto no arquivo:

```bash
src/services/firebase.ts
```
### 5. Execute o projeto

```bash
npx expo start
```

Após iniciar o Expo, é necessário executar o aplicativo em **dois dispositivos simultaneamente**, como **um celular e um computador**, para que seja possível testar a comunicação do chat entre dois usuários em tempo real.

> Para testar o login com Apple, o dispositivo usado precisa ser um **iPhone com o app Expo Go**, escaneando o QR code exibido no terminal.

---

---

# 📸 Execução do Projeto

### 🔵 Usuário Google

Exemplo de um usuário autenticado com uma conta Google realizando uma conversa 1 para 1 em tempo real com outro usuário.

![Usuário Google conversando](./screenshots/google-chat.png)

### 📧 Usuário E-mail e Senha

Exemplo de um usuário autenticado utilizando e-mail e senha realizando uma conversa 1 para 1 em tempo real com outro usuário.

![Usuário E-mail e Senha conversando](./screenshots/email-chat.jpg)

### 👥 Lista de Contatos

Tela de contatos exibindo os usuários disponíveis para iniciar uma conversa, respeitando as regras de comunicação definidas no projeto.

![Lista de contatos](./screenshots/lista-contatos.png)

---

## 👥 Integrantes

- **Heloísa Fleury Jardim** - RM556378
  
- **Juan Fuentes Rufino** - RM557673

- **Rickelmyn de Souza Ruescas** - RM556055

- **Paulo Henrique Monteiro Golovanevsky** - RM555300

- **Pedro Henrique Silva Batista** - RM558137
