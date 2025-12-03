import React, { useState, useEffect } from 'react';
import { 
  LogOut, 
  Store, 
  PlusCircle, 
  List, 
  RotateCcw,
  LayoutDashboard,
  Users,
  Menu,
  X,
  Loader2,
  Cloud
} from 'lucide-react';
import { api } from './services/api'; 
import { storageService } from './services/storageService';
import { Order, TabType, Customer } from './types';
import { Login } from './components/Login';
import { CreateOrder } from './components/CreateOrder';
import { OrderList } from './components/OrderList';
import { ReopenOrder } from './components/ReopenOrder';
import { Dashboard } from './components/Dashboard';
import { Customers } from './components/Customers';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [orders, setOrders] = useState<Record<string, Order>>({});
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const wasLoggedIn = storageService.isLoggedIn();
      if (wasLoggedIn) {
        setIsLoggedIn(true);
        await loadServerData();
      } else {
        setIsLoading(false);
      }
    };
    checkAuthAndLoad();
  }, []);

  const loadServerData = async () => {
    setIsLoading(true);
    try {
      const data = await api.fetchData();
      setOrders(data.orders || {});
      setCustomers(data.customers || []);
    } catch (e) {
      console.error("Erro ao carregar dados", e);
      alert("Erro ao conectar com o Firebase. Verifique suas chaves.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoggedIn(true);
    storageService.setLoggedIn(true);
    await loadServerData();
  };

  const handleLogout = async () => {
    await api.logout();
    setIsLoggedIn(false);
    storageService.setLoggedIn(false);
    setOrders({});
    setCustomers([]);
  };

  const handleSaveOrder = (order: Order) => {
    setOrders(prev => ({
      ...prev,
      [order.id]: order
    }));
    api.saveOrder(order);
  };

  const handleSaveCustomer = (customer: Customer) => {
    setCustomers(prev => {
      const exists = prev.find(c => c.id === customer.id);
      if (exists) {
        return prev.map(c => c.id === customer.id ? customer : c);
      }
      return [...prev, customer];
    });
    api.saveCustomer(customer);
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    api.deleteCustomer(id);
  };

  const handleDeleteOrder = (id: string) => {
    const newOrders = { ...orders };
    delete newOrders[id];
    setOrders(newOrders);
    api.deleteOrder(id);
    if (activeOrderId === id) setActiveOrderId(null);
  };

  const handleReopenOrder = (id: string) => {
    const order = orders[id];
    if (order) {
      const updatedOrder = { ...order, finalizado: false };
      handleSaveOrder(updatedOrder);
      setActiveOrderId(id);
      setActiveTab('create');
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 gap-4">
        <Loader2 size={40} className="animate-spin text-black" />
        <p className="text-gray-500 font-medium">Sincronizando sistema...</p>
      </div>
    );
  }

  const NavItem = ({ tab, icon: Icon, label }: { tab: TabType, icon: any, label: string }) => {
    const isActive = activeTab === tab;
    return (
      <button 
        onClick={() => {
          if (activeTab !== tab) {
            setActiveTab(tab);
            setIsMobileMenuOpen(false);
          }
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-300 ease-out rounded-lg group relative overflow-hidden
        ${isActive 
          ? 'bg-black text-white shadow-lg shadow-black/10' 
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
      >
        <Icon size={20} className={`transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
        <span className="relative z-10">{label}</span>
        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" />}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex font-sans text-gray-900 selection:bg-black selection:text-white overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-50 transition-transform duration-300">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-lg shadow-black/20 transform transition-transform hover:rotate-3">
            <Store size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-gray-900">Comercial Soares</h1>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider flex items-center gap-1">
              <Cloud size={10} /> Online
            </p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 mb-2 mt-2">Principal</div>
          <NavItem tab="dashboard" icon={LayoutDashboard} label="Visão Geral" />
          <NavItem tab="create" icon={PlusCircle} label="Novo Pedido" />
          <NavItem tab="customers" icon={Users} label="Clientes" />
          
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 mb-2 mt-6">Gestão</div>
          <NavItem tab="view" icon={List} label="Histórico" />
          <NavItem tab="reopen" icon={RotateCcw} label="Reabrir Pedidos" />
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">
              AD
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-gray-900 truncate">Administrador</p>
              <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Conectado
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-gray-500 hover:text-black transition-all duration-200 px-3 py-2.5 rounded-lg hover:bg-gray-100 border border-transparent hover:border-gray-200 active:scale-95"
          >
            <LogOut size={14} /> 
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-64 h-screen overflow-hidden bg-[#F3F4F6]">
        
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-200 px-6 py-3 flex justify-between items-center h-16 transition-all">
          <div className="flex items-center gap-4 lg:hidden">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg active:scale-95 transition-transform">
              <Menu size={24} />
            </button>
            <span className="font-bold text-gray-900">Comercial Soares</span>
          </div>
          
          <div className="hidden lg:block animate-fade-in">
            <h2 className="text-lg font-bold text-gray-800 capitalize tracking-tight">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'create' && 'PDV - Ponto de Venda'}
              {activeTab === 'customers' && 'Gestão de Clientes'}
              {activeTab === 'view' && 'Relatório de Pedidos'}
              {activeTab === 'reopen' && 'Auditoria de Pedidos'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
             <div className="text-right hidden lg:block">
               <p className="text-xs font-bold text-gray-900">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
             </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            <div key={activeTab} className="animate-slide-up h-full">
              {activeTab === 'dashboard' && <Dashboard orders={orders} />}
              {activeTab === 'create' && (
                <CreateOrder 
                  orders={orders}
                  customers={customers}
                  onSave={handleSaveOrder}
                  activeOrderId={activeOrderId}
                  setActiveOrderId={setActiveOrderId}
                  onNavigateToCustomers={() => setActiveTab('customers')}
                />
              )}
              {activeTab === 'customers' && (
                <Customers 
                  customers={customers}
                  orders={orders}
                  onSave={handleSaveCustomer}
                  onDelete={handleDeleteCustomer}
                />
              )}
              {activeTab === 'view' && <OrderList orders={orders} onDelete={handleDeleteOrder} />}
              {activeTab === 'reopen' && <ReopenOrder orders={orders} onReopen={handleReopenOrder} />}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-2xl p-4 flex flex-col animate-slide-in-right">
            <div className="flex justify-between items-center mb-6 px-2">
              <span className="font-bold text-lg">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full active:scale-90 transition-all"><X size={24} /></button>
            </div>
            <nav className="space-y-1">
              <NavItem tab="dashboard" icon={LayoutDashboard} label="Visão Geral" />
              <NavItem tab="create" icon={PlusCircle} label="Novo Pedido" />
              <NavItem tab="customers" icon={Users} label="Clientes" />
              <NavItem tab="view" icon={List} label="Histórico" />
              <NavItem tab="reopen" icon={RotateCcw} label="Reabrir" />
            </nav>
            <div className="mt-auto pt-6 border-t border-gray-100">
               <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-3 bg-gray-100 rounded-lg text-sm font-bold text-gray-600">
                 <LogOut size={16} /> Sair
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;