import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  DollarSign, 
  Package,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Calendar,
  Filter,
  X,
  ChevronRight
} from 'lucide-react';
import { Order } from '../types';
import { Button } from './ui/Button';

interface DashboardProps {
  orders: Record<string, Order>;
}

type FilterType = 'today' | '7days' | 'month' | 'all' | 'custom';

interface FilterOption {
  id: FilterType;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'today', label: 'Hoje' },
  { id: '7days', label: '7 Dias' },
  { id: 'month', label: 'Este Mês' },
  { id: 'all', label: 'Todo Período' },
  { id: 'custom', label: 'Personalizado' },
];

export const Dashboard: React.FC<DashboardProps> = ({ orders }) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Helper: Normaliza data para meia-noite para comparação justa
  const normalizeDate = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  // Helper: Parser robusto para formato "DD/MM/YYYY HH:mm:ss"
  const parseOrderDate = (dateStr: string): Date => {
    try {
      const [datePart] = dateStr.split(' '); 
      const [day, month, year] = datePart.split('/').map(Number);
      return new Date(year, month - 1, day);
    } catch (e) {
      return new Date(0); 
    }
  };

  const filteredOrders = useMemo(() => {
    const allOrders = (Object.values(orders) as Order[])
      .filter(o => o.finalizado)
      .sort((a, b) => b.numero - a.numero);

    if (activeFilter === 'all') return allOrders;

    const today = normalizeDate(new Date());
    let start = normalizeDate(new Date());
    let end = normalizeDate(new Date());

    switch (activeFilter) {
      case 'today':
        // Start e End já são hoje
        break;
      case '7days':
        start.setDate(today.getDate() - 6); // Inclui hoje
        break;
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'custom':
        if (!customStart && !customEnd) return allOrders;
        
        if (customStart) {
          const [y, m, d] = customStart.split('-').map(Number);
          start = new Date(y, m - 1, d);
        } else {
          start = new Date(2000, 0, 1); // Passado distante
        }

        if (customEnd) {
          const [y, m, d] = customEnd.split('-').map(Number);
          end = new Date(y, m - 1, d);
        } else {
          end = today;
        }
        break;
    }

    // Normaliza para comparação
    start = normalizeDate(start);
    end = normalizeDate(end);

    return allOrders.filter(order => {
      const orderDate = normalizeDate(parseOrderDate(order.data));
      return orderDate.getTime() >= start.getTime() && orderDate.getTime() <= end.getTime();
    });

  }, [orders, activeFilter, customStart, customEnd]);

  // Calculations
  const totalRevenue = filteredOrders.reduce((acc, order) => {
    return acc + order.itens.reduce((sum, item) => sum + (item.quantidade * item.preco), 0);
  }, 0);

  const totalOrders = filteredOrders.length;
  const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  const totalItemsSold = filteredOrders.reduce((acc, order) => {
    return acc + order.itens.reduce((sum, item) => sum + item.quantidade, 0);
  }, 0);

  const StatCard = ({ title, value, icon: Icon, delay }: any) => (
    <div 
      className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group hover:border-gray-300 hover:-translate-y-1 animate-scale-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-xl bg-gray-50 group-hover:bg-black group-hover:text-white transition-colors duration-300">
          <Icon size={22} />
        </div>
        <span className="flex items-center text-[10px] font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-full border border-gray-200 transition-colors">
          <TrendingUp size={10} className="mr-1" />
          {activeFilter === 'all' ? 'Geral' : 'Filtro Ativo'}
        </span>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header & Filter Section */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h2>
            <p className="text-sm text-gray-500 mt-1">Visão geral do desempenho financeiro.</p>
          </div>

          {/* New Segmented Filter Control */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto animate-fade-in" style={{ animationDelay: '100ms' }}>
             <div className="flex p-1 bg-gray-100 rounded-xl border border-gray-200 self-start md:self-auto overflow-x-auto max-w-full">
                {FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setActiveFilter(option.id)}
                    className={`
                      px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 whitespace-nowrap
                      ${activeFilter === option.id 
                        ? 'bg-white text-black shadow-sm ring-1 ring-black/5 transform scale-100' 
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'}
                    `}
                  >
                    {option.label}
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* Conditional Custom Date Inputs (Animated) */}
        {activeFilter === 'custom' && (
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center gap-4 animate-scale-in origin-top">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Filter size={16} />
              <span>Intervalo Personalizado:</span>
            </div>
            
            <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors focus-within:ring-2 focus-within:ring-black/5">
              <span className="text-xs font-bold text-gray-400 uppercase">De</span>
              <input 
                type="date" 
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-transparent border-none text-sm font-semibold text-gray-900 focus:ring-0 p-0 outline-none"
              />
            </div>

            <ArrowRight size={14} className="text-gray-400" />

            <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors focus-within:ring-2 focus-within:ring-black/5">
              <span className="text-xs font-bold text-gray-400 uppercase">Até</span>
              <input 
                type="date" 
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-transparent border-none text-sm font-semibold text-gray-900 focus:ring-0 p-0 outline-none"
              />
            </div>

            {(customStart || customEnd) && (
              <button 
                onClick={() => { setCustomStart(''); setCustomEnd(''); }}
                className="ml-auto text-xs font-bold text-gray-500 hover:text-black flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors active:scale-95"
              >
                <X size={14} /> Limpar Datas
              </button>
            )}
          </div>
        )}
      </div>

      {/* KPI Grid - key ensures animation replays on filter change */}
      <div key={activeFilter} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Faturamento Total" 
          value={`R$ ${totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          delay={0}
        />
        <StatCard 
          title="Pedidos Realizados" 
          value={totalOrders}
          icon={ShoppingBag}
          delay={100}
        />
        <StatCard 
          title="Ticket Médio" 
          value={`R$ ${averageTicket.toFixed(2)}`}
          icon={CreditCard}
          delay={200}
        />
        <StatCard 
          title="Itens Vendidos" 
          value={totalItemsSold}
          icon={Package}
          delay={300}
        />
      </div>

      {/* Transactions Table Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col animate-slide-up" style={{ animationDelay: '400ms' }}>
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
          <div className="flex items-center gap-3">
             <div className="bg-black text-white p-2 rounded-lg">
                <Calendar size={18} />
             </div>
             <div>
                <h3 className="text-base font-bold text-gray-900 leading-tight">Relatório de Vendas</h3>
                <p className="text-xs text-gray-500">
                  {filteredOrders.length} transações encontradas
                </p>
             </div>
          </div>
          
          {filteredOrders.length > 0 && (
             <Button variant="secondary" size="sm" className="w-full sm:w-auto text-xs h-9 border-gray-200 hover:border-black hover:text-black">
               Exportar Dados <ArrowRight size={14} className="ml-2" />
             </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-28">ID</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Qtd.</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Valor</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-gray-400 animate-fade-in">
                    <div className="flex flex-col items-center justify-center gap-3">
                       <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                          <Filter size={24} className="opacity-30" />
                       </div>
                       <p className="font-medium">Nenhum resultado para este período.</p>
                       <button 
                         onClick={() => setActiveFilter('all')} 
                         className="text-xs font-bold text-black border-b border-black pb-0.5 hover:opacity-70 transition-opacity"
                       >
                         Limpar todos os filtros
                       </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.slice(0, 20).map((order, idx) => {
                  const orderTotal = order.itens.reduce((acc, i) => acc + (i.quantidade * i.preco), 0);
                  return (
                    <tr 
                      key={order.id} 
                      className="hover:bg-gray-50 transition-colors group duration-200 ease-out"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-gray-500 group-hover:text-black transition-colors">
                          #{order.numero}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 group-hover:bg-black group-hover:text-white transition-colors duration-300 shadow-sm">
                              {order.cliente.charAt(0).toUpperCase()}
                           </div>
                           <span className="font-semibold text-gray-900">{order.cliente}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {order.data.split(' ')[0]}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-2 py-1 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-600">
                          {order.itens.length}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900">
                        R$ {orderTotal.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button className="p-1.5 hover:bg-white hover:shadow-sm rounded-md border border-transparent hover:border-gray-200 text-gray-400 hover:text-black transition-all">
                               <ChevronRight size={16} />
                            </button>
                         </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};