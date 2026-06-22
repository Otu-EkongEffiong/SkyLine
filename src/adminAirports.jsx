import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Database, CheckCircle, AlertTriangle, Search } from 'lucide-react';
import AirportSearchBox from '@/components/travel/AirportSearchBox.jsx';

export default function AdminAirports() {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => null,
  });

  const { data: airportCount } = useQuery({
    queryKey: ['airportCount'],
    queryFn: async () => {
      const res = await fetch('/.netlify/functions/airports-search?q=a');
      if (!res.ok) return null;
      const data = await res.json();
      return data.airports?.length ?? null;
    },
  });

  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Access denied. Admin only.</p>
      </div>
    );
  }

  const handleImport = async () => {
    setImporting(true);
    setResult(null);
    try {
      // The bulk OurAirports import is a one-time CLI step
      // (see scripts/import-ourairports.js) because it reads a local
      // CSV file and writes tens of thousands of rows — not something
      // that should run inside a 10-second Netlify Function. This
      // button instead verifies the table is populated and reachable.
      const res = await fetch('/.netlify/functions/airports-search?q=london');
      const data = await res.json();
      if (res.ok && data.airports?.length > 0) {
        setResult({
          success: true,
          message: 'Airport table is populated and reachable.',
          total_parsed: data.airports.length,
          total_inserted: data.airports.length,
        });
      } else {
        setResult({
          success: false,
          error: 'No airports found. Run `node scripts/import-ourairports.js` from the project root first.',
        });
      }
    } catch (err) {
      setResult({ success: false, error: err.message });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Airport Database</h1>
          <p className="text-muted-foreground text-sm mt-1">OurAirports dataset, imported into Supabase</p>
        </div>

        {/* Import Card */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>
              <Database className="w-5 h-5 text-amber-600" />
              OurAirports Dataset
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Airport data is imported once via <code>node scripts/import-ourairports.js</code>,
              which reads the free OurAirports CSV and upserts every airport with a valid IATA
              code into the Supabase <code>airports</code> table (~8,000 airports). This keeps
              airport search instant and free — no external API call per keystroke.
            </p>

            <Button onClick={handleImport} disabled={importing} className="bg-amber-500 hover:bg-amber-600 text-white mt-4">
              {importing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Checking...</>
              ) : (
                <><Database className="w-4 h-4 mr-2" /> Verify Import</>
              )}
            </Button>

            {result && (
              <div className={`mt-4 p-4 rounded-lg border ${result.success ? 'bg-green-50 border-green-200 dark:bg-green-950/40 dark:border-green-800' : 'bg-red-50 border-red-200'}`}>
                {result.success ? (
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-300">{result.message}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <p className="text-red-800 text-sm">{result.error}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Search Test */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>
              <Search className="w-5 h-5 text-amber-600" />
              Test Airport Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Searches the Supabase <code>airports</code> table directly via the
              <code> airports-search</code> Netlify Function.
            </p>
            <AirportSearchBox value={null} onChange={() => null} exclude={null} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}