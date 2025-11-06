// src/services/referral.ts
import { apiGet, apiPut } from '@/lib/http'

export type ReferralStats = {
  balance: number
  totalApproved: number
  totalPaid: number
  withdrawable: number
  minWithdraw: number
}

export type ReferralLinks = {
  code: string
  registration_link: string
}

export type BankInfo = {
  user_id?: number
  bank_name: string
  account_name: string
  account_number: string
  bank_code?: string | null
  updated_at?: string
} | null

export function getReferralStats() {
  return apiGet<ReferralStats>('/api/referral/stats')
}

export function getReferralLinks() {
  return apiGet<ReferralLinks>('/api/referral/links')
}

export function getBankInfo() {
  return apiGet<BankInfo>('/api/referral/bank-info')
}

export function updateBankInfo(payload: Omit<Required<BankInfo>, 'user_id' | 'updated_at'>) {
  const body = {
    bank_name: payload.bank_name,
    account_name: payload.account_name,
    account_number: payload.account_number,
    bank_code: payload.bank_code ?? null,
  }
  return apiPut<BankInfo>('/api/referral/bank-info', body)
}

