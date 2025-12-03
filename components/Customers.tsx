import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Search, 
  X, 
  TrendingUp, 
  ShoppingBag,
  Clock,
  ArrowRight,
  FileText
} from 'lucide-react';
import { Customer, Order } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface CustomersProps {
  customers: Customer[];
  orders: Record<string, Order>;
  onSave: (customer: Customer) => void;
  onDelete: (id: string) => void;
}

export const Customers: React.FC<CustomersProps> = ({ customers, orders, onSave, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);

  const [newName, setNewName] = useState('');

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newCustomer: Customer = {
      id: Date.now().toString(),
      name: newName,
      phone: '', 
      email: '', 
      notes: '', 
      createdAt: new Date().toLocaleDateString('pt-BR')
    };

    onSave(newCustomer);
    setNewName('');
    setIsModalOpen(false);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja remover este cliente?')) {
      onDelete(id);
      if (viewCustomer?.id === id) setViewCustomer(null);
    }
  };

  const getCustomerStats = (customerName: string) => {
    const customerOrders = (Object.values(orders) as Order[]).filter(o => 
      o.finalizado && o.cliente.toLowerCase() === customerName.toLowerCase()
    );

    const totalSpent = customerOrders.reduce((acc, order) => 
      acc + order.itens.reduce((sum, item) => sum + (item.quantidade * item.preco), 0), 0
    );

    const lastOrderDate = customerOrders.length > 0 
      ? [...customerOrders].sort((a, b) => b.numero - a.numero)[0].data 
      : '-';

    return { totalOrders: customerOrders.length, totalSpent, lastOrderDate, history: customerOrders };
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 text-gray-400 transition-colors group-focus-within:text-black" size={18} />
          <Input 
            className="pl-10 h-12 bg-gray-50 border-transparent focus:bg-white focus:border-black focus:ring-black" 
            placeholder="Buscar por nome..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="h-12 px-6 whitespace-nowrap shadow-md bg-black hover:bg-gray-800 text-white active:scale-95">
          <Plus size={20} className="mr-2" /> Novo Cliente
        </Button>
      </div>

      {/* Customers List */}
      {customers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm animate-scale-in">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Nenhum cliente cadastrado</h3>
          <p className="text-gray-500 mt-2 text-base">Comece adicionando clientes para agilizar seus pedidos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredCustomers.map((customer, idx) => {
            const stats = getCustomerStats(customer.name);
            return (
              <div 
                key={customer.id} 
                onClick={() => setViewCustomer(customer)}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer group animate-scale-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <button 
                    onClick={(e) => handleDelete(e, customer.id)}
                    className="text-gray-300 hover:text-black hover:bg-gray-100 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <h3 className="font-bold text-gray-900 text-lg truncate mb-5">{customer.name}</h3>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-center px-2">
                     <span className="block text-[10px] uppercase font-bold text-gray-400">Pedidos</span>
                     <span className="block font-bold text-gray-900">{stats.totalOrders}</span>
                  </div>
                  <div className="w-px h-8 bg-gray-100"></div>
                  <div className="text-center px-2">
                     <span className="block text-[10px] uppercase font-bold text-gray-400">Total</span>
                     <span className="block font-bold text-gray-900 text-sm">R$ {stats.totalSpent.toFixed(2)}</span>
                  </div>
                  <div className="w-px h-8 bg-gray-100"></div>
                  <div className="flex items-center">
                    <ArrowRight size={18} className="text-gray-300 group-hover:text-black transition-colors" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-enter border border-white/20">
            <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">Novo Cliente</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-gray-400 hover:text-black transition-colors" /></button>
            </div>
            <form onSubmit={handleAddCustomer} className="p-8 space-y-5">
              <Input label="Nome Completo" value={newName} onChange={e => setNewName(e.target.value)} autoFocus required className="h-12 border-gray-300 focus:border-black" />
              <div className="pt-4">
                <Button type="submit" className="w-full h-12 text-base shadow-lg bg-black hover:bg-gray-800 text-white">Cadastrar Cliente</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Dashboard / Details Modal */}
      {viewCustomer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade" onClick={() => setViewCustomer(null)}></div>
          <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-up">
            
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-black text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-lg">
                  {viewCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col justify-center">
                  <h2 className="text-2xl font-bold text-gray-900 leading-none mb-1">{viewCustomer.name}</h2>
                  <span className="text-xs text-gray-400 font-mono">ID: {viewCustomer.id}</span>
                </div>
              </div>
              <button onClick={() => setViewCustomer(null)} className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200 shadow-sm">
                <X size={20} className="text-gray-500 hover:text-black" />
              </button>
            </div>

            <div className="overflow-y-auto p-8 space-y-8 bg-white">
              {/* Stats Cards */}
              {(() => {
                const stats = getCustomerStats(viewCustomer.name);
                return (
                  <>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group hover:border-black transition-all duration-300">
                        <div className="absolute top-0 right-0 p-4 opacity-5 transform group-hover:scale-110 transition-transform"><ShoppingBag size={64} /></div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider z-10 relative">Total Gasto</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2 z-10 relative">R$ {stats.totalSpent.toFixed(2)}</p>
                      </div>
                      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group hover:border-black transition-all duration-300">
                         <div className="absolute top-0 right-0 p-4 opacity-5 transform group-hover:scale-110 transition-transform"><FileText size={64} /></div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider z-10 relative">Pedidos</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2 z-10 relative">{stats.totalOrders}</p>
                      </div>
                      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group hover:border-black transition-all duration-300">
                         <div className="absolute top-0 right-0 p-4 opacity-5 transform group-hover:scale-110 transition-transform"><Clock size={64} /></div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider z-10 relative">Última Compra</p>
                        <p className="text-lg font-bold text-gray-900 mt-2 z-10 relative">{stats.lastOrderDate.split(' ')[0]}</p>
                      </div>
                    </div>

                    {/* Order History */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                         <TrendingUp size={18} className="text-gray-500" />
                         <h4 className="font-bold text-gray-900">Histórico de Transações</h4>
                      </div>
                      
                      {stats.history.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">Nenhum pedido realizado ainda.</div>
                      ) : (
                        <table className="w-full text-left text-sm">
                          <thead className="bg-white text-gray-500 font-semibold text-xs uppercase border-b border-gray-100">
                            <tr>
                              <th className="px-6 py-3">Nº Pedido</th>
                              <th className="px-6 py-3">Data</th>
                              <th className="px-6 py-3 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {stats.history.sort((a,b) => b.numero - a.numero).map(order => (
                              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-3 font-mono font-medium text-gray-600">#{order.numero}</td>
                                <td className="px-6 py-3 text-gray-600">{order.data}</td>
                                <td className="px-6 py-3 text-right font-bold text-gray-900">
                                  R$ {order.itens.reduce((acc, i) => acc + (i.quantidade * i.preco), 0).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
            
            <div className="p-6 border-t border-gray-200 bg-white flex justify-end">
              <Button onClick={() => setViewCustomer(null)} variant="secondary" className="px-8 border-gray-300 hover:bg-gray-100 text-gray-900">Fechar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};