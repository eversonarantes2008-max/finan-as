import jsPDF from 'jspdf';
import { AccountItem } from '../types';
import { formatBRL } from './currency';
import { formatMonthName } from './storage';

export function generateSingleMonthPDF(
  monthKey: string,
  accounts: AccountItem[],
  dueDayTab: 'day5' | 'day20' | 'all',
  userEmail: string
) {
  const doc = new jsPDF();

  const targetAccounts = accounts.filter((item) => {
    if (dueDayTab === 'day5') return item.dueDay === 5;
    if (dueDayTab === 'day20') return item.dueDay === 20;
    return true;
  });

  const tabTitle =
    dueDayTab === 'day5'
      ? 'Contas 5º Dia Útil'
      : dueDayTab === 'day20'
      ? 'Contas do Dia 20'
      : 'Todas as Contas';

  const totalGeral = targetAccounts.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalPago = targetAccounts
    .filter((a) => a.isPaid)
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalRestante = totalGeral - totalPago;

  // Header Background
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório de Finanças Mensais', 14, 18);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`${tabTitle} - ${formatMonthName(monthKey)}`, 14, 27);

  doc.setFontSize(8);
  doc.text(`Usuário: ${userEmail}`, 196, 18, { align: 'right' });
  doc.text(`Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 196, 25, { align: 'right' });

  // Summary Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 42, 182, 22, 3, 3, 'F');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');

  doc.text(`Total Geral: ${formatBRL(totalGeral)}`, 20, 55);
  doc.setTextColor(16, 185, 129);
  doc.text(`Total Pago: ${formatBRL(totalPago)}`, 85, 55);
  doc.setTextColor(225, 29, 72);
  doc.text(`Restante: ${formatBRL(totalRestante)}`, 145, 55);

  // Table Header
  let y = 74;
  doc.setFillColor(30, 41, 59);
  doc.rect(14, y, 182, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Conta / Descrição', 18, y + 5.5);
  doc.text('Vencimento', 95, y + 5.5);
  doc.text('Valor (R$)', 135, y + 5.5);
  doc.text('Status', 178, y + 5.5, { align: 'center' });

  y += 12;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  targetAccounts.forEach((acc, index) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y - 4, 182, 7, 'F');
    }

    doc.setTextColor(30, 41, 59);
    doc.text(acc.name, 18, y);
    doc.text(acc.dueDay === 5 ? '5º Dia Útil' : `Dia ${acc.dueDay}`, 95, y);
    doc.text(formatBRL(acc.amount), 135, y);

    if (acc.isPaid) {
      doc.setTextColor(16, 185, 129);
      doc.setFont('helvetica', 'bold');
      doc.text('PAGO', 178, y, { align: 'center' });
    } else {
      doc.setTextColor(225, 29, 72);
      doc.setFont('helvetica', 'bold');
      doc.text('A PAGAR', 178, y, { align: 'center' });
    }
    doc.setFont('helvetica', 'normal');

    y += 7;
  });

  // Footer note
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Relatório de Finanças Mensais - Documento de controle financeiro', 105, 288, { align: 'center' });

  doc.save(`financas-${monthKey}-${dueDayTab}.pdf`);
}

export function generateConsolidatedHistoryPDF(
  userId: string,
  userEmail: string,
  getUserAccountsFn: (userId: string, monthKey: string) => AccountItem[],
  availableMonths: string[]
) {
  const doc = new jsPDF();

  // Header Background
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Histórico Consolidado de Finanças', 14, 18);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Resumo de todos os meses registrados (${availableMonths.length} meses)`, 14, 27);

  doc.setFontSize(8);
  doc.text(`Usuário: ${userEmail}`, 196, 18, { align: 'right' });
  doc.text(`Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 196, 25, { align: 'right' });

  let currentY = 45;

  availableMonths.forEach((mKey) => {
    const accs = getUserAccountsFn(userId, mKey);
    const totalGeral = accs.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const totalPago = accs.filter((a) => a.isPaid).reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const totalRestante = totalGeral - totalPago;

    if (currentY > 220) {
      doc.addPage();
      currentY = 20;
    }

    // Month Title Banner
    doc.setFillColor(30, 41, 59);
    doc.rect(14, currentY, 182, 9, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(formatMonthName(mKey), 18, currentY + 6.5);

    // Summary numbers inline
    doc.setFontSize(8.5);
    doc.text(`Total: ${formatBRL(totalGeral)} | Pago: ${formatBRL(totalPago)} | Restante: ${formatBRL(totalRestante)}`, 190, currentY + 6.5, { align: 'right' });

    currentY += 13;

    // Mini Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(14, currentY, 182, 6, 'F');
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Conta', 18, currentY + 4.5);
    doc.text('Vencimento', 95, currentY + 4.5);
    doc.text('Valor', 140, currentY + 4.5);
    doc.text('Status', 180, currentY + 4.5, { align: 'center' });

    currentY += 8;

    // Rows
    doc.setFont('helvetica', 'normal');
    accs.forEach((acc, idx) => {
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }

      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, currentY - 3.5, 182, 5, 'F');
      }

      doc.setTextColor(30, 41, 59);
      doc.text(acc.name, 18, currentY);
      doc.text(acc.dueDay === 5 ? '5º Dia Útil' : `Dia ${acc.dueDay}`, 95, currentY);
      doc.text(formatBRL(acc.amount), 140, currentY);

      if (acc.isPaid) {
        doc.setTextColor(16, 185, 129);
        doc.setFont('helvetica', 'bold');
        doc.text('PAGO', 180, currentY, { align: 'center' });
      } else {
        doc.setTextColor(225, 29, 72);
        doc.setFont('helvetica', 'bold');
        doc.text('A PAGAR', 180, currentY, { align: 'center' });
      }
      doc.setFont('helvetica', 'normal');

      currentY += 5.5;
    });

    currentY += 8;
  });

  // Footer note
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Relatório Consolidado de Histórico Financeiro - Relatório de Finanças Mensais', 105, 288, { align: 'center' });

  doc.save(`historico-completo-financas.pdf`);
}
