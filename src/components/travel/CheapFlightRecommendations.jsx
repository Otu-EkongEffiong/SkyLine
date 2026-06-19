import React, { useEffect, useState } from 'react';
import { Plane, TrendingDown, ExternalLink, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const POPULAR_DESTINATIONS = [
  { code: 'BCN', city: 'Barcelona', country: 'Spain', emoji: '🇪🇸' },
  { code: 'BKK', city: 'Bangkok', country: 'Thailand', emoji: '🇹🇭' },
  { code: 'DXB', city: 'Dubai', country: 'UAE', emoji: '🇦🇪' },
  { code: 'LIS', city: 'Lisbon', country: 'Portugal', emoji: '🇵🇹' },
  { code: 'CDG', city: 'Paris', country: 'France', emoji: '🇫🇷' },
  { code: 'AMS', city: 'Amsterdam', country: 'Netherlands', emoji: '🇳🇱' },
  { code: 'FCO', city: 'Rome', country: 'Italy', emoji: '🇮🇹' },
  { code: 'PRG', city: 'Prague', country: 'Czech Republic', emoji: '🇨🇿' },
];

function getNextMonth() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

export default function CheapFlightRecommendations({ homeAirport }) {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!homeAirport?.code || fetched) return;
    fetchDeals();
  }, [homeAirport]);

  const fetchDeals = async () => {
    setLoading(true);
    setFetched(true);
    const departureDate = getNextMonth();
    const results = [];

    // Pick 4 random destinations to keep API calls minimal
    const targets = [...POPULAR_DESTINATIONS]
      .sort(() => Math.random() - 0.5)
      .slice(0, 4)
      .filter(d => d.code !== homeAirport?.code);

    await Promise.all(targets.map(async (dest) => {
      try {
        const offers = [];
        const cheapest = offers.reduce((a, b) => (a.price < b.price ? a : b));
        results.push({
          destination: dest,
          price: cheapest.price,
          currency: cheapest.currency || 'EUR',
        });
      } catch {
        // skip failed destinations silently
      }
    }));

    setDeals(results.sort((a, b) => a.price - b.price));
    setLoading(false);
  };

  if (!homeAirport?.code) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 pb-6">
      <div className="flex items-center gap-2 mb-3">
        <TrendingDown className="w-5 h-5 text-sky-500" />
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Cheap Flights from {homeAirport.city || homeAirport.code}</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 gap-3 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Finding deals…</span>
        </div>
      ) : deals.length === 0 ? (
        <div className="text-center py-6 text-slate-400 text-sm">
          No deals found right now. Try again later.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {deals.map((deal, i) => (
            <motion.a
              key={deal.destination.code}
              href={`https://www.kiwi.com/en/search/results/${homeAirport.code}-airport/${deal.destination.code}-airport`}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex flex-col bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow active:scale-95"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xl">{deal.destination.emoji}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">{deal.destination.city}</p>
              <p className="text-xs text-slate-400 mb-2">{deal.destination.country}</p>
              <div className="flex items-center gap-1 mt-auto">
                <Plane className="w-3 h-3 text-sky-500" />
                <span className="text-sky-600 dark:text-sky-400 font-bold text-sm">
                  from {deal.currency} {Math.round(deal.price)}
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </div>
  );
}