import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';

const MainLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Función para evaluar el tamaño de la pantalla
  const handleResize = () => {
    if (window.innerWidth < 1080) {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }
  };

  useEffect(() => {
    handleResize(); // Seteo inicial
    window.addEventListener('resize', handleResize);

    // Cleanup del event listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="layout">
      <Sidebar isCollapsed={isCollapsed} />
      <main className="mainContent">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
