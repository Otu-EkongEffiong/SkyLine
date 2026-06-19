// @ts-nocheck
/**
 * TabNavigationContext
 * Preserves the last-visited path for each tab so switching tabs
 * restores where the user was rather than always going to the root.
 */
import React, { createContext, useContext, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Tab root paths (must match BottomNav)
export const TAB_ROOTS = {
  Profile:  '/Profile',
  Home:     '/',
  MyTrips:  '/MyTrips',
  Settings: '/Settings',
};

const TabNavigationContext = createContext(null);

export function TabNavigationProvider({ children }) {
  // Remember the last path visited in each tab
  const tabHistory = useRef({
    Profile:  '/Profile',
    Home:     '/',
    MyTrips:  '/MyTrips',
    Settings: '/Settings',
  });

  const navigate  = useNavigate();
  const location  = useLocation();

  /** Called by BottomNav when a tab icon is tapped */
  const navigateToTab = useCallback((tabName) => {
    const rootPath = TAB_ROOTS[tabName];
    const currentPath = location.pathname;

    // Determine which tab is currently active
    const isActiveTab = Object.entries(TAB_ROOTS).some(
      ([name, root]) => name === tabName && (currentPath === root || currentPath.startsWith(root + '/'))
    );

    if (isActiveTab) {
      // Re-tap active tab → reset to root
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (currentPath !== rootPath) navigate(rootPath);
    } else {
      // Save current position for the active tab before leaving
      const activeTabName = Object.keys(TAB_ROOTS).find(name => {
        const root = TAB_ROOTS[name];
        return currentPath === root || currentPath.startsWith(root + '/');
      });
      if (activeTabName) {
        tabHistory.current[activeTabName] = currentPath;
      }
      // Restore saved position for the destination tab
      const savedPath = tabHistory.current[tabName] || rootPath;
      navigate(savedPath);
    }
  }, [location.pathname, navigate]);

  /** Pages within a tab call this to update the saved path */
  const updateTabHistory = useCallback((tabName, path) => {
    if (tabName && path) {
      tabHistory.current[tabName] = path;
    }
  }, []);

  return (
    <TabNavigationContext.Provider value={{ navigateToTab, updateTabHistory, tabHistory }}>
      {children}
    </TabNavigationContext.Provider>
  );
}

export function useTabNavigation() {
  return useContext(TabNavigationContext);
}