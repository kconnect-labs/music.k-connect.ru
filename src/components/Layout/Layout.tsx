import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import MobilePlayer from '../MobilePlayer/MobilePlayer';
import { FullScreenPlayer } from '../FullScreenPlayer';
import './Layout.css';

const Layout: React.FC = () => {
  // На десктопе сайдбар открыт по умолчанию, на мобильных - закрыт
  // Используем более надежную проверку для мобильных устройств
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // На мобильных устройствах (ширина <= 1024px) меню должно быть закрыто
    // Проверяем только ширину экрана, так как touch-события могут быть и на десктопе
    const width = window.innerWidth;
    return width > 1024;
  });

  const [fullScreenPlayerOpen, setFullScreenPlayerOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleOpenFullScreenPlayer = () => {
    setFullScreenPlayerOpen(true);
  };

  const handleCloseFullScreenPlayer = () => {
    setFullScreenPlayerOpen(false);
  };

  return (
    <div className="layout">
      <Header 
        onMenuClick={toggleSidebar} 
        onOpenFullScreenPlayer={handleOpenFullScreenPlayer}
      />
      <div className="layout-content">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={`layout-main ${sidebarOpen ? 'layout-main--with-sidebar' : ''}`}>
          <div className="layout-main-content">
            <Outlet />
          </div>
        </main>
      </div>
      <MobilePlayer onOpenFullScreenPlayer={handleOpenFullScreenPlayer} />
      <FullScreenPlayer 
        open={fullScreenPlayerOpen} 
        onClose={handleCloseFullScreenPlayer} 
      />
    </div>
  );
};

export default Layout;

