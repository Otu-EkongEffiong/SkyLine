import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isAfter, isBefore, startOfDay } from 'date-fns';
import { useTranslation } from '@/components/translations';

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
  const convertedPrice = priceUSD * EXCHANGE_RATES[currency];
  const symbol = CURRENCY_SYMBOLS[currency];
  
  if (currency === 'JPY' || currency === 'CNY') {
    return `${symbol}${Math.round(convertedPrice)}`;
  }
  return `${symbol}${convertedPrice.toFixed(0)}`;
}

export default function FlightCalendar({ priceData, onDateSelect, selectedDate }) {
  const { t } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get day of week for first day (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = monthStart.getDay();
  
  // Add empty cells for days before month starts
  const leadingEmptyDays = Array(firstDayOfWeek).fill(null);
  
  const allDays = [...leadingEmptyDays, ...daysInMonth];

  const getPriceForDate = (date) => {
    if (!date || !priceData) return null;
    const dateStr = format(date, 'yyyy-MM-dd');
    return priceData[dateStr];
  };

  const getLowestPrice = () => {
    if (!priceData) return null;
    const prices = Object.values(priceData).filter(p => p !== null);
    return prices.length > 0 ? Math.min(...prices) : null;
  };

  const getHighestPrice = () => {
    if (!priceData) return null;
    const prices = Object.values(priceData).filter(p => p !== null);
    return prices.length > 0 ? Math.max(...prices) : null;
  };

  const getPriceColor = (price) => {
    if (!price || !priceData) return null;
    const lowest = getLowestPrice();
    const highest = getHighestPrice();
    if (lowest === null || highest === null) return null;
    
    const range = highest - lowest;
    const position = (price - lowest) / range;
    
    if (position < 0.33) {
      return { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700' };
    } else if (position < 0.67) {
      return { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700' };
    } else {
      return { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700' };
    }
  };

  const lowestPrice = getLowestPrice();

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const isPastDate = (date) => {
    if (!date) return false;
    return isBefore(startOfDay(date), startOfDay(new Date()));
  };

  return (
    <Card className="p-6 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-sky-600" />
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-2">
        {allDays.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const price = getPriceForDate(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isPast = isPastDate(day);
          const hasPrice = price !== null && price !== undefined;
          const priceColor = hasPrice ? getPriceColor(price) : null;

          return (
            <button
              key={day.toISOString()}
              onClick={() => !isPast && hasPrice && onDateSelect(day)}
              disabled={isPast || !hasPrice}
              className={cn(
                "aspect-square p-2 rounded-lg border-2 transition-all relative group",
                "flex flex-col items-center justify-center",
                isCurrentMonth ? "border-slate-200" : "border-slate-100",
                !isPast && hasPrice && "hover:border-emerald-400 hover:shadow-sm cursor-pointer",
                isPast && "opacity-40 cursor-not-allowed",
                !hasPrice && "opacity-50 cursor-not-allowed",
                isSelected && "border-emerald-500 bg-emerald-100 ring-2 ring-emerald-200",
                !isSelected && priceColor && priceColor.bg,
                !isSelected && priceColor && priceColor.border
              )}
            >
              <span className={cn(
                "text-sm font-medium mb-1",
                isCurrentMonth ? "text-slate-900" : "text-slate-400",
                isPast && "text-slate-400"
              )}>
                {format(day, 'd')}
              </span>
              
              {hasPrice && (
                <span className={cn(
                  "text-xs font-semibold",
                  isSelected ? "text-emerald-900" : priceColor?.text
                )}>
                  {formatPrice(price)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span className="text-slate-600">Cheapest</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded" />
          <span className="text-slate-600">Mid-range</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded" />
          <span className="text-slate-600">Most expensive</span>
        </div>
      </div>
    </Card>
  );
}