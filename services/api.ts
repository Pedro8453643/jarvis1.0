import { Order, Customer } from '../types';
import { db } from '../firebaseConfig';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc 
} from 'firebase/firestore';

export const api = {
  // Login simples local (apenas verifica a string)
  login: async (password: string): Promise<boolean> => {
    const CORRECT_PASS = "S600ad";
    // Simula um delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));
    return password === CORRECT_PASS;
  },

  logout: async () => {
    // Apenas resolve, já que o estado é local no App.tsx
    return Promise.resolve();
  },

  fetchData: async (): Promise<{ orders: Record<string, Order>, customers: Customer[] }> => {
    try {
      // 1. Buscar Pedidos
      const ordersCol = collection(db, 'orders');
      const ordersSnapshot = await getDocs(ordersCol);
      const ordersRecord: Record<string, Order> = {};
      
      ordersSnapshot.forEach(doc => {
        const data = doc.data() as Order;
        ordersRecord[doc.id] = { ...data, id: doc.id };
      });

      // 2. Buscar Clientes
      const customersCol = collection(db, 'customers');
      const customersSnapshot = await getDocs(customersCol);
      const customersList: Customer[] = [];
      
      customersSnapshot.forEach(doc => {
        const data = doc.data() as Customer;
        customersList.push({ ...data, id: doc.id });
      });

      return { orders: ordersRecord, customers: customersList };
    } catch (e) {
      console.error("Erro ao buscar dados do Firebase:", e);
      throw e;
    }
  },

  saveOrder: async (order: Order) => {
    try {
      await setDoc(doc(db, 'orders', order.id), order);
    } catch (e) {
      console.error("Erro ao salvar pedido:", e);
    }
  },

  deleteOrder: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'orders', id));
    } catch (e) {
      console.error("Erro ao deletar pedido:", e);
    }
  },

  saveCustomer: async (customer: Customer) => {
    try {
      await setDoc(doc(db, 'customers', customer.id), customer);
    } catch (e) {
      console.error("Erro ao salvar cliente:", e);
    }
  },

  deleteCustomer: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'customers', id));
    } catch (e) {
      console.error("Erro ao deletar cliente:", e);
    }
  }
};