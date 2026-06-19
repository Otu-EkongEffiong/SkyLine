import React from 'react';
import { Plane, Clock, AlertTriangle, CheckCircle, Info, Ticket, Shield } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
import { getFlagEmoji } from './PassportSelector';

const EXCHANGE_RATES = {
  USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.50, CNY: 7.24,
  AUD: 1.53, CAD: 1.35, CHF: 0.88, INR: 83.12, AED: 3.67, SAR: 3.75,
};
const CURRENCY_SYMBOLS = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥',
  AUD: 'A$', CAD: 'C$', CHF: 'Fr', INR: '₹', AED: 'د.إ', SAR: 'ر.س',
};

function formatPrice(priceUSD) {
  const currency = localStorage.getItem('preferredCurrency') || 'USD';
  const rate = EXCHANGE_RATES[currency] || 1;
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  const converted = priceUSD * rate;
  if (currency === 'JPY' || currency === 'CNY') return `${symbol}${Math.round(converted)}`;
  return `${symbol}${converted.toFixed(0)}`;
}

// ── Visa status helpers ────────────────────────────────────────────────────

function visaColor(status) {
  switch (status) {
    case 'visa_free':       return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'has_visa':        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'visa_on_arrival': return 'bg-amber-100  text-amber-700  border-amber-200';
    case 'evisa':           return 'bg-sky-100    text-sky-700    border-sky-200';
    case 'visa_required':   return 'bg-red-100    text-red-700    border-red-200';
    default:                return 'bg-slate-100  text-slate-600  border-slate-200';
  }
}

function visaLabel(status) {
  switch (status) {
    case 'visa_free':       return 'Visa Free';
    case 'has_visa':        return 'Have Visa';
    case 'visa_on_arrival': return 'Visa on Arrival';
    case 'evisa':           return 'e-Visa Available';
    case 'visa_required':   return 'Visa Required';
    default:                return 'Check Requirements';
  }
}

