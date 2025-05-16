import React from 'react';
import './styles/scss/main.scss';
import AppRouter from './routes/AppRouter';
import UserProvider from './contexts/UserContext';
import { ToastProvider } from './contexts/ToastContext';

function App() {
  return (
    <div className="App">
      <UserProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </UserProvider>
    </div>
  );
}

export default App;
