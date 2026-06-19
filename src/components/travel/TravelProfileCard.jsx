import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, ChevronRight, CheckCircle2 } from 'lucide-react';
import { getFlagEmoji } from './PassportSelector';
import { useTranslation } from '@/components/translations';

export default function TravelProfileCard({ profile, onEdit, isActive, onSetActive }) {
  const { t } = useTranslation();
  const hasData = profile.passport_country || profile.full_name;

  return (
    <Card
      className={`relative overflow-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 ${isActive ? 'border-sky-400 border-2' : ''} hover:shadow-md transition-shadow`}
    >
      <CardHeader className="pb-3 cursor-pointer" onClick={onEdit}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {profile.passport_country && <span className="shrink-0 text-lg">{getFlagEmoji(profile.passport_country)}</span>}
                {isActive && (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 shrink-0">Active</Badge>
                )}
              </div>
              <CardTitle className="text-base leading-tight break-words">
                {profile.profile_name || (
                  <>Travel<br />Profile</>
                )}
              </CardTitle>
              {!hasData && (
                <p className="text-xs text-slate-500 mt-1 truncate">Tap to add details</p>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
          </div>
        </div>
      </CardHeader>

      {hasData && (
        <CardContent className="pt-0 pb-3">
          <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400 mb-2">
            {profile.full_name && <p className="truncate">{profile.full_name}</p>}
            {profile.passport_country_name && (
              <p className="text-xs text-slate-500 truncate">{profile.passport_country_name} Passport</p>
            )}
          </div>
          {!isActive && onSetActive && (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-7 border-sky-200 text-sky-700 hover:bg-sky-50 dark:border-sky-700 dark:text-sky-400 dark:hover:bg-sky-950"
              onClick={(e) => { e.stopPropagation(); onSetActive(); }}
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Set as Active
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
}