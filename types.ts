export interface OrderItem {
  produto: string;
  quantidade: number;
  preco: number;
}

export interface Order {
  id: string;
  numero: number;
  cliente: string; // Mantém o nome para histórico
  customerId?: string; // Vinculo opcional
  data: string;
  itens: OrderItem[];
  finalizado: boolean;
  isCopy?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  createdAt: string;
}

export type TabType = 'dashboard' | 'create' | 'view' | 'reopen' | 'customers';