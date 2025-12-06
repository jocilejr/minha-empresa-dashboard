const API_URL = import.meta.env.VITE_API_URL || '';

interface FetchOptions extends RequestInit {
  authenticated?: boolean;
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { authenticated = true, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (authenticated) {
    const token = localStorage.getItem('origem_viva_token');
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || 'Erro na requisição');
  }

  return response.json();
}

// Transaction types
export interface Transaction {
  id: string;
  external_id: string | null;
  type: 'pix' | 'boleto' | 'cartao';
  amount: number;
  status: 'gerado' | 'pago' | 'pendente' | 'cancelado' | 'expirado';
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  customer_document: string | null;
  boleto_url: string | null;
  event: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionCounts {
  approved: string;
  boleto: string;
  pending: string;
  failed: string;
  total: string;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  counts: TransactionCounts;
}

export async function getTransactions(params?: {
  status?: string;
  type?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}): Promise<TransactionsResponse> {
  const searchParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, String(value));
      }
    });
  }

  const query = searchParams.toString();
  return apiFetch<TransactionsResponse>(`/api/transactions${query ? `?${query}` : ''}`);
}

export async function getTransaction(id: string): Promise<Transaction> {
  return apiFetch<Transaction>(`/api/transactions/${id}`);
}
