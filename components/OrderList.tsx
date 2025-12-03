import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  Trash2, 
  Eye, 
  X,
  FileText,
  Calendar,
  Package,
  Copy
} from 'lucide-react';
import { Order } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { generatePDF } from '../services/pdfService';

interface OrderListProps {
  orders: Record<string, Order>;
  onDelete: (id: string) => void;
}

export const OrderList: React.FC<OrderListProps> = ({ orders, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  const finishedOrders = (Object.values(orders) as Order[])
    .filter(o => o.finalizado)
    .sort((a, b) => b.numero - a.numero)
    .filter(o => o.cliente.toLowerCase().includes(searchTerm.toLowerCase()) || o.numero.toString().includes(searchTerm));

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir este pedido?')) {
      onDelete(id);
      if (viewOrder?.id === id) setViewOrder(null);
    }
  };

  const calculateTotal = (order: Order) => {
    return order.itens.reduce((acc, item) => acc + (item.quantidade * item.preco), 0);
  };

  return (
    <div className="space-y-6">
       {/* Filters */}
       <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between animate-fade-in">
          <h2 className="text-lg font-bold text-gray-900 pl-2">Histórico Completo</h2>
          <div className="relative w-72">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <Input 
              className="pl-10 h-10 border-gray-200 focus:border-black focus:ring-black" 
              placeholder="Filtrar pedidos..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
       </div>

      {finishedOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm animate-scale-in">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Nenhum pedido encontrado</h3>
          <p className="text-gray-500 max-w-sm mx-auto mt-2 text-sm">
            Tente ajustar os filtros de busca.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="px-8 py-4 w-24">Nº ID</th>
                  <th className="px-8 py-4">Cliente</th>
                  <th className="px-8 py-4 w-48">Data</th>
                  <th className="px-8 py-4 w-32 text-center">Itens</th>
                  <th className="px-8 py-4 w-40 text-right">Total</th>
                  <th className="px-8 py-4 w-48 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {finishedOrders.map((order, idx) => (
                  <tr 
                    key={order.id} 
                    onClick={() => setViewOrder(order)}
                    className="group hover:bg-gray-50 transition-colors cursor-pointer duration-200"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <td className="px-8 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded border border-gray-200 w-fit group-hover:bg-white group-hover:border-black group-hover:text-black transition-all">
                          #{order.numero}
                        </span>
                        {order.isCopy && (
                          <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded w-fit">
                            <Copy size={8} /> Cópia
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-4 font-semibold text-gray-900">
                      {order.cliente}
                    </td>
                    <td className="px-8 py-4 text-gray-500">
                      {order.data.split(' ')[0]}
                    </td>
                    <td className="px-8 py-4 text-center text-gray-500">
                      <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs font-bold border border-gray-200 group-hover:border-black group-hover:bg-black group-hover:text-white transition-all">
                        {order.itens.length}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right font-bold text-gray-900">
                      R$ {calculateTotal(order).toFixed(2)}
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                        <button 
                          onClick={(e) => { e.stopPropagation(); generatePDF(order, true); }}
                          className="p-2 text-gray-500 hover:text-black hover:bg-gray-200 rounded-lg transition-colors active:scale-95"
                          title="Baixar PDF"
                        >
                          <Download size={18} />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(e, order.id)}
                          className="p-2 text-gray-500 hover:text-black hover:bg-gray-200 rounded-lg transition-colors active:scale-95"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setViewOrder(order); }}
                           className="p-2 text-gray-500 hover:text-black hover:bg-gray-200 rounded-lg transition-colors active:scale-95"
                        >
                           <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {viewOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade" onClick={() => setViewOrder(null)}></div>
          <div 
            className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-enter border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Detalhes do Pedido</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-xl text-gray-900">#{viewOrder.numero}</span>
                  <span className="text-lg text-gray-600 truncate max-w-[200px]">{viewOrder.cliente}</span>
                </div>
                {viewOrder.isCopy && (
                  <div className="mt-1">
                    <span className="text-[10px] font-bold uppercase bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-gray-600">
                      Marcado como Cópia
                    </span>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setViewOrder(null)} 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-black transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-0 overflow-y-auto bg-white flex-1">
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2 text-sm text-gray-900">
                <Calendar size={14} />
                <span className="font-medium">Realizado em: {viewOrder.data}</span>
              </div>

              <table className="w-full text-left border-collapse">
                <thead className="bg-white text-xs uppercase text-gray-500 font-semibold sticky top-0 border-b border-gray-100 shadow-sm">
                  <tr>
                    <th className="px-6 py-3 w-16 text-center">Qtd</th>
                    <th className="px-6 py-3">Produto</th>
                    <th className="px-6 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {viewOrder.itens.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-3 text-center font-bold text-gray-700">{item.quantidade}</td>
                      <td className="px-6 py-3">
                        <div className="font-medium text-gray-900">{item.produto}</div>
                        <div className="text-xs text-gray-400">Unit: R$ {item.preco.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-gray-900">
                         R$ {(item.quantidade * item.preco).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-end mb-6">
                 <span className="text-gray-500 font-medium text-sm uppercase">Total Final</span>
                 <span className="font-bold text-3xl text-gray-900 tracking-tight">R$ {calculateTotal(viewOrder).toFixed(2)}</span>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => generatePDF(viewOrder, true)} className="flex-1 justify-center h-12 border-gray-300 hover:border-black text-gray-900 active:scale-95">
                  <Download size={18} className="mr-2" /> Baixar PDF
                </Button>
                <Button onClick={() => setViewOrder(null)} className="flex-1 justify-center h-12 bg-black hover:bg-gray-800 text-white shadow-lg active:scale-95">
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};