import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FeatureFlags {
  [key: string]: boolean;
}

export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFlags() {
      const { data } = await supabase
        .from('feature_flags')
        .select('key, enabled');
      
      if (data) {
        const map: FeatureFlags = {};
        for (const row of data) {
          map[row.key] = row.enabled;
        }
        setFlags(map);
      }
      setLoading(false);
    }
    fetchFlags();
  }, []);

  const isEnabled = (key: string): boolean => flags[key] ?? false;

  return { flags, loading, isEnabled };
}
