import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import { FormEvent, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { isFirebaseConfigured } from "../lib/firebase";

type AuthMode = "login" | "signup";

const labels = {
  login: {
    title: "Entrar",
    action: "Entrar",
    helper: "Acesse sua area de broadcast."
  },
  signup: {
    title: "Cadastrar",
    action: "Criar conta",
    helper: "Crie uma area isolada para o seu cliente."
  }
};

export const AuthPage = () => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Nao foi possivel autenticar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-paper px-4 py-8">
      <Paper className="w-full max-w-md p-6 shadow-sm" variant="outlined">
        <Box className="mb-5 flex flex-col items-center gap-3">
          <Avatar sx={{ bgcolor: "primary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Box className="text-center">
            <Typography variant="h5" fontWeight={800}>
              Broadcast
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {labels[mode].helper}
            </Typography>
          </Box>
        </Box>

        <Tabs
          value={mode}
          onChange={(_, nextMode: AuthMode) => {
            setMode(nextMode);
            setError(null);
          }}
          variant="fullWidth"
          className="mb-5"
        >
          <Tab label="Login" value="login" />
          <Tab label="Cadastro" value="signup" />
        </Tabs>

        <Box component="form" onSubmit={submit} className="space-y-4">
          {!isFirebaseConfigured ? (
            <Alert severity="warning">
              Configure o Firebase em web/.env.local antes de autenticar.
            </Alert>
          ) : null}
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField
            label="E-mail"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            fullWidth
            required
          />
          <TextField
            label="Senha"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            inputProps={{ minLength: 6 }}
            fullWidth
            required
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading || !isFirebaseConfigured}
          >
            {loading ? "Aguarde..." : labels[mode].action}
          </Button>
        </Box>
      </Paper>
    </main>
  );
};
