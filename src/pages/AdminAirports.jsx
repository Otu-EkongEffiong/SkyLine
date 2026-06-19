import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      const airports = [];
      return airports;
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
    const res = await null;
    setResult(res.data);
    setImporting(false);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Airport Database</h1>
          <p className="text-muted-foreground text-sm mt-1">Import and manage the local OpenFlights airport dataset</p>
        </div>

        {/* Import Card */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>
              <Database className="w-5 h-5 text-amber-600" />
              Import OpenFlights Dataset
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Imports all airports with valid IATA codes from the public OpenFlights dataset (~8,000 airports). 
              Run this once to populate the local database for fast airport search.
            </p>

            <Button onClick={handleImport} disabled={importing} className="bg-amber-500 hover:bg-amber-600 text-white">
              {importing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing...</>
              ) : (
                <><Database className="w-4 h-4 mr-2" /> Import Airports</>
              )}
            </Button>

            {result && (
              <div className={`p-4 rounded-lg border ${result.success ? 'bg-green-50 border-green-200 dark:bg-green-950/40 dark:border-green-800' : 'bg-red-50 border-red-200'}`}>
                {result.success ? (
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-300">{result.message}</p>
                      <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                        Parsed: {result.total_parsed?.toLocaleString()} · Inserted: {result.total_inserted?.toLocaleString()}
                      </p>
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
          <CardContent className="space-y-4" onChange={() => null}>
            <p className="text-sm text-muted-foreground mb-4">
              Search searches the local DB first, then falls back to the Amadeus API.
            </p>
            <AirportSearchBox value={null} onChange={() => null} exclude={null} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}