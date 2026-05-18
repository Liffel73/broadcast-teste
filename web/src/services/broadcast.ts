import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  writeBatch,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentReference
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { BroadcastMessage, Connection, Contact, MessageStatus } from "../types";

type FirestoreData = Record<string, unknown>;
type Unsubscribe = () => void;
type Listener<T> = (items: T[]) => void;
type ErrorListener = (error: Error) => void;
const BATCH_WRITE_LIMIT = 450;

const getDatabase = () => {
  if (!db) {
    throw new Error("Configure as variaveis do Firebase em web/.env.local.");
  }

  return db;
};

export type ContactFormValues = {
  name: string;
  phone: string;
};

export type MessageFormValues = {
  content: string;
  contactIds: string[];
  scheduledAt: Date | null;
};

const toDate = (value: unknown) => {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  return null;
};

const sortByName = <T extends { name: string }>(items: T[]) =>
  [...items].sort((first, second) => first.name.localeCompare(second.name));

const sortByRecent = <T extends { createdAt: Date | null }>(items: T[]) =>
  [...items].sort((first, second) => {
    const firstTime = first.createdAt?.getTime() ?? 0;
    const secondTime = second.createdAt?.getTime() ?? 0;
    return secondTime - firstTime;
  });

const mapConnection = (id: string, data: FirestoreData): Connection => ({
  id,
  ownerId: String(data.ownerId ?? ""),
  name: String(data.name ?? ""),
  createdAt: toDate(data.createdAt),
  updatedAt: toDate(data.updatedAt)
});

const mapContact = (id: string, data: FirestoreData): Contact => ({
  id,
  ownerId: String(data.ownerId ?? ""),
  connectionId: String(data.connectionId ?? ""),
  name: String(data.name ?? ""),
  phone: String(data.phone ?? ""),
  createdAt: toDate(data.createdAt),
  updatedAt: toDate(data.updatedAt)
});

const mapMessage = (id: string, data: FirestoreData): BroadcastMessage => ({
  id,
  ownerId: String(data.ownerId ?? ""),
  connectionId: String(data.connectionId ?? ""),
  content: String(data.content ?? ""),
  contactIds: Array.isArray(data.contactIds) ? data.contactIds.map(String) : [],
  status: data.status === "scheduled" ? "scheduled" : "sent",
  scheduledAt: toDate(data.scheduledAt),
  sentAt: toDate(data.sentAt),
  createdAt: toDate(data.createdAt),
  updatedAt: toDate(data.updatedAt)
});

export const subscribeConnections = (
  ownerId: string,
  onNext: Listener<Connection>,
  onError: ErrorListener
): Unsubscribe => {
  const database = getDatabase();
  const connectionsQuery = query(collection(database, "connections"), where("ownerId", "==", ownerId));

  return onSnapshot(
    connectionsQuery,
    (snapshot) => {
      const connections = snapshot.docs.map((item) => mapConnection(item.id, item.data()));
      onNext(sortByName(connections));
    },
    onError
  );
};

export const createConnection = (ownerId: string, name: string) =>
  addDoc(collection(getDatabase(), "connections"), {
    ownerId,
    name: name.trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

export const updateConnection = (connectionId: string, name: string) =>
  updateDoc(doc(getDatabase(), "connections", connectionId), {
    name: name.trim(),
    updatedAt: serverTimestamp()
  });

export const deleteConnection = (connectionId: string) =>
  deleteDoc(doc(getDatabase(), "connections", connectionId));

const deleteDocumentsInBatches = async (refs: DocumentReference[]) => {
  for (let index = 0; index < refs.length; index += BATCH_WRITE_LIMIT) {
    const batch = writeBatch(getDatabase());
    refs.slice(index, index + BATCH_WRITE_LIMIT).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
};

export const deleteConnectionWithRelated = (
  connectionId: string,
  contactIds: string[],
  messageIds: string[]
) => {
  const database = getDatabase();
  const refs = [
    ...contactIds.map((contactId) => doc(database, "contacts", contactId)),
    ...messageIds.map((messageId) => doc(database, "messages", messageId)),
    doc(database, "connections", connectionId)
  ];

  return deleteDocumentsInBatches(refs);
};

export const subscribeContacts = (
  ownerId: string,
  onNext: Listener<Contact>,
  onError: ErrorListener
): Unsubscribe => {
  const database = getDatabase();
  const contactsQuery = query(collection(database, "contacts"), where("ownerId", "==", ownerId));

  return onSnapshot(
    contactsQuery,
    (snapshot) => {
      const contacts = snapshot.docs.map((item) => mapContact(item.id, item.data()));
      onNext(sortByName(contacts));
    },
    onError
  );
};

export const createContact = (ownerId: string, connectionId: string, values: ContactFormValues) =>
  addDoc(collection(getDatabase(), "contacts"), {
    ownerId,
    connectionId,
    name: values.name.trim(),
    phone: values.phone.trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

export const updateContact = (contactId: string, values: ContactFormValues) =>
  updateDoc(doc(getDatabase(), "contacts", contactId), {
    name: values.name.trim(),
    phone: values.phone.trim(),
    updatedAt: serverTimestamp()
  });

export const deleteContact = (contactId: string) => deleteDoc(doc(getDatabase(), "contacts", contactId));

export const subscribeMessages = (
  ownerId: string,
  onNext: Listener<BroadcastMessage>,
  onError: ErrorListener
): Unsubscribe => {
  const database = getDatabase();
  const messagesQuery = query(collection(database, "messages"), where("ownerId", "==", ownerId));

  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      const messages = snapshot.docs.map((item) => mapMessage(item.id, item.data()));
      onNext(sortByRecent(messages));
    },
    onError
  );
};

const normalizeMessageSchedule = (scheduledAt: Date | null) => {
  if (!scheduledAt) {
    return {
      status: "sent" as MessageStatus,
      scheduledAt: null,
      sentAt: serverTimestamp()
    };
  }

  return {
    status: "scheduled" as MessageStatus,
    scheduledAt: Timestamp.fromDate(scheduledAt),
    sentAt: null
  };
};

export const createMessage = (
  ownerId: string,
  connectionId: string,
  values: MessageFormValues
) => {
  const schedule = normalizeMessageSchedule(values.scheduledAt);

  return addDoc(collection(getDatabase(), "messages"), {
    ownerId,
    connectionId,
    content: values.content.trim(),
    contactIds: values.contactIds,
    status: schedule.status,
    scheduledAt: schedule.scheduledAt,
    sentAt: schedule.sentAt,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const updateMessage = (messageId: string, values: MessageFormValues) => {
  const schedule = normalizeMessageSchedule(values.scheduledAt);

  return updateDoc(doc(getDatabase(), "messages", messageId), {
    content: values.content.trim(),
    contactIds: values.contactIds,
    status: schedule.status,
    scheduledAt: schedule.scheduledAt,
    sentAt: schedule.sentAt,
    updatedAt: serverTimestamp()
  });
};

export const deleteMessage = (messageId: string) => deleteDoc(doc(getDatabase(), "messages", messageId));
