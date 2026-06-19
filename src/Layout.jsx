import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import PageTransition from '@/components/PageTransition';
import SplashScreen from '@/components/SplashScreen';

export default function Layout({ children, currentPageName }) {
  const [isRTL, setIsRTL] = React.useState(false);
  const [showSplash, setShowSplash] = React.useState(false);
  const [exitingSplash, setExitingSplash] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    setIsRTL(localStorage.getItem('language') === 'ar');
  }, []);

  React.useEffect(() => {
    const checkAuth = async () => {
      try { 
        setIsAuthenticated(true);
        setShowSplash(true);
        const timer = setTimeout(() => {
          setExitingSplash(true);
        }, 2800);
        return () => clearTimeout(timer);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, [isAuthenticated]);

  const handleSplashExit = () => {
    setShowSplash(false);
  };

  // Terms gate: redirect to AcceptTerms if user hasn't accepted yet
  React.useEffect(() => {
    if (currentPageName === 'AcceptTerms') return;
    (async () => {
      try {
        if (!isAuthenticated) {
          navigate('/AcceptTerms');
        }
      } catch {
        if (!isAuthenticated) {
          navigate('/AcceptTerms');
        }
      }
    })();
  }, [currentPageName, isAuthenticated]);

  // Auto-apply dark class based on system preference
  React.useEffect(() => {
    const root = document.documentElement;
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      root.classList.add('dark');
    } else if (saved === 'light') {
      root.classList.remove('dark');
    } else {
      // fallback to system preference
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      if (mq.matches) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950" dir={isRTL ? 'rtl' : 'ltr'}>
      <style>{`
        :root {
          --color-primary: 63 169 245;   /* Sky Blue #3FA9F5 */
          --color-primary-dark: 20 184 166; /* Teal #14B8A6 */
        }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        @media (pointer: fine) {
          ::-webkit-scrollbar { width: 8px; height: 8px; }
          ::-webkit-scrollbar-track { background: #f1f5f9; }
          ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        }
        .dark ::-webkit-scrollbar-track { background: #0f172a; }
        .dark ::-webkit-scrollbar-thumb { background: #334155; }
        .dark ::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
      {showSplash && <SplashScreen isExiting={exitingSplash} onExitComplete={handleSplashExit} />}
      <PageTransition>{children}</PageTransition>
    </div>
  );
}