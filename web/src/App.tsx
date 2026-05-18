import { CircularProgress } from "@mui/material";
import { useAuth } from "./context/AuthContext";
import { AuthPage } from "./pages/AuthPage";
import { Dashboard } from "./pages/Dashboard";

const App = () => {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper">
        <CircularProgress />
      </main>
    );
  }

  return user ? <Dashboard /> : <AuthPage />;
};

export default App;
