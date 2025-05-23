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

  if (loading || !user) return null; // 🛑 Evitamos flashes mientras carga

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
