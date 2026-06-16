/**
 * Finance API client — Personal Expenses (Issue #20)
 *
 * JSON endpoints go through the shared apiFetch wrapper; the multipart
 * upload uses its own fetch (the browser must set the multipart boundary,
 * so the JSON Content-Type from apiFetch can't be used) but reuses ApiError
 * for consistent error handling.
 *
 * All endpoints are admin-only. Regular admins only ever see their own
 * transactions; super_admin sees everyone's.
 */

import { apiFetch, ApiError } from '@/lib/api';
import { getToken } from '@/lib/auth/storage';
import type { PersonalCategory } from '@/data/finance';

const API_BASE: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const PREFIX = '/api/v1/finance/personal';

// ── Response types ────────────────────────────────────────────────────────────

export interface TransactionResponse {
  expense_id: string;
  statement_id: string;
  admin_id: string;
  admin_name: string;
  transaction_date: string;   // ISO date string, e.g. "2026-04-01"
  description: string;
  amount: number;
  category: PersonalCategory;
  category_label: string;
  is_recategorized: boolean;
}

export interface StatementResponse {
  statement_id: string;
  admin_id: string;
  filename: string;
  status: 'processing' | 'completed' | 'failed';
  transaction_count: number;
  transactions: TransactionResponse[];
}

export interface CategoryTotal {
  category: PersonalCategory;
  category_label: string;
  total: number;
  count: number;
}

export interface AdminTotal {
  name: string;
  total: number;
  count: number;
}

export interface SummaryResponse {
  grand_total: number;
  unresolved_count: number;
  categories: CategoryTotal[];
  per_admin: Record<string, AdminTotal>;
}

// ── API functions ─────────────────────────────────────────────────────────────

/**
 * Upload a bank statement PDF for a specific admin.
 * Returns the created statement with all parsed transactions.
 */
export async function uploadBankStatement(
  file: File,
  adminId: string,
): Promise<StatementResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const token = getToken();
  const res = await fetch(
    `${API_BASE}${PREFIX}/bank-statements/upload?admin_id=${encodeURIComponent(adminId)}`,
    {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    },
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, (body as { detail?: string }).detail ?? 'Upload failed');
  }
  return res.json();
}

/**
 * Fetch personal expense transactions.
 * Regular admins receive only their own; super_admin may pass adminId or
 * omit filters to receive everything.
 */
export async function listTransactions(filters?: {
  adminId?: string;
  category?: PersonalCategory;
}): Promise<TransactionResponse[]> {
  const params = new URLSearchParams();
  if (filters?.adminId)  params.append('admin_id', filters.adminId);
  if (filters?.category) params.append('category', filters.category);

  const qs = params.toString();
  return apiFetch<TransactionResponse[]>(`${PREFIX}/transactions${qs ? `?${qs}` : ''}`);
}

/**
 * Recategorize a single transaction.
 * Marks it as manually reassigned on the backend.
 */
export async function recategorizeTransaction(
  expenseId: string,
  category: PersonalCategory,
): Promise<TransactionResponse> {
  return apiFetch<TransactionResponse>(`${PREFIX}/transactions/${expenseId}/category`, {
    method: 'PATCH',
    body: JSON.stringify({ category }),
  });
}

/**
 * Get aggregated spending summary — combined category totals and per-admin
 * breakdown (totals only; line items stay private to each owner).
 */
export async function getSummary(): Promise<SummaryResponse> {
  return apiFetch<SummaryResponse>(`${PREFIX}/summary`);
}
