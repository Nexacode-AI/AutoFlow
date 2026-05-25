/**
 * Finance API client — Personal Expenses (Issue #20)
 *
 * All calls are admin-only and use the bearer token from auth storage.
 * Base URL and prefix are shared with the auth API client pattern.
 */

import { getToken } from '@/lib/auth/storage';
import type { PersonalCategory } from '@/data/finance';

const API_BASE   = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_PREFIX = '/api/v1';

// ── Shared fetch helper ───────────────────────────────────────────────────────

function authedFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  return fetch(url, {
    ...init,
    headers: {
      ...init.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

async function parseError(response: Response, fallback: string): Promise<never> {
  try {
    const body = await response.json();
    throw new Error(body.detail || fallback);
  } catch {
    throw new Error(fallback);
  }
}

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

  const response = await authedFetch(
    `${API_BASE}${API_PREFIX}/finance/personal/bank-statements/upload?admin_id=${encodeURIComponent(adminId)}`,
    { method: 'POST', body: formData },
  );
  if (!response.ok) return parseError(response, 'Failed to upload bank statement');
  return response.json();
}

/**
 * Fetch all personal expense transactions.
 * Optionally filter by adminId or category.
 */
export async function listTransactions(filters?: {
  adminId?: string;
  category?: PersonalCategory;
}): Promise<TransactionResponse[]> {
  const params = new URLSearchParams();
  if (filters?.adminId)  params.append('admin_id', filters.adminId);
  if (filters?.category) params.append('category', filters.category);

  const qs = params.toString();
  const response = await authedFetch(
    `${API_BASE}${API_PREFIX}/finance/personal/transactions${qs ? `?${qs}` : ''}`,
  );
  if (!response.ok) return parseError(response, 'Failed to fetch transactions');
  return response.json();
}

/**
 * Recategorize a single transaction.
 * Marks it as manually reassigned on the backend.
 */
export async function recategorizeTransaction(
  expenseId: string,
  category: PersonalCategory,
): Promise<TransactionResponse> {
  const response = await authedFetch(
    `${API_BASE}${API_PREFIX}/finance/personal/transactions/${expenseId}/category`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category }),
    },
  );
  if (!response.ok) return parseError(response, 'Failed to update category');
  return response.json();
}

/**
 * Get aggregated spending summary — category totals and per-admin breakdown.
 */
export async function getSummary(): Promise<SummaryResponse> {
  const response = await authedFetch(
    `${API_BASE}${API_PREFIX}/finance/personal/summary`,
  );
  if (!response.ok) return parseError(response, 'Failed to fetch summary');
  return response.json();
}
