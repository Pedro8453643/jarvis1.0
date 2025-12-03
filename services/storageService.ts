import { Order, Customer } from '../types';

const STORAGE_KEY = 'pedidos_monochrome';
const CUSTOMERS_KEY = 'clientes_monochrome';
const LOGIN_KEY = 'logado_monochrome';

export const storageService = {
  getOrders: (): Record<string, Order> => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error("Error reading orders", e);
      return {};
    }
  },

  saveOrders: (orders: Record<string, Order>) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  },

  getCustomers: (): Customer[] => {
    try {
      const data = localStorage.getItem(CUSTOMERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error reading customers", e);
      return [];
    }
  },

  saveCustomers: (customers: Customer[]) => {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  },

  isLoggedIn: (): boolean => {
    return localStorage.getItem(LOGIN_KEY) === 'true';
  },

  setLoggedIn: (status: boolean) => {
    if (status) {
      localStorage.setItem(LOGIN_KEY, 'true');
    } else {
      localStorage.removeItem(LOGIN_KEY);
    }
  }
};