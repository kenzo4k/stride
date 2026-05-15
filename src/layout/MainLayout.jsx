// src/layout/MainLayout.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom'; 
import Navbar from '../components/common/Navbar'; 
import Footer from '../components/common/Footer';

const MainLayout = () => {
  
  const location = useLocation();

  
  const pathsWithoutFooter = ['/login', '/register'];

 
  const showFooter = !pathsWithoutFooter.includes(location.pathname);

  return (
    <div>
      <Navbar />
      <main className="min-h-[calc(100vh-250px)]">
        <Outlet />
      </main>
      
      
      {showFooter && <Footer />}
    </div>
  );
};

export default MainLayout;