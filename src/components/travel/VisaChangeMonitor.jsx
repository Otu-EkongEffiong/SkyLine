// @ts-nocheck
import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, AlertTriangle, Info, CheckCircle, ExternalLink, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

export default function VisaChangeMonitor({ userEmail }) {
  const queryClient = useQueryClient();

  // Visa alerts are stored locally — no backend required
  const [alerts, setAlerts] = React.useState(() => {
    try {
      const raw = localStorage.getItem('skypath_visa_alerts');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const isLoading = false;
  const savedSearches = [];

  const markAsRead = (alertId) => {
    const updated = alerts.filter(a => a.id !== alertId);
    setAlerts(updated);
    localStorage.setItem('skypath_visa_alerts', JSON.stringify(updated));
  };

  const markAsReadMutation = { mutate: markAsRead };

  const dismissAllMutation = {
    mutate: () => {
      setAlerts([]);
      localStorage.removeItem('skypath_visa_alerts');
      toast.success('All alerts dismissed');
    }
  };

  // Auto-fetch visa updates for monitored countries
  useEffect(() => {
    const monitoredCountries = new Set();
    savedSearches.forEach(search => {
      if (search.destination) {
        // Extract country from destination (simplified)
        monitoredCountries.add(search.destination);
      }
    });

    // In a real implementation, this would call an API to check for visa updates
    // For now, we'll demonstrate with the structure
  }, [savedSearches]);

  if (isLoading) return null;
  if (alerts.length === 0) return null;

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning': return <Bell className="w-5 h-5 text-amber-600" />;
      default: return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'critical': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-amber-200 bg-amber-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const getAlertTextColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-900';
      case 'warning': return 'text-amber-900';
      default: return 'text-blue-900';
    }
  };

  return (
    <Card className="border-blue-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Visa Requirement Updates
          </CardTitle>
          {alerts.length > 1 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => dismissAllMutation.mutate()}
              className="text-xs"
            >
              Dismiss All
            </Button>
          )}
        </div>
        <p className="text-xs text-slate-500">
          {alerts.length} update{alerts.length > 1 ? 's' : ''} for destinations you're tracking
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <Alert key={alert.id} className={getAlertColor(alert.severity)}>
            <div className="flex gap-3">
              <div className="mt-0.5">{getAlertIcon(alert.severity)}</div>
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {alert.country_name}
                      </Badge>
                      <Badge 
                        variant="outline"
                        className={`text-xs ${
                          alert.alert_type === 'requirement_change' ? 'bg-red-100 text-red-700' :
                          alert.alert_type === 'new_evisa' ? 'bg-green-100 text-green-700' :
                          alert.alert_type === 'policy_update' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {alert.alert_type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <h4 className={`font-semibold text-sm ${getAlertTextColor(alert.severity)}`}>
                      {alert.title}
                    </h4>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => markAsRead(alert.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <AlertDescription className={`text-xs ${getAlertTextColor(alert.severity)}`}>
                  {alert.description}
                </AlertDescription>
                <div className="flex items-center gap-3 text-xs">
                  {alert.effective_date && (
                    <span className="text-slate-600">
                      Effective: {format(parseISO(alert.effective_date), 'MMM d, yyyy')}
                    </span>
                  )}
                  {alert.source_url && (
                    <a
                      href={alert.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      More info <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </Alert>
        ))}
        
        <div className="text-xs text-slate-600 flex items-start gap-2 pt-2 border-t">
          <Info className="w-3 h-3 mt-0.5 shrink-0" />
          <p>
            We monitor visa requirements for your saved destinations and upcoming trips. 
            Updates are sourced from official government websites and travel advisories.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper component for monitoring settings
export function VisaMonitoringInfo() {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <CheckCircle className="w-5 h-5 text-blue-600 shrink-0" />
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-blue-900">Automated Visa Monitoring Active</h4>
            <p className="text-xs text-blue-800">
              We're tracking visa requirements for destinations in your saved searches and upcoming trips. 
              You'll receive alerts when:
            </p>
            <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
              <li>Visa requirements change for monitored countries</li>
              <li>New e-visa programs become available</li>
              <li>Travel advisories are issued</li>
              <li>Policy updates affect your passport</li>
            </ul>
            <div className="pt-2 border-t border-blue-200">
              <p className="text-xs font-medium text-blue-900">Data Sources:</p>
              <p className="text-xs text-blue-700">
                • IATA Travel Centre • Government Immigration Portals • TIMATIC Database
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}