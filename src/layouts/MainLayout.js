import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import UserHeader from '../components/UserHeader'; 
import { useUser } from '../contexts/UserContext';
import ComposeModal from '../components/ComposeModal';

const MainLayout = ({ children }) => {
  const { user, loading } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showCompose, setShowCompose] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsCollapsed(window.innerWidth < 1080);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 🔥 Eliminamos el chatbot de Odoo LiveChat
  useEffect(() => {
    const interval = setInterval(() => {
      const chatButton = document.querySelector('.btn.o-livechat-LivechatButton');
      const chatRoot = document.querySelector('.o-livechat-root');
      if (chatButton) chatButton.remove();
      if (chatRoot) chatRoot.remove();
    }, 500);

    return () => clearInterval(interval);
  }, []);

  if (loading || !user) return null;

  return (
    <div className="layout">
      <Sidebar isCollapsed={isCollapsed} onComposeClick={() => setShowCompose(true)} />
      <main className="mainContent">
        <UserHeader />
        {children}
      </main>

      {showCompose && (
        <ComposeModal
          modo="modal"
          onClose={() => setShowCompose(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;
