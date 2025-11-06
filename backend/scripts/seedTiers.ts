import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE!;
const supabase = createClient(url, key);

async function main() {
  const tiers = [
    { code: 'FREE', name: 'Free', sort_order: 1, badge_color: '#9CA3AF' },
    { code: 'PREMIUM', name: 'Premium', sort_order: 2, badge_color: '#3B82F6' },
    { code: 'VIP', name: 'VIP', sort_order: 3, badge_color: '#F59E0B' },
  ];
  for (const t of tiers) {
    const { error } = await supabase.from('membership_tiers')
      .upsert(t as any, { onConflict: 'code' });
    if (error) throw error;
  }
  console.log('✅ membership_tiers seeded');
}

main().catch(e => { console.error(e); process.exit(1); });

