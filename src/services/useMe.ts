import { useEffect, useState } from "react";
import { apiGet } from "@/lib/http";

export function useMe() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const resp = await apiGet<any>("/api/me");
        const me = resp && typeof resp === 'object' && 'user' in resp ? (resp as any).user : resp;
        setData(me);
      } catch (e: any) {
        setError(e?.message || "Failed to load user");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { data, loading, error };
}

