import { ReactNode } from 'react';
import TopBar from './TopBar';
import SideMenu from './SideMenu';
import { Outlet } from 'react-router-dom';

function DashboardLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar />
      <div style={{ display: 'flex', flex: 1 }}>
        <SideMenu />
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          {/* This is where the child routes (pages) will render */}
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
