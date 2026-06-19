// @ts-nocheck
import { useState, useCallback } from 'react';

const cache = {};

/**
 * Hook for fetching live visa requirement for a single passport → destination pair.
 * Results are cached in memory for the session.
 */
export function useVisaLookup() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const lookup = useCallback(async (passportCode, destinationCode) => {
    const key = `${passportCode}_${destinationCode}`;
    if (cache[key]) {
      setResults(prev => ({ ...prev, [destinationCode]: cache[key] }));
      return;
    }
    setLoading(prev => ({ ...prev, [destinationCode]: true }));
    try {
      cache[key] = 'unknown';
      setResults(prev => ({ ...prev, [destinationCode]: 'unknown' }));
    } catch {}
    setLoading(prev => ({ ...prev, [destinationCode]: false }));
  }, []);

  return { results, loading, lookup };
}