import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import InboxIcon from "@mui/icons-material/Inbox";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { Alert, Button, CircularProgress, Paper, Tab, Tabs, Typography } from "@mui/material";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { BrandMark } from "../components/BrandMark";
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
    <main className="min-h-screen bg-app text-base-fg lg:grid lg:grid-cols-[64px_300px_1fr]">
      <nav className="hidden min-h-screen flex-col items-center gap-1 border-r border-line bg-soft py-4 lg:flex">
        <div className="mb-3">
          <BrandMark size={34} />
        </div>
        <RailButton active icon={<InboxIcon fontSize="small" />} label="Workspace" />
        <RailButton icon={<NotificationsNoneIcon fontSize="small" />} label="Atividade" />
        <RailButton icon={<CalendarMonthIcon fontSize="small" />} label="Agenda" />
        <RailButton icon={<SettingsOutlinedIcon fontSize="small" />} label="Configuracoes" />
        <div className="mt-auto">
          <RailButton icon={<LogoutIcon fontSize="small" />} label="Sair" onClick={logout} />
        </div>
      </nav>

      <div className="lg:min-h-screen">
        <ConnectionSidebar
          ownerId={user?.uid ?? ""}
          connections={connections}
          activeConnectionId={activeConnectionId}
          contacts={contacts}
          messages={messages}
          onSelect={setActiveConnectionId}
        />
      </div>

      <section className="flex min-h-screen flex-col">
        <header className="border-b border-line bg-surface px-4 py-4 lg:px-6">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2 lg:hidden">
                <BrandMark size={28} />
                <Typography variant="subtitle1" fontWeight={900}>
                  Broadcast
                </Typography>
              </div>
              <Typography variant="body2" className="font-mono text-muted">
                {user?.email}
              </Typography>
              <Typography variant="h5" fontWeight={900} className="mt-1">
                {activeConnection?.name ?? "Selecione uma conexao"}
              </Typography>
              {activeConnection ? (
                <Typography variant="body2" className="mt-1 text-muted">
                  {scopedContacts.length} contatos, {scopedMessages.length} mensagens
                </Typography>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              {activeConnection ? (
                <Tabs value={tab} onChange={(_, nextTab: WorkspaceTab) => setTab(nextTab)}>
                  <Tab label="Contatos" value="contacts" />
                  <Tab label="Mensagens" value="messages" />
                </Tabs>
              ) : null}
              <Button className="lg:hidden" variant="outlined" startIcon={<LogoutIcon />} onClick={logout}>
                Sair
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 lg:p-6">
          <Paper className="min-h-[680px] border-line bg-surface p-4 shadow-sm" variant="outlined">
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
      </section>
    </main>
  );
};

const RailButton = ({
  icon,
  label,
  active,
  onClick
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    onClick={onClick}
    className={`grid size-10 place-items-center rounded-xl transition-colors ${
      active ? "bg-p-soft text-p" : "text-muted hover:bg-surface-2 hover:text-base-fg"
    }`}
  >
    {icon}
  </button>
);
