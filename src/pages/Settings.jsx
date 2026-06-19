import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { 
  User, 
  Bell, 
  Globe, 
  HelpCircle, 
  Shield, 
  LogOut, 
  ChevronRight,
  Mail,
  MessageSquare,
  Bug,
  DollarSign,
  Moon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import BottomNav from '@/components/BottomNav';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslation } from '@/components/translations';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BugReportModal from '@/components/BugReportModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Info } from 'lucide-react';
import { VisaMonitoringInfo } from '@/components/travel/VisaChangeMonitor';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', flag: '🇸🇦' },
];

export default function Settings() {
  const { t } = useTranslation();
  const [currency, setCurrency] = React.useState(() => localStorage.getItem('preferredCurrency') || 'USD');
  const [bugReportOpen, setBugReportOpen] = React.useState(false);
  const [infoOpen, setInfoOpen] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(() => document.documentElement.classList.contains('dark'));

  const handleDarkModeToggle = (checked) => {
    setDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await null;
    } catch {
      await null;
    }
  };

  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem('preferredCurrency', newCurrency);
    window.location.reload(); // Reload to apply currency changes across the app
  };

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => null,
  });

  const handleLogout = () => {
    null;
  };

  const SettingsSection = ({ title, children }) => (
    <div className="space-y-3">
       <h3 className="text-sm font-semibold text-muted-foreground dark:text-slate-400 px-1">{title}</h3>
       <Card>
             <CardContent>
               {children}
             </CardContent>
           </Card>
     </div>
   );

  const SettingsItem = ({ icon: Icon, label, action, showChevron = true, children }) => (
    <div 
       className="flex items-center justify-between p-4 hover:bg-muted dark:hover:bg-slate-700 transition-colors cursor-pointer bg-card dark:bg-slate-800"
       onClick={() => action?.()}
     >
       <div className="flex items-center gap-3">
         <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-900 flex items-center justify-center">
           <Icon className="w-4 h-4 text-sky-500 dark:text-sky-400" />
         </div>
         <span className="text-sm text-foreground dark:text-slate-100">{label}</span>
       </div>
       <div className="flex items-center gap-2">
         {children}
         {showChevron && <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
       </div>
     </div>
   );

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950 text-foreground dark:text-slate-100 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
         {/* Header */}
         <div className="mb-6">
           <h1 className="text-3xl font-bold text-foreground dark:text-slate-100 mb-2">{t('settings')}</h1>
           <p className="text-muted-foreground dark:text-slate-400">{t('managePreferences')}</p>
         </div>

        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center">
                  <User className="w-8 h-8 text-sky-500 dark:text-sky-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground dark:text-slate-100">{user?.full_name || 'User'}</h3>
                  <p className="text-sm text-muted-foreground dark:text-slate-400">{user?.email}</p>
                  <div className="mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300">
                      {user?.role === 'admin' ? t('admin') : t('user')}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-6">
          {/* App Preferences */}
          <SettingsSection title={t('appPreferences')}>
            <SettingsItem 
              icon={Globe} 
              label={t('language')} 
              showChevron={false}
            >
              <LanguageSwitcher />
            </SettingsItem>
            <Separator />
            <SettingsItem 
              icon={DollarSign} 
              label="Currency" 
              showChevron={false}
            >
              <Select value={currency} onValueChange={handleCurrencyChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code}>
                      <div className="flex items-center gap-2">
                        <span>{curr.flag}</span>
                        <span>{curr.code}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingsItem>
            <Separator />
            <SettingsItem 
              icon={Moon} 
              label="Dark Mode" 
              showChevron={false}
            >
              <Switch checked={darkMode} onCheckedChange={handleDarkModeToggle} className="data-[state=unchecked]:bg-slate-200 data-[state=checked]:bg-sky-400" />
            </SettingsItem>
            <Separator />
            <SettingsItem 
              icon={Bell} 
              label={t('pushNotifications')} 
              showChevron={false}
            >
              <Switch className="data-[state=unchecked]:bg-slate-200 data-[state=checked]:bg-sky-400" />
            </SettingsItem>
            <Separator />
            <SettingsItem 
              icon={Mail} 
              label={t('emailNotifications')} 
              showChevron={false}
            >
              <Switch defaultChecked className="data-[state=unchecked]:bg-slate-200 data-[state=checked]:bg-sky-400" />
            </SettingsItem>
          </SettingsSection>

          {/* Support */}
          <SettingsSection title={t('supportHelp')}>
            <Link to={createPageUrl('HelpCenter')}>
              <SettingsItem 
                icon={HelpCircle} 
                label={t('helpCenter')} 
              />
            </Link>
            <Separator />
            <a href="mailto:customersupport@Skyline-flights.com">
              <SettingsItem 
                icon={MessageSquare} 
                label={t('contactSupport')} 
              />
            </a>
            <Separator />
            <SettingsItem 
              icon={Bug} 
              label={t('reportBugs')} 
              action={() => setBugReportOpen(true)}
            />
            <Separator />
            <Link to={createPageUrl('PrivacyPolicy')}>
              <SettingsItem icon={Shield} label={t('privacyPolicy')} />
            </Link>
          </SettingsSection>

          {/* Info */}
          <SettingsSection title="Info">
            <div>
              <SettingsItem
                icon={Info}
                label="Automated Visa Monitoring"
                action={() => setInfoOpen(o => !o)}
                showChevron={false}
              >
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${infoOpen ? 'rotate-90' : ''}`} />
              </SettingsItem>
              {infoOpen && (
                <div className="px-4 pb-4 border-t border-border dark:border-slate-700">
                  <VisaMonitoringInfo />
                </div>
              )}
            </div>
          </SettingsSection>

          {/* Account */}
          <SettingsSection title={t('account')}>
            <SettingsItem 
              icon={LogOut} 
              label={t('signOut')} 
              action={handleLogout}
              showChevron={false}
            >
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                {t('signOut')}
              </Button>
            </SettingsItem>
            <Separator />
            <div className="p-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="w-full flex items-center gap-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950 flex items-center justify-center">
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="text-sm font-medium">Delete Account</span>
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your account and all associated data including travel profiles, saved searches, and trip history. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={handleDeleteAccount}
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </SettingsSection>
        </div>

        {/* App Version */}
        <div className="text-center mt-8 text-xs text-muted-foreground dark:text-slate-400">
          Skyline v1.0.0
        </div>
      </div>

      <BugReportModal open={bugReportOpen} onClose={() => setBugReportOpen(false)} />
      <BottomNav />
    </div>
  );
}