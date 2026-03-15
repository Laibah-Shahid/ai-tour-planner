import { useEffect, useState } from "react";
import { supabase } from "@/lib/utils";
import { User } from "@supabase/supabase-js";

export function useUserSession() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function getSession() {
      setLoading(true);
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Failed to get session:', error.message);
      }
      if (mounted) {
        setUser(data?.session?.user || null);
        setLoading(false);
      }
    }
    getSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
