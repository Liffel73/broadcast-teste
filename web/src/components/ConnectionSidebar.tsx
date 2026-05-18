import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { FormEvent, ReactNode, useMemo, useState } from "react";
import {
  createConnection,
  deleteConnectionWithRelated,
  updateConnection
} from "../services/broadcast";
import type { BroadcastMessage, Connection, Contact } from "../types";

type ConnectionSidebarProps = {
  ownerId: string;
  connections: Connection[];
  activeConnectionId: string | null;
  contacts: Contact[];
  messages: BroadcastMessage[];
  onSelect: (connectionId: string) => void;
};

type DialogState =
  | { open: false; connection: null }
  | { open: true; connection: Connection | null };

export const ConnectionSidebar = ({
  ownerId,
  connections,
  activeConnectionId,
  contacts,
  messages,
  onSelect
}: ConnectionSidebarProps) => {
  const [dialog, setDialog] = useState<DialogState>({ open: false, connection: null });
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const counts = useMemo(
    () =>
      connections.reduce<Record<string, { contacts: number; messages: number }>>((acc, connection) => {
        acc[connection.id] = {
          contacts: contacts.filter((contact) => contact.connectionId === connection.id).length,
          messages: messages.filter((message) => message.connectionId === connection.id).length
        };
        return acc;
      }, {}),
    [connections, contacts, messages]
  );

  const openCreate = () => {
    setDialog({ open: true, connection: null });
    setName("");
    setError(null);
  };

  const openEdit = (connection: Connection) => {
    setDialog({ open: true, connection });
    setName(connection.name);
    setError(null);
  };

  const closeDialog = () => {
    setDialog({ open: false, connection: null });
    setSaving(false);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (dialog.connection) {
        await updateConnection(dialog.connection.id, name);
      } else {
        await createConnection(ownerId, name);
      }

      closeDialog();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Nao foi possivel salvar.");
      setSaving(false);
    }
  };

  const remove = async (connection: Connection) => {
    const confirmed = window.confirm(`Excluir "${connection.name}" e todos os dados vinculados?`);

    if (confirmed) {
      const relatedContactIds = contacts
        .filter((contact) => contact.connectionId === connection.id)
        .map((contact) => contact.id);
      const relatedMessageIds = messages
        .filter((message) => message.connectionId === connection.id)
        .map((message) => message.id);

      await deleteConnectionWithRelated(connection.id, relatedContactIds, relatedMessageIds);
    }
  };

  return (
    <Paper className="h-fit p-4 shadow-sm" variant="outlined">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <Typography variant="subtitle1" fontWeight={900}>
            Conexoes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {connections.length} cadastradas
          </Typography>
        </div>
        <Tooltip title="Nova conexao">
          <IconButton color="primary" onClick={openCreate} aria-label="Nova conexao">
            <AddIcon />
          </IconButton>
        </Tooltip>
      </div>

      <List dense disablePadding className="space-y-1">
        {connections.map((connection) => {
          const currentCounts = counts[connection.id] ?? { contacts: 0, messages: 0 };

          return (
            <ListItem
              key={connection.id}
              disablePadding
              secondaryAction={
                <div className="flex gap-1">
                  <Tooltip title="Editar">
                    <IconButton edge="end" size="small" onClick={() => openEdit(connection)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton edge="end" size="small" onClick={() => remove(connection)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </div>
              }
            >
              <ListItemButton
                selected={connection.id === activeConnectionId}
                onClick={() => onSelect(connection.id)}
                className="rounded-lg pr-20"
              >
                <ListItemText
                  primary={connection.name}
                  secondary={`${currentCounts.contacts} contatos, ${currentCounts.messages} mensagens`}
                  primaryTypographyProps={{ fontWeight: 800 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Dialog open={dialog.open} onClose={closeDialog} fullWidth maxWidth="xs">
        <BoxForm title={dialog.connection ? "Editar conexao" : "Nova conexao"} onSubmit={submit}>
          <DialogContent className="space-y-4">
            {error ? (
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            ) : null}
            <TextField
              autoFocus
              label="Nome"
              value={name}
              onChange={(event) => setName(event.target.value)}
              inputProps={{ minLength: 2, maxLength: 80 }}
              fullWidth
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              Salvar
            </Button>
          </DialogActions>
        </BoxForm>
      </Dialog>
    </Paper>
  );
};

const BoxForm = ({
  title,
  children,
  onSubmit
}: {
  title: string;
  children: ReactNode;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) => (
  <form onSubmit={onSubmit}>
    <DialogTitle>{title}</DialogTitle>
    {children}
  </form>
);
