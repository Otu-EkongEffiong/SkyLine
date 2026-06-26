// @ts-nocheck
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle, Globe, AlertTriangle, Map } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useTranslation } from '@/components/translations';
import FlightSearchForm from '@/components/travel/FlightSearchForm';
import { getFlagEmoji, COUNTRIES } from '@/components/travel/PassportSelector';
import { createPageUrl } from '@/utils';
import BottomNav from '@/components/BottomNav';
import { saveSearch } from '@/lib/searchStorage';
import { loadUserProfile } from '@/lib/profileStorage';

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);

  const userProfile = loadUserProfile();
  const profile = getActiveTravelProfile(userProfile);
  const passportCountry = profile?.passport_country
    ? COUNTRIES.find((c) => c.code === profile.passport_country)
    : null;

  const handleSearch = async (searchData) => {
    setIsSearching(true);
    saveSearch(searchData);
    navigate(createPageUrl('SearchResults'));
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950 pb-20">
      <div className="relative overflow-hidden bg-gradient-to-br from-sky-400 via-sky-500 to-teal-500 dark:from-sky-600 dark:via-sky-700 dark:to-teal-700">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80')] bg-cover bg-center opacity-10" />

        <div className="relative max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <img src="/src/assets/icon.svg" alt="SkyLine" className="h-14 w-auto object-contain" />
            <Link to={createPageUrl('LiveMap')}>
              <Button variant="secondary" size="sm" className="gap-2 bg-white/20 border-white/30 text-white hover:bg-white/30">
                <Map className="w-4 h-4" />
                Live Map
              </Button>
            </Link>
          </div>

          <div className="text-center mb-8">
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-bold text-white mb-3">
              {t('heroTitle')}
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg text-white/90 max-w-2xl mx-auto">
              {t('heroSubtitle')}
            </motion.p>
          </div>

          {!userProfile?.travel_profiles?.length && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-3xl mx-auto mb-6">
              <Alert className="bg-white/20 border-white/30 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-white" />
                <AlertDescription className="ml-2 text-white">
                  <Link to={createPageUrl('Profile')} className="underline hover:no-underline font-semibold">{t('setUp')}</Link>
                  {' '}{t('setupAlert')}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <FlightSearchForm onSearch={handleSearch} isSearching={isSearching} defaultOrigin={profile?.home_airport || null} />
          </motion.div>

          {passportCountry && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-4 flex items-center justify-center gap-3 text-sm">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/30">
                <span className="text-base">{getFlagEmoji(profile.passport_country)}</span>
                <span className="text-white font-medium">{passportCountry.name}</span>
              </div>
              {profile.visas?.length > 0 && (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/30">
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span className="text-white font-medium">{profile.visas.length} visa{profile.visas.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      <div className="bg-background dark:bg-slate-950 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">{t('whySkyPath')}</h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">{t('builtFor')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Globe, title: t('visaAwareRouting'), description: t('visaAwareDesc') },
              { icon: CheckCircle, title: t('smartRecommendations'), description: t('smartRecommendationsDesc') },
              { icon: AlertTriangle, title: t('noSurprises'), description: t('noSurprisesDesc') },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-card dark:bg-slate-800 rounded-xl p-6 border border-border dark:border-slate-700"
              >
                <feature.icon className="w-6 h-6 text-sky-500 mb-4" />
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">{feature.title}</h4>
                <p className="text-slate-600 dark:text-slate-300 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
