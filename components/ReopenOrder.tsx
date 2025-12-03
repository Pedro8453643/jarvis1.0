import React, { useState } from 'react';
import { RotateCcw, AlertCircle, Search } from 'lucide-react';
import { Order } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface ReopenOrderProps {
  orders: Record<string, Order>;
  onReopen: (id: string) => void;
}

export const ReopenOrder: React.FC<ReopenOrderProps> = ({ orders, onReopen }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const finishedOrders = (Object.values(orders) as Order[])
    .filter(o => o.finalizado)
    .sort((a, b) => b.numero - a.numero)
    .filter(o => o.cliente.toLowerCase().includes(searchTerm.toLowerCase()) || o.numero.toString().includes(searchTerm));

  const handleReopen = (id: string) => {
    if (confirm('Deseja reabrir este pedido? Ele voltará para a tela de edição.')) {
      onReopen(id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex gap-3 items-start text-gray-800">
        <AlertCircle className="shrink-0 mt-0.5 text-gray-500" size={20} />
        <div>
          <h4 className="font-bold text-sm mb-1 text-gray-900">Modo de Reabertura</h4>
          <p className="text-xs leading-relaxed opacity-90 text-gray-600">
            Selecione um pedido abaixo para trazê-lo de volta à tela de "Novo Pedido". 
            Isso permite adicionar ou remover itens de um pedido já finalizado.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-900">Pedidos Recentes</h3>
          <div className="relative w-64">
             <Search className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
             <Input 
               className="pl-8 h-9 text-xs focus:border-black focus:ring-black" 
               placeholder="Buscar pedido..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3 w-20">Nº</th>
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3 w-32">Total</th>
                <th className="px-6 py-3 w-32 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {finishedOrders.length === 0 ? (
                 <tr>
                   <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                     Nenhum pedido encontrado.
                   </td>
                 </tr>
              ) : (
                finishedOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-mono text-gray-600">#{order.numero}</td>
                    <td className="px-6 py-3 font-medium text-gray-900">{order.cliente}</td>
                    <td className="px-6 py-3 font-bold text-gray-900">
                      R$ {order.itens.reduce((acc, i) => acc + (i.quantidade * i.preco), 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => handleReopen(order.id)}
                        className="h-8 text-xs bg-white border-gray-200 hover:bg-black hover:text-white hover:border-black transition-all"
                      >
                        <RotateCcw size={12} className="mr-1.5" /> Reabrir
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};