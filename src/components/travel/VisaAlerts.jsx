import React from 'react';
import { AlertTriangle, Calendar, Info } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { differenceInDays, parseISO } from 'date-fns';

export function getExpiringDocuments(profile) {
  if (!profile?.travel_profiles) return [];
  
  const alerts = [];
  const today = new Date();
  
  profile.travel_profiles.forEach((travelProfile) => {
    // Check passport expiration
    if (travelProfile.passport_expiry_date) {
      const daysUntilExpiry = differenceInDays(parseISO(travelProfile.passport_expiry_date), today);
      
      if (daysUntilExpiry < 0) {
        alerts.push({
          type: 'critical',
          category: 'passport',
          profileName: travelProfile.profile_name,
          message: `${travelProfile.passport_country_name} passport has expired`,
          daysRemaining: daysUntilExpiry,
          profileId: travelProfile.id
        });
      } else if (daysUntilExpiry <= 90) {
        alerts.push({
          type: 'warning',
          category: 'passport',
          profileName: travelProfile.profile_name,
          message: `${travelProfile.passport_country_name} passport expires in ${daysUntilExpiry} days`,
          daysRemaining: daysUntilExpiry,
          profileId: travelProfile.id
        });
      } else if (daysUntilExpiry <= 180) {
        alerts.push({
          type: 'info',
          category: 'passport',
          profileName: travelProfile.profile_name,
          message: `${travelProfile.passport_country_name} passport expires in ${daysUntilExpiry} days`,
          daysRemaining: daysUntilExpiry,
          profileId: travelProfile.id
        });
      }
    }
    
    // Check visa expiration
    if (travelProfile.visas?.length > 0) {
      travelProfile.visas.forEach((visa) => {
        if (visa.expiry_date) {
          const daysUntilExpiry = differenceInDays(parseISO(visa.expiry_date), today);
          
          if (daysUntilExpiry < 0) {
            alerts.push({
              type: 'critical',
              category: 'visa',
              profileName: travelProfile.profile_name,
              message: `${visa.country_name} visa has expired`,
              daysRemaining: daysUntilExpiry,
              visaCountry: visa.country_name,
              profileId: travelProfile.id
            });
          } else if (daysUntilExpiry <= 30) {
            alerts.push({
              type: 'warning',
              category: 'visa',
              profileName: travelProfile.profile_name,
              message: `${visa.country_name} visa expires in ${daysUntilExpiry} days`,
              daysRemaining: daysUntilExpiry,
              visaCountry: visa.country_name,
              profileId: travelProfile.id
            });
          } else if (daysUntilExpiry <= 60) {
            alerts.push({
              type: 'info',
              category: 'visa',
              profileName: travelProfile.profile_name,
              message: `${visa.country_name} visa expires in ${daysUntilExpiry} days`,
              daysRemaining: daysUntilExpiry,
              visaCountry: visa.country_name,
              profileId: travelProfile.id
            });
          }
        }
      });
    }
  });
  
  // Sort by urgency
  return alerts.sort((a, b) => {
    const urgencyOrder = { critical: 0, warning: 1, info: 2 };
    return urgencyOrder[a.type] - urgencyOrder[b.type];
  });
}

export default function VisaAlerts({ profile }) {
  const alerts = getExpiringDocuments(profile);
  
  if (alerts.length === 0) return null;
  
  const criticalCount = alerts.filter(a => a.type === 'critical').length;
  const warningCount = alerts.filter(a => a.type === 'warning').length;
  
  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => (
        <Alert 
          key={index}
          className={
            alert.type === 'critical' 
              ? 'border-red-200 bg-red-50' 
              : alert.type === 'warning'
              ? 'border-orange-200 bg-orange-50'
              : 'border-blue-200 bg-blue-50'
          }
        >
          <div className="flex items-start gap-3">
            {alert.type === 'critical' ? (
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            ) : alert.type === 'warning' ? (
              <Calendar className="w-5 h-5 text-orange-500 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge 
                  className={
                    alert.type === 'critical'
                      ? 'bg-red-100 text-red-700 border-red-200'
                      : alert.type === 'warning'
                      ? 'bg-orange-100 text-orange-700 border-orange-200'
                      : 'bg-blue-100 text-blue-700 border-blue-200'
                  }
                >
                  {alert.category === 'passport' ? 'Passport' : 'Visa'}
                </Badge>
                <span className="text-xs text-slate-500">{alert.profileName}</span>
              </div>
              <AlertDescription className={
                alert.type === 'critical'
                  ? 'text-red-900 font-medium'
                  : alert.type === 'warning'
                  ? 'text-orange-900'
                  : 'text-blue-900'
              }>
                {alert.message}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      ))}
      
      {(criticalCount > 0 || warningCount > 0) && (
        <div className="text-xs text-slate-600 px-1">
          <Info className="w-3 h-3 inline mr-1" />
          Please update your travel documents to avoid booking issues
        </div>
      )}
    </div>
  );
}

export function getAlertCount(profile) {
  const alerts = getExpiringDocuments(profile);
  return {
    total: alerts.length,
    critical: alerts.filter(a => a.type === 'critical').length,
    warning: alerts.filter(a => a.type === 'warning').length
  };
}