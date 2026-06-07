import { apiFetch } from '@/lib/api';

export interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  whatsapp_number: string | null;
  wa_link: string | null;
  email: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}

export interface SupplierDetail extends Supplier {
  jobs_count: number;
  last_used_at: string | null;
}

export interface SupplierCreate {
  name: string;
  phone?: string | null;
  whatsapp_number?: string | null;
  email?: string | null;
  notes?: string | null;
}

export const suppliersApi = {
  list(params?: { search?: string; include_inactive?: boolean }): Promise<Supplier[]> {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.include_inactive) qs.set('include_inactive', 'true');
    const q = qs.toString();
    return apiFetch<Supplier[]>(`/api/v1/suppliers${q ? `?${q}` : ''}`);
  },

  get(id: string): Promise<SupplierDetail> {
    return apiFetch<SupplierDetail>(`/api/v1/suppliers/${id}`);
  },

  create(data: SupplierCreate): Promise<Supplier> {
    return apiFetch<Supplier>('/api/v1/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: Partial<SupplierCreate> & { is_active?: boolean }): Promise<Supplier> {
    return apiFetch<Supplier>(`/api/v1/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deactivate(id: string): Promise<void> {
    return apiFetch<void>(`/api/v1/suppliers/${id}`, { method: 'DELETE' });
  },
};
