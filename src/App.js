import React from 'react';
import './styles/scss/main.scss';
import AppRouter from './routes/AppRouter';
import UserProvider from './contexts/UserContext';

function App() {
  return (
    <div className="App">
      <UserProvider>
        <AppRouter />
      </UserProvider>
    </div>
  );
}

export default App;
