import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Sparkles, Calendar, Clock, TrendingDown, AlertCircle, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { addDays, format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIFlightSuggestions({ currentSearch, profile, onSearchModification }) {
  const [expanded, setExpanded] = useState(false);
  const [suggestions] = useState(() => generateAISuggestions(currentSearch, profile));

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-purple-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-purple-900">AI Travel Assistant</p>
            <p className="text-sm text-purple-700">
              {suggestions.length} smart suggestion{suggestions.length > 1 ? 's' : ''} to optimize your trip
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-purple-600" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-purple-100"
          >
            <CardContent className="p-4 space-y-3">
              {suggestions.map((suggestion, index) => (
                <Alert key={index} className="border-purple-200 bg-white">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{suggestion.icon}</div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`text-xs ${suggestion.badgeColor}`}>
                            {suggestion.category}
                          </Badge>
                          {suggestion.savings && (
                            <Badge variant="outline" className="text-xs text-green-700 border-green-300">
                              Save {suggestion.savings}
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-semibold text-sm text-slate-900">{suggestion.title}</h4>
                      </div>
                      <AlertDescription className="text-xs text-slate-700">
                        {suggestion.description}
                      </AlertDescription>
                      {suggestion.action && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 gap-2"
                          onClick={() => onSearchModification(suggestion.action)}
                        >
                          {suggestion.actionLabel}
                        </Button>
                      )}
                    </div>
                  </div>
                </Alert>
              ))}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function generateAISuggestions(search, profile) {
  if (!search) return [];
  
  const suggestions = [];
  const departureDate = new Date(search.departureDate);
  const today = new Date();
  const daysUntilDeparture = Math.floor((departureDate - today) / (1000 * 60 * 60 * 24));

  // Visa processing time suggestion
  if (profile?.passport_country && daysUntilDeparture < 21) {
    const hasVisaIssues = checkVisaRequirements(search.destination, profile);
    if (hasVisaIssues) {
      suggestions.push({
        icon: <Clock className="w-5 h-5 text-amber-600" />,
        category: 'Visa Processing',
        badgeColor: 'bg-amber-100 text-amber-700',
        title: 'Consider Travel Dates for Visa Processing',
        description: `Your departure is in ${daysUntilDeparture} days. Standard visa processing takes 10-15 business days. Consider booking a later date to ensure your visa is approved in time.`,
        action: { type: 'shift_dates', days: 21 },
        actionLabel: 'See Flights After Feb 28'
      });
    }
  }

  // Price optimization suggestion
  const dayOfWeek = departureDate.getDay();
  if (dayOfWeek === 6 || dayOfWeek === 0) { // Weekend
    suggestions.push({
      icon: <TrendingDown className="w-5 h-5 text-green-600" />,
      category: 'Price Optimization',
      badgeColor: 'bg-green-100 text-green-700',
      title: 'Fly Mid-Week to Save Money',
      savings: '$150-200',
      description: 'Flying on Tuesday or Wednesday is typically 30% cheaper. Consider adjusting your travel dates for significant savings.',
      action: { type: 'suggest_weekday' },
      actionLabel: 'View Weekday Flights'
    });
  }

  // Alternative route suggestion based on visa status
  if (profile?.visas?.length > 0) {
    const visaCountries = profile.visas.map(v => v.country_code);
    if (visaCountries.includes('AE') || visaCountries.includes('QA')) {
      suggestions.push({
        icon: <Sparkles className="w-5 h-5 text-purple-600" />,
        category: 'Alternative Route',
        badgeColor: 'bg-purple-100 text-purple-700',
        title: 'More Route Options Available',
        description: `You have visas that unlock ${visaCountries.length + 2} additional connection hubs. We're showing you routes through these countries you can already access.`,
      });
    }
  }

  // Booking window suggestion
  if (daysUntilDeparture > 90) {
    suggestions.push({
      icon: <Calendar className="w-5 h-5 text-blue-600" />,
      category: 'Booking Timing',
      badgeColor: 'bg-blue-100 text-blue-700',
      title: 'Early Booking Detected',
      description: 'Prices typically drop 45-60 days before departure. Consider setting a price alert or waiting a few weeks for better deals.',
    });
  } else if (daysUntilDeparture < 7) {
    suggestions.push({
      icon: <AlertCircle className="w-5 h-5 text-red-600" />,
      category: 'Last Minute',
      badgeColor: 'bg-red-100 text-red-700',
      title: 'Last-Minute Booking Alert',
      description: 'Prices are highest within 7 days of departure. Book immediately if you find an acceptable fare, as prices will likely increase.',
    });
  }

  return suggestions;
}

function checkVisaRequirements(destination, profile) {
  // Simplified check - in real app would check actual requirements
  const visaRequiredCountries = ['CN', 'IN', 'RU', 'BR'];
  const destinationCountry = destination.code?.substring(0, 2) || '';
  
  if (visaRequiredCountries.includes(destinationCountry)) {
    const hasVisa = profile?.visas?.some(v => v.country_code === destinationCountry);
    return !hasVisa;
  }
  
  return false;
}