// Score → user-friendly label
function accessibilityLabel(visaScore, isRecommended) {
  if (isRecommended)       return { label: 'Easiest for your passport', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' };
  if (visaScore <= 2)      return { label: 'Minor visa steps needed',   color: 'text-amber-700',   bg: 'bg-amber-50  border-amber-200' };
  if (visaScore <= 5)      return { label: 'Some visa friction',        color: 'text-orange-700',  bg: 'bg-orange-50 border-orange-200' };
  return                          { label: 'Challenging for your passport', color: 'text-red-700', bg: 'bg-red-50    border-red-200' };
}

// ── RouteCard ──────────────────────────────────────────────────────────────

// Central affiliate config — swap this URL with your actual affiliate link when ready
// You can also accept `affiliateBaseUrl` as a prop to override per-use
const DEFAULT_AFFILIATE_BASE = 'https://www.kiwi.com/en/search/results';

function buildAffiliateUrl(route, affiliateBaseUrl) {
  const base = affiliateBaseUrl || DEFAULT_AFFILIATE_BASE;
  const origin = route.segments[0]?.origin || '';
  const destination = route.segments[route.segments.length - 1]?.destination || '';
  return `${base}/${origin}-airport/${destination}-airport`;
}

export default function RouteCard({ route, index, affiliateBaseUrl }) {
  const hasPassportContext = route.visaScore !== undefined;
  const accessibility = hasPassportContext
    ? accessibilityLabel(route.visaScore, route.isRecommended)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, boxShadow: '0 12px 32px rgba(0,0,0,0.10)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ delay: Math.min(index * 0.07, 0.5), duration: 0.18, ease: 'easeOut' }}
      className={cn(
        "bg-white dark:bg-slate-800 rounded-2xl border p-5 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300",
        route.isRecommended
          ? "border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-100 dark:ring-emerald-950"
          : route.hasVisaIssue
          ? "border-red-200 dark:border-red-800"
          : "border-slate-200 dark:border-slate-700"
      )}
    >
      {/* ── Header badges ─────────────────────────────────────────────────── */}
      {hasPassportContext && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {route.isRecommended && (
            <Badge className="bg-emerald-600 text-white gap-1">
              <CheckCircle className="w-3 h-3" />
              Recommended Route
            </Badge>
          )}
          <span className={cn(
            "text-xs font-medium px-2.5 py-1 rounded-full border flex items-center gap-1",
            accessibility.bg, accessibility.color
          )}>
            <Shield className="w-3 h-3" />
            {accessibility.label}
          </span>
          {/* Destination visa status */}
          {route.destVisaStatus && route.destVisaStatus !== 'unknown' && (
            <span className={cn(
              "text-xs font-medium px-2.5 py-1 rounded-full border",
              visaColor(route.destVisaStatus)
            )}>
              Destination: {visaLabel(route.destVisaStatus)}
            </span>
          )}
        </div>
      )}

      {/* ── Flight segments ───────────────────────────────────────────────── */}
      <div className="space-y-4">
        {route.segments.map((segment, segIndex) => (
          <div key={segIndex} className={cn(
            "flex items-center gap-4",
            segIndex > 0 && "pt-4 border-t border-dashed border-slate-100 dark:border-slate-700"
            )}>
            {/* Departure */}
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">{segment.departureTime}</p>
              <p className="font-semibold text-slate-700 dark:text-slate-200">{segment.origin}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{segment.originAirport}</p>
            </div>

            {/* Flight arc */}
            <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400">{segment.duration}</p>
              <div className="w-full flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
                <div className="flex-1 border-t border-dashed border-slate-300 dark:border-slate-600 relative">
                  <Plane className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800" />
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center truncate max-w-full">
                {segment.flightNumber || segment.airline}
              </p>
            </div>

            {/* Arrival */}
            <div className="flex-1 text-right min-w-0">
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">{segment.arrivalTime}</p>
              <p className="font-semibold text-slate-700 dark:text-slate-200">{segment.destination}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{segment.destinationAirport}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Connection layovers ───────────────────────────────────────────── */}
      {route.connections?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
            {route.connections.length} Layover{route.connections.length > 1 ? 's' : ''}
          </p>
          <div className="flex flex-wrap gap-2">
            {route.connections.map((conn, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl border",
                  conn.visaStatus === 'visa_required'
                    ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                    : conn.visaStatus === 'evisa' || conn.visaStatus === 'visa_on_arrival'
                    ? "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800"
                    : "bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                )}
              >
                {conn.countryCode ? (
                  <span className="text-base shrink-0">{getFlagEmoji(conn.countryCode)}</span>
                ) : (
                  <Plane className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{conn.city}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      <Clock className="w-3 h-3 inline mr-0.5" />
                      {conn.layoverTime}
                    </span>
                    {conn.visaStatus && conn.visaStatus !== 'unknown' && (
                      <span className={cn(
                        "text-[10px] font-medium px-1.5 py-0.5 rounded border",
                        visaColor(conn.visaStatus)
                      )}>
                        {visaLabel(conn.visaStatus)}
                      </span>
                    )}
                  </div>
                </div>
                {conn.visaStatus === 'visa_required' && (
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Visa warning banner ───────────────────────────────────────────── */}
      {route.hasVisaIssue && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 dark:text-red-100 text-sm">Visa required for this route</p>
            <p className="text-xs text-red-600 dark:text-red-300 mt-0.5">
              One or more stops require a visa you don't currently hold. 
              Routes above are sorted by easiest access for your passport.
            </p>
          </div>
        </div>
      )}

      {/* ── e-Visa / VOA tip ─────────────────────────────────────────────── */}
      {!route.hasVisaIssue && route.visaScore > 0 && (
        <div className="mt-4 p-3 bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 rounded-xl flex items-start gap-3">
          <Info className="w-4 h-4 text-sky-500 dark:text-sky-400 shrink-0 mt-0.5" />
          <p className="text-xs text-sky-800 dark:text-sky-200">
            Some stops on this route offer e-Visa or Visa on Arrival — you can arrange these online before travel.
          </p>
        </div>
      )}

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Total duration</p>
          <p className="font-semibold text-slate-800 dark:text-slate-100">{route.totalDuration}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 dark:text-slate-500">From</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatPrice(route.price)}</p>
        </div>
        <motion.div whileTap={{ scale: 0.94 }} transition={{ duration: 0.15 }}>
          <Button
            className={cn(
              "shrink-0",
              route.isRecommended
                ? "bg-orange-500 hover:bg-orange-600"
                : "bg-sky-500 hover:bg-sky-600"
            )}
            onClick={() => {
              const url = buildAffiliateUrl(route, affiliateBaseUrl);
              window.open(url, '_blank', 'noopener,noreferrer');
            }}
          >
            <Ticket className="w-4 h-4 mr-2" />
            Book Now
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}