import { apiFetch } from '@/lib/api';

export interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  parts_count: number;
}

export interface CataloguePart {
  id: string;
  category_id: string;
  category_name: string;
  name: string;
  grade: 'ORI' | 'OM';
  warranty_months: number;
  is_active: boolean;
}

export function catalogueApi(token: string) {
  const h = { Authorization: `Bearer ${token}` };

  return {
    // ── Categories ──
    getCategories: () =>
      apiFetch<Category[]>('/api/v1/catalogue/categories', { headers: h }),

    createCategory: (data: {
      name: string;
      description?: string | null;
      icon?: string | null;
      sort_order?: number;
    }) =>
      apiFetch<Category>('/api/v1/catalogue/categories', {
        method: 'POST',
        headers: h,
        body: JSON.stringify(data),
      }),

    updateCategory: (
      id: string,
      data: Partial<{ name: string; description: string | null; icon: string | null; sort_order: number }>,
    ) =>
      apiFetch<Category>(`/api/v1/catalogue/categories/${id}`, {
        method: 'PUT',
        headers: h,
        body: JSON.stringify(data),
      }),

    deleteCategory: (id: string) =>
      apiFetch<void>(`/api/v1/catalogue/categories/${id}`, { method: 'DELETE', headers: h }),

    // ── Parts ──
    getParts: (params?: { category_id?: string; search?: string }) => {
      const qs = new URLSearchParams();
      if (params?.category_id) qs.set('category_id', params.category_id);
      if (params?.search) qs.set('search', params.search);
      const q = qs.toString();
      return apiFetch<CataloguePart[]>(`/api/v1/catalogue/parts${q ? `?${q}` : ''}`, {
        headers: h,
      });
    },

    createPart: (data: {
      category_id: string;
      name: string;
      grade: 'ORI' | 'OM';
      warranty_months: number;
    }) =>
      apiFetch<CataloguePart>('/api/v1/catalogue/parts', {
        method: 'POST',
        headers: h,
        body: JSON.stringify(data),
      }),

    updatePart: (
      id: string,
      data: Partial<{
        category_id: string;
        name: string;
        grade: 'ORI' | 'OM';
        warranty_months: number;
        is_active: boolean;
      }>,
    ) =>
      apiFetch<CataloguePart>(`/api/v1/catalogue/parts/${id}`, {
        method: 'PUT',
        headers: h,
        body: JSON.stringify(data),
      }),

    deletePart: (id: string) =>
      apiFetch<void>(`/api/v1/catalogue/parts/${id}`, { method: 'DELETE', headers: h }),
  };
}
