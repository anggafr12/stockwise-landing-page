import { apiGet, apiPost, apiPut } from "@/lib/http";

export type ReferralStats = {
  balance: number;
  totalApproved: number;
  totalPaid: number;
  withdrawable: boolean;
  minWithdraw: number;
};

export type ReferralLinks = { code: string; registration_link: string };

export type ReferralBankInfo = {
  bank_code: string;
  account_number: string;
  account_name: string;
  tax_id?: string | null;
};

export async function getReferralStats() {
  return apiGet<ReferralStats>("/api/referral/stats");
}

export async function getReferralLinks() {
  return apiGet<ReferralLinks>("/api/referral/links");
}

export async function getBankInfo() {
  return apiGet<{ bank: ReferralBankInfo | null }>("/api/referral/bank-info");
}

export async function saveBankInfo(payload: ReferralBankInfo) {
  return apiPut<{ bank: ReferralBankInfo }>("/api/referral/bank-info", payload);
}

export async function listCommissions(params?: { status?: string; limit?: number; offset?: number }) {
  return apiGet<{ rows: any[]; total: number; limit: number; offset: number }>("/api/referral/commissions", params as any);
}

export async function listWithdrawals() {
  return apiGet<{ rows: any[] }>("/api/referral/withdrawals");
}

export async function createWithdrawal() {
  return apiPost<{ ok: true; withdrawal: any }>("/api/referral/withdrawals", {});
}

