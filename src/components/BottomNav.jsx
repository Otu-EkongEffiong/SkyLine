// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { User, Search, Plane, Settings } from 'lucide-react';
import { useTranslation } from '@/components/translations';
import { getAlertCount } from '@/components/travel/VisaAlerts';
import { useTabNavigation, TAB_ROOTS } from '@/lib/TabNavigationContext';

export default function BottomNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const { navigateToTab } = useTabNavigation();

  const [profile, setProfile] = useState(() => {
    try {
      const raw = localStorage.getItem('skypath_user_profile');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  useEffect(() => {
    const onStorage = () => {
      try {
        const raw = localStorage.getItem('skypath_user_profile');
        setProfile(raw ? JSON.parse(raw) : null);
      } catch {}
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const alertCount = profile ? getAlertCount(profile) : { total: 0, critical: 0, warning: 0 };
  const showBadge  = alertCount.critical > 0 || alertCount.warning > 0;

  const navItems = [
    { name: 'Profile',  label: t('profiles') || 'Profiles', icon: User,     badge: showBadge ? alertCount.critical + alertCount.warning : 0 },
    { name: 'Home',     label: t('search')   || 'Search',   icon: Search },
    { name: 'MyTrips',  label: 'My Trips',                  icon: Plane },
    { name: 'Settings', label: 'Settings',                  icon: Settings },
  ];

  const isActive = (tabName) => {
    const root = TAB_ROOTS[tabName];
    return location.pathname === root || location.pathname.startsWith(root + '/');
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-background dark:bg-slate-900 border-t border-border dark:border-slate-800 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-7xl mx-auto px-2">
        <div className="flex items-stretch justify-around">
          {navItems.map((item) => {
            const Icon   = item.icon;
            const active = isActive(item.name);

            return (
              <button
                key={item.name}
                onClick={() => navigateToTab(item.name)}
                // min 44×44 touch target
                className={`
                  flex flex-col items-center justify-center gap-1 flex-1
                  min-h-[56px] min-w-[44px] py-2 px-1
                  transition-colors relative
                  active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400
                  ${active
                    ? 'text-sky-500 dark:text-sky-400'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                  }
                `}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : ''}`} />
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-xs leading-tight ${active ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}