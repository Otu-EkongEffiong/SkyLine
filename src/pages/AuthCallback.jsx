import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { createPageUrl } from '@/utils';

/**
 * Landing page for Supabase magic-link / OAuth redirects.
 * detectSessionInUrl exchanges the URL code/hash for a session, then we route to Profile.
 */
export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function finishAuth() {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          const { error } = await supabase.auth.getSession();
          if (error) throw error;
        }
      } catch (error) {
        console.error('AuthCallback: session exchange failed:', error);
      } finally {
        if (!cancelled) {
          navigate(createPageUrl('Profile'), { replace: true });
        }
      }
    }

    finishAuth();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3 text-slate-600">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
        <p className="text-sm">Signing you in…</p>
      </div>
    </div>
  );
}
