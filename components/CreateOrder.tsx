import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  ClipboardPaste,
  ShoppingCart,
  User,
  Package,
  Receipt,
  Users,
  ChevronRight,
  Printer,
  Store,
  Copy
} from 'lucide-react';
import { Order, OrderItem, Customer } from '../types';
import { Button } from './ui/Button';
import { Input, TextArea } from './ui/Input';
import { Select } from './ui/Select';
import { generatePDF } from '../services/pdfService';

interface CreateOrderProps {
  orders: Record<string, Order>;
  customers: Customer[];
  onSave: (order: Order) => void;
  activeOrderId: string | null;
  setActiveOrderId: (id: string | null) => void;
  onNavigateToCustomers: () => void;
}

export const CreateOrder: React.FC<CreateOrderProps> = ({ 
  orders, 
  customers,
  onSave, 
  activeOrderId, 
  setActiveOrderId,
  onNavigateToCustomers
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  
  const [isPasteExpanded, setIsPasteExpanded] = useState(false);
  const [pasteContent, setPasteContent] = useState('');

  const activeOrder = activeOrderId ? orders[activeOrderId] : null;

  const customerOptions = [
    { value: '', label: 'Selecione um cliente...' },
    ...customers.map(c => ({ value: c.id, label: c.name }))
  ];

  const handleStartOrder = () => {
    if (!selectedCustomerId) {
      alert("Selecione um cliente da lista");
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) return;

    const newId = Date.now().toString();
    const newOrder: Order = {
      id: newId,
      numero: Object.keys(orders).length + 1,
      cliente: customer.name,
      customerId: customer.id,
      data: new Date().toLocaleString('pt-BR'),
      itens: [],
      finalizado: false,
      isCopy: false
    };

    onSave(newOrder);
    setActiveOrderId(newId);
    setSelectedCustomerId('');
  };

  const handleToggleCopy = (checked: boolean) => {
    if (!activeOrderId || !activeOrder) return;
    const updatedOrder = { ...activeOrder, isCopy: checked };
    onSave(updatedOrder);
  };

  const handleAddItem = () => {
    if (!activeOrderId || !activeOrder) return;
    
    if (isPasteExpanded && pasteContent.trim()) {
      processPaste();
      return;
    }

    if (!itemName || !itemQty || !itemPrice) {
      alert("Preencha todos os campos");
      return;
    }

    const qty = parseInt(itemQty);
    const price = parseFloat(itemPrice);

    if (qty <= 0 || price < 0) {
      alert("Valores inválidos");
      return;
    }

    const newItem: OrderItem = {
      produto: itemName,
      quantidade: qty,
      preco: price
    };

    const updatedOrder = {
      ...activeOrder,
      itens: [...activeOrder.itens, newItem]
    };

    onSave(updatedOrder);
    setItemName('');
    setItemQty('');
    setItemPrice('');
    
    document.getElementById('product-input')?.focus();
  };

  const handleDeleteItem = (index: number) => {
    if (!activeOrderId || !activeOrder) return;
    const newItems = [...activeOrder.itens];
    newItems.splice(index, 1);
    const updatedOrder = { ...activeOrder, itens: newItems };
    onSave(updatedOrder);
  };

  const handleFinishOrder = () => {
    if (!activeOrderId || !activeOrder) return;
    if (activeOrder.itens.length === 0) {
      alert("Adicione itens ao pedido");
      return;
    }

    const updatedOrder = { ...activeOrder, finalizado: true };
    onSave(updatedOrder);
    generatePDF(updatedOrder, true);
    setActiveOrderId(null);
  };

  const processPaste = () => {
    if (!activeOrderId || !activeOrder) return;

    const parts = pasteContent.trim().split(/\s+/);
    let i = 0;
    let addedCount = 0;
    let errors = 0;
    const newItems: OrderItem[] = [];

    while (i < parts.length) {
      if (i + 2 >= parts.length) {
        errors++;
        break;
      }

      const qty = parseInt(parts[i]);
      if (isNaN(qty) || qty <= 0) {
        errors++;
        i++;
        continue;
      }

      let j = i + 1;
      let priceIndex = -1;

      while (j < parts.length) {
        const possiblePrice = parts[j].startsWith('v') 
          ? parseFloat(parts[j].substring(1).replace(',', '.')) 
          : NaN;
          
        if (!isNaN(possiblePrice)) {
          priceIndex = j;
          break;
        }
        j++;
      }

      if (priceIndex === -1) {
        errors++;
        break;
      }

      const price = parseFloat(parts[priceIndex].substring(1).replace(',', '.'));
      const nameParts = [];
      for (let k = i + 1; k < priceIndex; k++) {
        nameParts.push(parts[k]);
      }
      const productName = nameParts.join(' ');

      if (productName && !isNaN(price)) {
        newItems.push({ produto: productName, quantidade: qty, preco: price });
        addedCount++;
        i = priceIndex + 1;
      } else {
        errors++;
        i++;
      }
    }

    if (addedCount > 0) {
      const updatedOrder = {
        ...activeOrder,
        itens: [...activeOrder.itens, ...newItems]
      };
      onSave(updatedOrder);
      setPasteContent('');
      setIsPasteExpanded(false);
    }
  };

  const totalGeral = activeOrder?.itens.reduce((acc, item) => acc + (item.quantidade * item.preco), 0) || 0;

  if (!activeOrderId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in duration-500">
        <div className="w-full max-w-lg bg-white p-12 rounded-3xl shadow-xl border border-white text-center">
          <div className="w-24 h-24 bg-gray-50 text-gray-900 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
            <User size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Novo Atendimento</h2>
          <p className="text-gray-500 mb-10 text-base">Selecione um cliente para abrir o caixa.</p>
          
          <div className="space-y-5 text-left">
            {customers.length > 0 ? (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500 ml-1">Cliente</label>
                  <Select
                    options={customerOptions}
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="text-lg py-3 h-14"
                  />
                </div>
                <Button onClick={handleStartOrder} className="w-full h-14 text-lg font-bold shadow-xl hover:shadow-2xl transition-all" size="lg">
                  Iniciar Venda <ChevronRight size={20} className="ml-2" />
                </Button>
              </>
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                <p className="text-sm text-gray-500 mb-4">Base de clientes vazia.</p>
                <Button onClick={onNavigateToCustomers} variant="secondary" className="w-full">
                  <Users size={18} className="mr-2" /> Cadastrar Primeiro Cliente
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
      
      {/* Left Column: Actions & Form */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* Input Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
                <div className="bg-black text-white p-2 rounded-lg">
                  <Package size={20} />
                </div>
                <div>
                   <h4 className="font-bold text-lg text-gray-900 leading-none">Adicionar Produtos</h4>
                   <p className="text-xs text-gray-500 mt-1">Digite os detalhes ou cole uma lista.</p>
                </div>
             </div>
             <Button 
                variant="ghost"
                size="sm"
                onClick={() => setIsPasteExpanded(!isPasteExpanded)}
                className="text-xs"
              >
                <ClipboardPaste size={14} className="mr-2" />
                {isPasteExpanded ? 'Modo Simples' : 'Importação em Massa'}
              </Button>
          </div>
          
          <div className="space-y-5">
            {!isPasteExpanded ? (
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-grow w-full">
                  <Input 
                    id="product-input"
                    label="Descrição do Produto" 
                    placeholder="Ex: Coca Cola 2L"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="font-medium h-12"
                    autoFocus
                  />
                </div>
                <div className="w-full md:w-28">
                  <Input 
                    type="number" 
                    label="Qtd." 
                    placeholder="1"
                    min="1"
                    value={itemQty}
                    onChange={(e) => setItemQty(e.target.value)}
                    className="text-center h-12"
                  />
                </div>
                <div className="w-full md:w-36">
                  <Input 
                    type="number" 
                    label="Preço Unit." 
                    placeholder="0,00"
                    step="0.01"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                    className="h-12"
                  />
                </div>
                <Button 
                  onClick={handleAddItem} 
                  className="h-12 px-6 bg-black hover:bg-gray-900 text-white shadow-lg whitespace-nowrap w-full md:w-auto rounded-xl"
                >
                  <Plus size={20} />
                </Button>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-700 uppercase">Colagem de Texto</span>
                  <span className="text-[10px] font-mono bg-white border border-gray-200 px-2 py-1 rounded text-gray-600">Formato: Qtd Nome vPreço</span>
                </div>
                <TextArea 
                  rows={4} 
                  className="font-mono text-xs bg-white mb-3 focus:border-black focus:ring-black"
                  placeholder="Ex: 
2 Coca Cola v10,00
1 Pizza G v50,00"
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                />
                <Button onClick={processPaste} className="w-full">
                  Processar Itens
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Current Order Items Table (Left Side View) */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex-1 overflow-hidden flex flex-col">
           <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
             <span className="font-bold text-sm text-gray-700">Itens no Carrinho</span>
             <span className="text-xs font-bold bg-gray-200 px-2 py-1 rounded-full text-gray-600">{activeOrder?.itens.length} itens</span>
           </div>
           
           <div className="flex-1 overflow-y-auto p-0">
             <table className="w-full text-left border-collapse">
               <thead className="bg-white sticky top-0 z-10 shadow-sm">
                 <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                   <th className="px-6 py-3 w-20 text-center">Qtd</th>
                   <th className="px-6 py-3">Produto</th>
                   <th className="px-6 py-3 w-32 text-right">Unitário</th>
                   <th className="px-6 py-3 w-32 text-right">Subtotal</th>
                   <th className="px-6 py-3 w-16"></th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50 text-sm">
                 {activeOrder?.itens.length === 0 ? (
                   <tr>
                     <td colSpan={5} className="py-20 text-center text-gray-400">
                       <div className="flex flex-col items-center gap-2">
                         <ShoppingCart size={32} className="opacity-20" />
                         <span>Carrinho vazio</span>
                       </div>
                     </td>
                   </tr>
                 ) : (
                   activeOrder?.itens.map((item, idx) => (
                     <tr key={idx} className="hover:bg-gray-50 group">
                       <td className="px-6 py-3 text-center font-bold text-gray-900">{item.quantidade}</td>
                       <td className="px-6 py-3 font-medium text-gray-900">{item.produto}</td>
                       <td className="px-6 py-3 text-right text-gray-500">R$ {item.preco.toFixed(2)}</td>
                       <td className="px-6 py-3 text-right font-bold text-gray-900">R$ {(item.quantidade * item.preco).toFixed(2)}</td>
                       <td className="px-6 py-3 text-right">
                         <button 
                           onClick={() => handleDeleteItem(idx)}
                           className="p-1.5 text-gray-300 hover:text-black hover:bg-gray-200 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                         >
                           <Trash2 size={16} />
                         </button>
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
           </div>
        </div>
      </div>

      {/* Right Column: Receipt / Summary */}
      <div className="lg:col-span-4 flex flex-col h-full">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl flex flex-col h-full overflow-hidden relative">
          {/* Decorative receipt zig-zag top */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAxMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+PHBhdGggZD0iTTAgMTBMMTAgMCAyMCAxMCIgZmlsbD0iI2Y5ZmFZmIiLz48L3N2Zz4=')] bg-repeat-x bg-[length:20px_10px] transform rotate-180 opacity-0"></div>
          
          <div className="p-6 bg-gray-50 border-b border-gray-200">
             <div className="flex justify-between items-start mb-4">
               <div>
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cliente</p>
                 <h3 className="text-xl font-bold text-gray-900 leading-tight">{activeOrder?.cliente}</h3>
               </div>
               <div className="bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">
                 <span className="font-mono font-bold text-sm text-gray-600">#{activeOrder?.numero}</span>
               </div>
             </div>
             
             <div className="flex items-center justify-between mt-4">
               <div className="flex items-center gap-2 text-xs text-gray-500">
                 <Receipt size={14} /> <span>Cupom Fiscal (Simulação)</span>
               </div>
               
               {/* Checkbox "Cópia" */}
               <label className="flex items-center gap-2 cursor-pointer group select-none">
                 <input 
                   type="checkbox" 
                   checked={activeOrder?.isCopy || false}
                   onChange={(e) => handleToggleCopy(e.target.checked)}
                   className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                 />
                 <span className="text-xs font-bold uppercase text-gray-500 group-hover:text-black transition-colors">
                    Cópia
                 </span>
               </label>
             </div>
          </div>

          <div className="flex-1 bg-white p-6 flex flex-col justify-end relative">
             <div className="absolute inset-0 p-6 opacity-5 pointer-events-none flex items-center justify-center">
                <Store size={150} />
             </div>
             
             <div className="space-y-4 relative z-10">
               {activeOrder?.isCopy && (
                 <div className="bg-gray-100 border border-dashed border-gray-300 p-2 text-center mb-4">
                    <span className="text-xs font-bold text-gray-500 uppercase flex items-center justify-center gap-2">
                      <Copy size={12} /> Pedido Identificado como Cópia
                    </span>
                 </div>
               )}

               <div className="flex justify-between items-center text-sm text-gray-600">
                 <span>Subtotal</span>
                 <span>R$ {totalGeral.toFixed(2)}</span>
               </div>
               <div className="flex justify-between items-center text-sm text-gray-600">
                 <span>Descontos</span>
                 <span>R$ 0,00</span>
               </div>
               <div className="h-px bg-gray-200 my-4"></div>
               <div className="flex justify-between items-end">
                 <span className="text-gray-900 font-bold text-lg">Total a Pagar</span>
                 <span className="text-4xl font-extrabold text-gray-900 tracking-tighter">
                   R$ {totalGeral.toFixed(2)}
                 </span>
               </div>
             </div>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-200">
             <Button 
               variant="primary" 
               className="w-full h-14 text-lg font-bold shadow-lg bg-black hover:bg-gray-800"
               onClick={handleFinishOrder}
               disabled={activeOrder?.itens.length === 0}
             >
               <Printer size={20} className="mr-3" /> FINALIZAR E IMPRIMIR
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
};