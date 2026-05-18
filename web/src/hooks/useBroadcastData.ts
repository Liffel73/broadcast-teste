import { useEffect, useMemo, useState } from "react";
import {
  subscribeConnections,
  subscribeContacts,
  subscribeMessages
} from "../services/broadcast";
import type { BroadcastMessage, Connection, Contact } from "../types";

type BroadcastData = {
  connections: Connection[];
  contacts: Contact[];
  messages: BroadcastMessage[];
  loading: boolean;
  error: string | null;
};

export const useBroadcastData = (ownerId: string | undefined): BroadcastData => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<BroadcastMessage[]>([]);
  const [loaded, setLoaded] = useState({
    connections: false,
    contacts: false,
    messages: false
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ownerId) {
      return undefined;
    }

    const handleError = (nextError: Error) => {
      setError(nextError.message);
    };

    const unsubscribeConnections = subscribeConnections(
      ownerId,
      (items) => {
        setConnections(items);
        setLoaded((current) => ({ ...current, connections: true }));
      },
      handleError
    );

    const unsubscribeContacts = subscribeContacts(
      ownerId,
      (items) => {
        setContacts(items);
        setLoaded((current) => ({ ...current, contacts: true }));
      },
      handleError
    );

    const unsubscribeMessages = subscribeMessages(
      ownerId,
      (items) => {
        setMessages(items);
        setLoaded((current) => ({ ...current, messages: true }));
      },
      handleError
    );

    return () => {
      unsubscribeConnections();
      unsubscribeContacts();
      unsubscribeMessages();
    };
  }, [ownerId]);

  const loading = useMemo(
    () => Boolean(ownerId) && (!loaded.connections || !loaded.contacts || !loaded.messages),
    [loaded.connections, loaded.contacts, loaded.messages, ownerId]
  );

  return {
    connections,
    contacts,
    messages,
    loading,
    error
  };
};
