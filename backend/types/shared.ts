export type TierCode = 'FREE' | 'PREMIUM' | 'VIP';

export interface TierMeta {
  code: TierCode;
  name: string;
  sort_order: number;
  badge_color?: string | null;
  icon_url?: string | null;
}

