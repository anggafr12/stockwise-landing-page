import { createClient } from '@supabase/supabase-js';
import type { TierMeta, TierCode } from '../types/shared';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!);

export async function getTierMetaMap(): Promise<Record<TierCode, TierMeta>> {
  const { data, error } = await supabase
    .from('membership_tiers')
    .select('code,name,sort_order,badge_color,icon_url,is_active')
    .eq('is_active', true);
  if (error) throw error as any;
  const map = {} as Record<TierCode, TierMeta>;
  (data || []).forEach((t: any) => { map[t.code as TierCode] = t; });
  return map;
}

