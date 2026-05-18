import {
  Alert,
  Box,
  Button,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import { FormEvent, useState } from "react";
import { BrandMark } from "../components/BrandMark";
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
    <main className="grid min-h-screen bg-app text-base-fg lg:grid-cols-[1.08fr_0.92fr]">
      <aside
        className="relative hidden min-h-screen flex-col justify-between overflow-hidden border-r border-line bg-soft p-10 lg:flex"
        style={{
          background:
            "radial-gradient(circle at 18% 18%, rgba(167,139,250,.28), transparent 34%), radial-gradient(circle at 85% 82%, rgba(109,40,217,.28), transparent 35%), var(--bg-soft)"
        }}
      >
        <div className="relative z-10 flex items-center gap-3">
          <BrandMark size={32} />
          <Typography variant="subtitle1" fontWeight={900}>
            Broadcast
          </Typography>
        </div>

        <div className="relative z-10 max-w-xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-p">
            Plataforma multi-tenant
          </p>
          <Typography
            component="h1"
            sx={{ fontSize: 48, lineHeight: 1.03, letterSpacing: 0, fontWeight: 900 }}
          >
            Uma caixa de mensagens para cada cliente seu.
          </Typography>
          <Typography className="mt-5 max-w-md leading-relaxed text-muted">
            Conexoes isoladas, contatos organizados e agendamentos em tempo real com
            Firebase Auth, Firestore e Functions.
          </Typography>

          <div className="mt-10 grid grid-cols-3 gap-4">
            <AuthStat label="Conexoes" value="SaaS" hint="por cliente" />
            <AuthStat label="Tempo real" value="Live" hint="onSnapshot" />
            <AuthStat label="Seguranca" value="Rules" hint="ownerId" />
          </div>
        </div>

        <div className="relative z-10 font-mono text-xs text-dim">
          firebase + firestore + functions
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(circle at 72% 30%, black, transparent 62%)"
          }}
        />
      </aside>

      <section className="grid place-items-center px-5 py-8 sm:px-10">
        <Box className="w-full max-w-[420px]">
          <div className="mb-7 flex items-center gap-3 lg:hidden">
            <BrandMark size={30} />
            <Typography variant="subtitle1" fontWeight={900}>
              Broadcast
            </Typography>
          </div>

          <Typography variant="h4" fontWeight={900}>
            {labels[mode].title}
          </Typography>
          <Typography className="mt-2 text-muted">
            {labels[mode].helper}
          </Typography>

          <Tabs
            value={mode}
            onChange={(_, nextMode: AuthMode) => {
              setMode(nextMode);
              setError(null);
            }}
            variant="fullWidth"
            className="mb-5 mt-6"
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
              className="h-12"
              disabled={loading || !isFirebaseConfigured}
            >
              {loading ? "Aguarde..." : labels[mode].action}
            </Button>
          </Box>
        </Box>
      </section>
    </main>
  );
};

const AuthStat = ({ label, value, hint }: { label: string; value: string; hint: string }) => (
  <div className="border-l border-strong pl-3">
    <div className="text-[11px] font-semibold uppercase tracking-wider text-dim">{label}</div>
    <div className="mt-1 font-mono text-2xl font-bold">{value}</div>
    <div className="mt-0.5 text-xs text-muted">{hint}</div>
  </div>
);
