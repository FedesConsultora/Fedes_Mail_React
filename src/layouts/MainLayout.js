import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import UserHeader from '../components/UserHeader'; // 👈 Asegurate de tener este import
import { useUser } from '../contexts/UserContext';


const MainLayout = ({ children }) => {
  const { user, loading } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsCollapsed(window.innerWidth < 1080);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading || !user) return null; // 🛑 Evitamos flashes mientras carga

  return (
    <div className="layout">
      <Sidebar isCollapsed={isCollapsed} />
      <main className="mainContent">
        <UserHeader />
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
