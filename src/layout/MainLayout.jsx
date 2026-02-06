// src/layout/MainLayout.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom'; 
import Navbar from '../components/common/Navbar'; 
import Footer from '../components/common/Footer';
import Chatbot from '../components/ui/Chatbot';

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
      {/* Chatbot floating UI */}
      <React.Suspense fallback={null}>
        {typeof window !== 'undefined' && (
          <Chatbot />
        )}
      </React.Suspense>
    </div>
  );
};

export default MainLayout;