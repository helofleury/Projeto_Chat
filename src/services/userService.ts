import {
  get,
  onValue,
  ref,
  set,
  update,
} from "firebase/database";

import { db } from "./firebase";

import type {
  AuthProvider,
  ChatUser,
} from "../types/user";

export const createUser = async (
  user: ChatUser
): Promise<void> => {
  const userRef = ref(db, `users/${user.uid}`);

  await set(userRef, user);
};

export const getUserById = async (
  uid: string
): Promise<ChatUser | null> => {
  const userRef = ref(db, `users/${uid}`);
  const snapshot = await get(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.val() as ChatUser;
};

export const getUsers = async (): Promise<ChatUser[]> => {
  const usersRef = ref(db, "users");
  const snapshot = await get(usersRef);

  if (!snapshot.exists()) {
    return [];
  }

  const data = snapshot.val() as Record<string, ChatUser>;

  return Object.values(data);
};

/**
 * Escuta em tempo real o registro de um usuário em
 * `users/{uid}`. Usado principalmente por quem está na tela
 * de espera: assim que o outro usuário logar e o pareamento
 * acontecer (gravando `partnerUid`), esse listener dispara
 * sozinho, sem precisar recarregar o app.
 */
export const listenToUserRecord = (
  uid: string,
  callback: (user: ChatUser | null) => void
): (() => void) => {
  const userRef = ref(db, `users/${uid}`);

  const unsubscribe = onValue(userRef, (snapshot) => {
    callback(
      snapshot.exists()
        ? (snapshot.val() as ChatUser)
        : null
    );
  });

  return unsubscribe;
};

/**
 * Quem é "compatível" pra virar parceiro de conversa.
 *
 * Regra do projeto: o e-mail/senha é sempre um dos dois lados
 * da conversa. Google e Apple só conversam com quem logou por
 * e-mail/senha — nunca entre si (Google ↔ Apple não é
 * permitido) e nunca com o mesmo provider (nem e-mail↔e-mail,
 * nem Google↔Google, nem Apple↔Apple).
 */
export const getCompatibleUsers = async (
  currentUser: ChatUser
): Promise<ChatUser[]> => {
  const users = await getUsers();

  return users.filter((user) => {
    if (user.uid === currentUser.uid) {
      return false;
    }

    if (user.provider === currentUser.provider) {
      return false;
    }

    return (
      currentUser.provider === "password" ||
      user.provider === "password"
    );
  });
};

/**
 * Trava o pareamento entre dois usuários, salvando o uid
 * de cada um no registro do outro (`users/{uid}/partnerUid`).
 *
 * É uma escrita multi-caminho (atômica): ou os dois lados
 * são gravados, ou nenhum é.
 */
export const pairUsers = async (
  uidA: string,
  uidB: string
): Promise<void> => {
  await update(ref(db), {
    [`users/${uidA}/partnerUid`]: uidB,
    [`users/${uidB}/partnerUid`]: uidA,
  });
};

/**
 * Encontra o parceiro de conversa do usuário atual.
 *
 * O app foi pensado para um chat de duas pessoas "não fixas":
 * quem quer que esteja logado com o provider oposto é
 * considerado o outro participante da conversa.
 *
 * Para que isso continue estável mesmo se surgirem contas
 * extras no banco (testes, contas antigas etc.), o primeiro
 * par encontrado é TRAVADO em `users/{uid}/partnerUid`. Nas
 * próximas vezes, o parceiro travado é usado diretamente,
 * sem recalcular — evitando que os dois dispositivos cheguem
 * a conclusões diferentes sobre quem é "o outro".
 *
 * Retorna `null` quando ainda não existe ninguém disponível
 * pra parear (ex.: a outra pessoa ainda não fez login/registro,
 * ou os únicos candidatos compatíveis já estão pareados com
 * outra pessoa).
 */
export const getChatPartner = async (
  currentUser: ChatUser
): Promise<ChatUser | null> => {
  // 1. Já existe um parceiro travado? Usa ele direto.
  if (currentUser.partnerUid) {
    const lockedPartner = await getUserById(
      currentUser.partnerUid
    );

    if (lockedPartner) {
      return lockedPartner;
    }

    // O parceiro travado foi apagado do banco (ex.: durante
    // uma limpeza manual) — cai no cálculo abaixo pra
    // encontrar um novo.
  }

  const compatibleUsers =
    await getCompatibleUsers(currentUser);

  if (compatibleUsers.length === 0) {
    return null;
  }

  // Ordena por uid pra ser determinístico: não importa a
  // ordem em que o Firebase devolveu os dados, os dois lados
  // avaliando a mesma lista de candidatos chegam à mesma
  // escolha inicial.
  const sortedCandidates = [...compatibleUsers].sort(
    (a, b) => a.uid.localeCompare(b.uid)
  );

  // Só considera candidatos que ainda não estão travados com
  // outra pessoa (evita "roubar" o parceiro de alguém quando
  // há contas extras no banco).
  const availableCandidates = sortedCandidates.filter(
    (candidate) =>
      !candidate.partnerUid ||
      candidate.partnerUid === currentUser.uid
  );

  if (availableCandidates.length === 0) {
    return null;
  }

  const oppositeProviderUser = availableCandidates.find(
    (user) => user.provider !== currentUser.provider
  );

  const chosenPartner =
    oppositeProviderUser ?? availableCandidates[0];

  await pairUsers(currentUser.uid, chosenPartner.uid);

  return chosenPartner;
};