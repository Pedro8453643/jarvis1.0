import { jsPDF } from 'jspdf';
import { Order } from '../types';

export const generatePDF = (pedido: Order, download: boolean = false) => {
  const doc = new jsPDF();
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const contentWidth = pageWidth - (margin * 2);

  // Helper to draw border on every page
  const desenharBorda = () => {
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(margin, margin, contentWidth, pageHeight - (margin * 2));
  };

  // Helper for table header
  const desenharCabecalhoTabela = (y: number) => {
    doc.setFontSize(11);
    doc.setFont("helvetica", 'bold');
    
    // Qty
    doc.rect(margin, y, 40, 10);
    doc.text("Quantidade", margin + 20, y + 7, { align: "center" });
    
    // Product
    doc.rect(margin + 40, y, 90, 10);
    doc.text("Produto", margin + 85, y + 7, { align: "center" });
    
    // Unit Price
    doc.rect(margin + 130, y, 30, 10);
    doc.text("Unitário", margin + 145, y + 7, { align: "center" });
    
    // Total
    doc.rect(margin + 160, y, 30, 10);
    doc.text("Total", margin + 175, y + 7, { align: "center" });
  };

  // --- Start Page 1 ---
  desenharBorda();

  // "COPY" Watermark/Indicator
  if (pedido.isCopy) {
    doc.setFontSize(14);
    doc.setFont("helvetica", 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text("CÓPIA", pageWidth - margin - 20, margin + 8, { align: "right" });
    doc.setTextColor(0, 0, 0);
  }

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", 'bold');
  doc.text("PEDIDO ELETRÔNICO", pageWidth / 2, 20, { align: "center" });

  let y = 30;

  // Company Data (Fixed)
  doc.setFontSize(12);
  doc.setFont("helvetica", 'bold');
  doc.setFillColor(230, 230, 230); // Light gray background
  doc.rect(margin + 1, y, contentWidth - 2, 8, "F");
  doc.setTextColor(0, 0, 0);
  doc.text("DADOS DA EMPRESA", pageWidth / 2, y + 6, { align: "center" });

  y += 12;
  doc.setFontSize(10);
  doc.setFont("helvetica", 'normal');
  
  // Row 1
  doc.rect(margin, y, 95, 10);
  doc.text("Comercial Soares", margin + 2, y + 7);
  doc.rect(margin + 95, y, 95, 10);
  doc.text("CNPJ: 40.457.273/0001-84", margin + 97, y + 7);

  y += 10;
  // Row 2
  doc.rect(margin, y, 95, 10);
  doc.text("Telefone: 34 99985-8000", margin + 2, y + 7);
  doc.rect(margin + 95, y, 95, 10);
  doc.text("Endereço: Rua: Getúlio Vargas, Nº 631", margin + 97, y + 7);

  // Order Data
  y += 15;
  doc.setFont("helvetica", 'bold');
  doc.setFillColor(230, 230, 230);
  doc.rect(margin + 1, y, contentWidth - 2, 8, "F");
  doc.text("DADOS DO PEDIDO", pageWidth / 2, y + 6, { align: "center" });

  y += 12;
  doc.setFont("helvetica", 'normal');
  
  doc.rect(margin, y, 95, 10);
  doc.text(`Data: ${pedido.data}`, margin + 2, y + 7);
  doc.rect(margin + 95, y, 95, 10);
  doc.text(`Pedido Nº: ${pedido.numero}`, margin + 97, y + 7);

  y += 10;
  doc.rect(margin, y, contentWidth, 10);
  doc.text(`Cliente: ${pedido.cliente}`, margin + 2, y + 7);

  // Products
  y += 15;
  doc.setFont("helvetica", 'bold');
  doc.setFillColor(230, 230, 230);
  doc.rect(margin + 1, y, contentWidth - 2, 8, "F");
  doc.text("PRODUTOS", pageWidth / 2, y + 6, { align: "center" });

  y += 10;
  desenharCabecalhoTabela(y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", 'normal');
  let totalGeral = 0;
  const alturaMax = 250;

  pedido.itens.forEach(item => {
    const totalItem = item.quantidade * item.preco;
    totalGeral += totalItem;

    if (y > alturaMax) {
      doc.addPage();
      desenharBorda();
      
      // "COPY" Watermark on subsequent pages
      if (pedido.isCopy) {
        doc.setFontSize(14);
        doc.setFont("helvetica", 'bold');
        doc.setTextColor(100, 100, 100);
        doc.text("CÓPIA", pageWidth - margin - 20, margin + 8, { align: "right" });
        doc.setTextColor(0, 0, 0);
      }

      y = 20;
      desenharCabecalhoTabela(y);
      y += 10;
      doc.setFontSize(10);
      doc.setFont("helvetica", 'normal');
    }

    // Item Row
    doc.rect(margin, y, 40, 10);
    doc.text(String(item.quantidade), margin + 20, y + 7, { align: "center" });

    doc.rect(margin + 40, y, 90, 10);
    const nome = item.produto.length > 35 ? item.produto.substring(0, 32) + "..." : item.produto;
    doc.text(nome, margin + 42, y + 7);

    doc.rect(margin + 130, y, 30, 10);
    doc.text(`R$ ${item.preco.toFixed(2)}`, margin + 145, y + 7, { align: "center" });

    doc.rect(margin + 160, y, 30, 10);
    doc.text(`R$ ${totalItem.toFixed(2)}`, margin + 175, y + 7, { align: "center" });

    y += 10;
  });

  // Total Geral
  if (y > alturaMax) {
    doc.addPage();
    desenharBorda();
    y = 20;
    desenharCabecalhoTabela(y);
    y += 10;
  }
  
  doc.setFont("helvetica", 'bold');
  doc.rect(margin, y, 160, 10);
  doc.text("TOTAL GERAL", margin + 80, y + 7, { align: "center" });
  doc.rect(margin + 160, y, 30, 10);
  doc.text(`R$ ${totalGeral.toFixed(2)}`, margin + 175, y + 7, { align: "center" });

  // Signature
  y += 20;
  if (y > alturaMax) {
    doc.addPage();
    desenharBorda();
    y = 20;
  }
  
  doc.setFontSize(12);
  doc.setFont("helvetica", 'bold');
  doc.setFillColor(230, 230, 230);
  doc.rect(margin + 1, y, contentWidth - 2, 8, "F");
  doc.text("ASSINATURA", pageWidth / 2, y + 6, { align: "center" });

  y += 12;
  doc.rect(margin, y, contentWidth, 30);
  doc.setFont("helvetica", 'normal');
  doc.text("Ass: ___________________________________", margin + 2, y + 20);

  if (download) {
    doc.save(`pedido_${pedido.numero}.pdf`);
  }
};