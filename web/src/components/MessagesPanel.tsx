import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ScheduleSendIcon from "@mui/icons-material/ScheduleSend";
import SendIcon from "@mui/icons-material/Send";
import {
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  IconButton
} from "@mui/material";
import { FormEvent, useMemo, useState } from "react";
import {
  createMessage,
  deleteMessage,
  updateMessage
} from "../services/broadcast";
import type { BroadcastMessage, Connection, Contact, MessageFilter } from "../types";
import { formatDateTime, fromDatetimeLocalValue, toDatetimeLocalValue } from "../utils/date";
import { matchesMessageFilter } from "../utils/message";

type MessagesPanelProps = {
  ownerId: string;
  connection: Connection;
  contacts: Contact[];
  messages: BroadcastMessage[];
};

type DialogState =
  | { open: false; message: null }
  | { open: true; message: BroadcastMessage | null };

export const MessagesPanel = ({
  ownerId,
  connection,
  contacts,
  messages
}: MessagesPanelProps) => {
  const [filter, setFilter] = useState<MessageFilter>("all");
  const [dialog, setDialog] = useState<DialogState>({ open: false, message: null });
  const [content, setContent] = useState("");
  const [contactIds, setContactIds] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contactNames = useMemo(
    () =>
      contacts.reduce<Record<string, string>>((acc, contact) => {
        acc[contact.id] = contact.name;
        return acc;
      }, {}),
    [contacts]
  );

  const filteredMessages = useMemo(
    () => messages.filter((message) => matchesMessageFilter(message.status, filter)),
    [filter, messages]
  );

  const openCreate = () => {
    setDialog({ open: true, message: null });
    setContent("");
    setContactIds([]);
    setScheduledAt("");
    setError(null);
  };

  const openEdit = (message: BroadcastMessage) => {
    setDialog({ open: true, message });
    setContent(message.content);
    setContactIds(message.contactIds);
    setScheduledAt(toDatetimeLocalValue(message.scheduledAt));
    setError(null);
  };

  const closeDialog = () => {
    setDialog({ open: false, message: null });
    setSaving(false);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const values = {
        content,
        contactIds,
        scheduledAt: fromDatetimeLocalValue(scheduledAt)
      };

      if (dialog.message) {
        await updateMessage(dialog.message.id, values);
      } else {
        await createMessage(ownerId, connection.id, values);
      }

      closeDialog();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Nao foi possivel salvar.");
      setSaving(false);
    }
  };

  const remove = async (message: BroadcastMessage) => {
    const confirmed = window.confirm("Excluir mensagem?");

    if (confirmed) {
      await deleteMessage(message.id);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <Typography variant="subtitle1" fontWeight={900}>
            Mensagens
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Envio fake com agendamento e atualizacao por Cloud Function.
          </Typography>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={(_, nextFilter: MessageFilter | null) => {
              if (nextFilter) {
                setFilter(nextFilter);
              }
            }}
            size="small"
          >
            <ToggleButton value="all">Todas</ToggleButton>
            <ToggleButton value="sent">Enviadas</ToggleButton>
            <ToggleButton value="scheduled">Agendadas</ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreate}
            disabled={contacts.length === 0}
          >
            Nova mensagem
          </Button>
        </div>
      </div>

      {contacts.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Cadastre contatos antes de criar mensagens.
        </Typography>
      ) : null}

      <TableContainer className="rounded-lg border border-line">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Status</TableCell>
              <TableCell>Mensagem</TableCell>
              <TableCell>Contatos</TableCell>
              <TableCell>Agendamento</TableCell>
              <TableCell>Envio</TableCell>
              <TableCell align="right">Acoes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMessages.map((message) => (
              <TableRow key={message.id} hover>
                <TableCell>
                  <Chip
                    icon={message.status === "scheduled" ? <ScheduleSendIcon /> : <SendIcon />}
                    label={message.status === "scheduled" ? "Agendada" : "Enviada"}
                    color={message.status === "scheduled" ? "warning" : "success"}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell className="max-w-[320px]">
                  <Typography variant="body2" className="line-clamp-2">
                    {message.content}
                  </Typography>
                </TableCell>
                <TableCell>
                  {message.contactIds
                    .map((contactId) => contactNames[contactId] ?? "Contato removido")
                    .join(", ")}
                </TableCell>
                <TableCell>{formatDateTime(message.scheduledAt)}</TableCell>
                <TableCell>{formatDateTime(message.sentAt)}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => openEdit(message)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton size="small" onClick={() => remove(message)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {filteredMessages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" className="py-10">
                  Nenhuma mensagem encontrada.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialog.open} onClose={closeDialog} fullWidth maxWidth="sm">
        <form onSubmit={submit}>
          <DialogTitle>{dialog.message ? "Editar mensagem" : "Nova mensagem"}</DialogTitle>
          <DialogContent className="space-y-4">
            {error ? (
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            ) : null}
            <TextField
              autoFocus
              label="Mensagem"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              inputProps={{ maxLength: 2000 }}
              minRows={4}
              multiline
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel id="contacts-select-label">Contatos</InputLabel>
              <Select
                labelId="contacts-select-label"
                multiple
                value={contactIds}
                onChange={(event) => setContactIds(event.target.value as string[])}
                input={<OutlinedInput label="Contatos" />}
                renderValue={(selected) =>
                  selected.map((contactId) => contactNames[contactId] ?? contactId).join(", ")
                }
              >
                {contacts.map((contact) => (
                  <MenuItem key={contact.id} value={contact.id}>
                    <Checkbox checked={contactIds.includes(contact.id)} />
                    <ListItemText primary={contact.name} secondary={contact.phone} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Agendar para"
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
              InputLabelProps={{ shrink: true }}
              helperText="Deixe vazio para marcar como enviada agora."
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={saving || contactIds.length === 0}>
              Salvar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </section>
  );
};
