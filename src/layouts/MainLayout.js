import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import UserHeader from '../components/UserHeader'; // 👈 Asegurate de tener este import

const MainLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleResize = () => {
    if (window.innerWidth < 1080) {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="layout">
      <Sidebar isCollapsed={isCollapsed} />
      <main className="mainContent">
        <UserHeader /> {/* ✅ Esta línea tiene que estar DENTRO del return */}
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
