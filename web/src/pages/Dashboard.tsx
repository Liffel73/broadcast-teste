import LogoutIcon from "@mui/icons-material/Logout";
import { Alert, Button, CircularProgress, Divider, Paper, Tab, Tabs, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { ConnectionSidebar } from "../components/ConnectionSidebar";
import { ContactsPanel } from "../components/ContactsPanel";
import { MessagesPanel } from "../components/MessagesPanel";
import { useAuth } from "../context/AuthContext";
import { useBroadcastData } from "../hooks/useBroadcastData";

type WorkspaceTab = "contacts" | "messages";

export const Dashboard = () => {
  const { logout, user } = useAuth();
  const { connections, contacts, messages, loading, error } = useBroadcastData(user?.uid);
  const [activeConnectionId, setActiveConnectionId] = useState<string | null>(null);
  const [tab, setTab] = useState<WorkspaceTab>("contacts");

  useEffect(() => {
    if (!activeConnectionId && connections.length > 0) {
      setActiveConnectionId(connections[0].id);
    }
  }, [activeConnectionId, connections]);

  useEffect(() => {
    if (activeConnectionId && !connections.some((connection) => connection.id === activeConnectionId)) {
      setActiveConnectionId(connections[0]?.id ?? null);
    }
  }, [activeConnectionId, connections]);

  const activeConnection = useMemo(
    () => connections.find((connection) => connection.id === activeConnectionId) ?? null,
    [activeConnectionId, connections]
  );

  const scopedContacts = useMemo(
    () => contacts.filter((contact) => contact.connectionId === activeConnectionId),
    [activeConnectionId, contacts]
  );

  const scopedMessages = useMemo(
    () => messages.filter((message) => message.connectionId === activeConnectionId),
    [activeConnectionId, messages]
  );

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Typography variant="h5" fontWeight={900}>
              Broadcast
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
          </div>
          <Button variant="outlined" startIcon={<LogoutIcon />} onClick={logout}>
            Sair
          </Button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[320px_1fr]">
        <ConnectionSidebar
          ownerId={user?.uid ?? ""}
          connections={connections}
          activeConnectionId={activeConnectionId}
          contacts={contacts}
          messages={messages}
          onSelect={setActiveConnectionId}
        />

        <Paper className="min-h-[680px] p-4 shadow-sm" variant="outlined">
          {error ? (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          ) : null}

          {loading ? (
            <div className="flex min-h-[420px] items-center justify-center">
              <CircularProgress />
            </div>
          ) : activeConnection ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <Typography variant="h6" fontWeight={900}>
                    {activeConnection.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {scopedContacts.length} contatos, {scopedMessages.length} mensagens
                  </Typography>
                </div>
                <Tabs value={tab} onChange={(_, nextTab: WorkspaceTab) => setTab(nextTab)}>
                  <Tab label="Contatos" value="contacts" />
                  <Tab label="Mensagens" value="messages" />
                </Tabs>
              </div>
              <Divider />
              {tab === "contacts" ? (
                <ContactsPanel
                  ownerId={user?.uid ?? ""}
                  connection={activeConnection}
                  contacts={scopedContacts}
                />
              ) : (
                <MessagesPanel
                  ownerId={user?.uid ?? ""}
                  connection={activeConnection}
                  contacts={scopedContacts}
                  messages={scopedMessages}
                />
              )}
            </div>
          ) : (
            <div className="grid min-h-[420px] place-items-center text-center">
              <div>
                <Typography variant="h6" fontWeight={800}>
                  Crie sua primeira conexao
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cada conexao organiza seus proprios contatos e mensagens.
                </Typography>
              </div>
            </div>
          )}
        </Paper>
      </div>
    </main>
  );
};
