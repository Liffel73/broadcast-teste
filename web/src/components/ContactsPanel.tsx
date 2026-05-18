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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { FormEvent, useState } from "react";
import {
  createContact,
  deleteContact,
  updateContact
} from "../services/broadcast";
import type { Connection, Contact } from "../types";

type ContactsPanelProps = {
  ownerId: string;
  connection: Connection;
  contacts: Contact[];
};

type DialogState =
  | { open: false; contact: null }
  | { open: true; contact: Contact | null };

export const ContactsPanel = ({ ownerId, connection, contacts }: ContactsPanelProps) => {
  const [dialog, setDialog] = useState<DialogState>({ open: false, contact: null });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCreate = () => {
    setDialog({ open: true, contact: null });
    setName("");
    setPhone("");
    setError(null);
  };

  const openEdit = (contact: Contact) => {
    setDialog({ open: true, contact });
    setName(contact.name);
    setPhone(contact.phone);
    setError(null);
  };

  const closeDialog = () => {
    setDialog({ open: false, contact: null });
    setSaving(false);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const values = { name, phone };

      if (dialog.contact) {
        await updateContact(dialog.contact.id, values);
      } else {
        await createContact(ownerId, connection.id, values);
      }

      closeDialog();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Nao foi possivel salvar.");
      setSaving(false);
    }
  };

  const remove = async (contact: Contact) => {
    const confirmed = window.confirm(`Excluir contato "${contact.name}"?`);

    if (confirmed) {
      await deleteContact(contact.id);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Typography variant="subtitle1" fontWeight={900}>
            Contatos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Lista em tempo real da conexao selecionada.
          </Typography>
        </div>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Novo contato
        </Button>
      </div>

      <TableContainer className="rounded-lg border border-line">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell align="right">Acoes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id} hover>
                <TableCell>{contact.name}</TableCell>
                <TableCell>{contact.phone}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => openEdit(contact)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton size="small" onClick={() => remove(contact)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" className="py-10">
                  Nenhum contato cadastrado.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialog.open} onClose={closeDialog} fullWidth maxWidth="sm">
        <form onSubmit={submit}>
          <DialogTitle>{dialog.contact ? "Editar contato" : "Novo contato"}</DialogTitle>
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
              inputProps={{ minLength: 2, maxLength: 120 }}
              fullWidth
              required
            />
            <TextField
              label="Telefone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              inputProps={{ minLength: 8, maxLength: 30 }}
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
        </form>
      </Dialog>
    </section>
  );
};
