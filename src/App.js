// App.js
import './styles/scss/main.scss';
import AppRouter from './routes/AppRouter';
import UserProvider, { useUser } from './contexts/UserContext';
import { ToastProvider } from './contexts/ToastContext';
import Loader from './components/Loader';

function AppContent() {
  const { loading } = useUser();
  if (loading) return <Loader message="Cargando perfil y entorno…" />;
  return <AppRouter />;
}

function App() {
  return (
    <div className="App">
      <ToastProvider>
        <UserProvider>
          <AppContent />
        </UserProvider>
      </ToastProvider>
    </div>
  );
}

export default App;
