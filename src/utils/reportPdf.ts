import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import type {
  AdminReportData,
  SellerReportData
} from '../types/report.types';

interface ExportPdfInfo {
  startDate: string;
  endDate: string;
  storeName?: string;
}

type JsPDFWithAutoTable = jsPDF & {
  lastAutoTable?: {
    finalY: number;
  };
};

function money(value: string | number) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

function safeFileName(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function addHeader(
  doc: jsPDF,
  title: string,
  subtitle: string
) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(title, 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(subtitle, 14, 26);

  doc.setDrawColor(220, 220, 220);
  doc.line(14, 31, 196, 31);
}

function getNextY(doc: jsPDF, fallback: number) {
  const typedDoc = doc as JsPDFWithAutoTable;
  return typedDoc.lastAutoTable?.finalY
    ? typedDoc.lastAutoTable.finalY + 10
    : fallback;
}

function addSectionTitle(doc: jsPDF, title: string, y: number) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(title, 14, y);
}

function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();

  for (let index = 1; index <= pageCount; index += 1) {
    doc.setPage(index);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120);

    doc.text(
      `Página ${index} de ${pageCount}`,
      196,
      288,
      { align: 'right' }
    );

    doc.text(
      'Reporte generado por Ecommerce Multi-Tienda',
      14,
      288
    );
  }

  doc.setTextColor(0);
}

function addResumenTable(
  doc: jsPDF,
  rows: Array<[string, string | number]>,
  startY: number
) {
  autoTable(doc, {
    startY,
    head: [['Indicador', 'Valor']],
    body: rows,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: 255
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 90 },
      1: { cellWidth: 90 }
    }
  });
}

function addGenericTable(
  doc: jsPDF,
  title: string,
  headers: string[],
  rows: Array<Array<string | number>>,
  startY: number
) {
  if (startY > 245) {
    doc.addPage();
    startY = 20;
  }

  addSectionTitle(doc, title, startY);

  autoTable(doc, {
    startY: startY + 5,
    head: [headers],
    body: rows.length > 0 ? rows : [['Sin datos']],
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.5
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: 255
    }
  });
}

export function exportAdminReportToPdf(
  report: AdminReportData,
  info: ExportPdfInfo
) {
  const doc = new jsPDF('p', 'mm', 'a4');

  const storeName = info.storeName || 'Todas las tiendas';

  addHeader(
    doc,
    'Reporte administrativo',
    `Rango: ${info.startDate} hasta ${info.endDate} | Tienda: ${storeName}`
  );

  const resumen = report.resumen;

  addSectionTitle(doc, 'Resumen general', 40);

  addResumenTable(
    doc,
    [
      ['Total pedidos', resumen.total_pedidos],
      ['Pedidos pendientes', resumen.pedidos_pendientes],
      ['Pedidos confirmados', resumen.pedidos_confirmados],
      ['Pedidos entregados', resumen.pedidos_entregados],
      ['Pedidos cancelados', resumen.pedidos_cancelados],
      ['Ventas confirmadas', money(resumen.ventas_confirmadas)],
      ['Ventas canceladas', money(resumen.ventas_perdidas_canceladas)],
      ['Ticket promedio', money(resumen.ticket_promedio)]
    ],
    45
  );

  addGenericTable(
    doc,
    'Ventas por día',
    ['Fecha', 'Pedidos', 'Pendientes', 'Confirmados', 'Entregados', 'Cancelados', 'Ventas'],
    report.ventas_por_dia.map((item) => [
      formatDate(item.fecha),
      item.total_pedidos,
      item.pendientes,
      item.confirmados,
      item.entregados,
      item.cancelados,
      money(item.ventas)
    ]),
    getNextY(doc, 90)
  );

  addGenericTable(
    doc,
    'Pedidos por estado',
    ['Estado', 'Cantidad', 'Total'],
    report.pedidos_por_estado.map((item) => [
      item.estado,
      item.cantidad,
      money(item.total)
    ]),
    getNextY(doc, 140)
  );

  addGenericTable(
    doc,
    'Productos más vendidos',
    ['#', 'Producto', 'Cantidad', 'Total vendido'],
    report.productos_mas_vendidos.map((item, index) => [
      index + 1,
      item.nombre_producto,
      item.cantidad_vendida,
      money(item.total_vendido)
    ]),
    getNextY(doc, 190)
  );

  addGenericTable(
    doc,
    'Tiendas con más ventas',
    ['#', 'Tienda', 'Slug', 'Pedidos', 'Total vendido'],
    report.tiendas_mas_vendidas.map((item, index) => [
      index + 1,
      item.nombre_tienda,
      item.slug,
      item.total_pedidos,
      money(item.total_vendido)
    ]),
    getNextY(doc, 230)
  );

  addFooter(doc);

  const storePart = info.storeName
    ? safeFileName(info.storeName)
    : 'todas-las-tiendas';

  doc.save(
    `reporte-admin-${storePart}-${info.startDate}-${info.endDate}.pdf`
  );
}

export function exportSellerReportToPdf(
  report: SellerReportData,
  info: ExportPdfInfo
) {
  const doc = new jsPDF('p', 'mm', 'a4');

  const storeName = info.storeName || 'Tienda';

  addHeader(
    doc,
    'Reporte de ventas del vendedor',
    `Rango: ${info.startDate} hasta ${info.endDate} | Tienda: ${storeName}`
  );

  const resumen = report.resumen;

  addSectionTitle(doc, 'Resumen general', 40);

  addResumenTable(
    doc,
    [
      ['Total pedidos', resumen.total_pedidos],
      ['Pedidos pendientes', resumen.pedidos_pendientes],
      ['Pedidos confirmados', resumen.pedidos_confirmados],
      ['Pedidos entregados', resumen.pedidos_entregados],
      ['Pedidos cancelados', resumen.pedidos_cancelados],
      ['Ventas confirmadas', money(resumen.ventas_confirmadas)],
      ['Ventas canceladas', money(resumen.ventas_perdidas_canceladas)],
      ['Ticket promedio', money(resumen.ticket_promedio)]
    ],
    45
  );

  addGenericTable(
    doc,
    'Ventas por día',
    ['Fecha', 'Pedidos', 'Pendientes', 'Confirmados', 'Entregados', 'Cancelados', 'Ventas'],
    report.ventas_por_dia.map((item) => [
      formatDate(item.fecha),
      item.total_pedidos,
      item.pendientes,
      item.confirmados,
      item.entregados,
      item.cancelados,
      money(item.ventas)
    ]),
    getNextY(doc, 90)
  );

  addGenericTable(
    doc,
    'Pedidos por estado',
    ['Estado', 'Cantidad', 'Total'],
    report.pedidos_por_estado.map((item) => [
      item.estado,
      item.cantidad,
      money(item.total)
    ]),
    getNextY(doc, 140)
  );

  addGenericTable(
    doc,
    'Productos más vendidos',
    ['#', 'Producto', 'Cantidad', 'Total vendido'],
    report.productos_mas_vendidos.map((item, index) => [
      index + 1,
      item.nombre_producto,
      item.cantidad_vendida,
      money(item.total_vendido)
    ]),
    getNextY(doc, 190)
  );

  addGenericTable(
    doc,
    'Stock bajo',
    ['Producto', 'Talla', 'Color', 'Stock', 'Tipo'],
    report.stock_bajo.map((item) => [
      item.producto,
      item.talla || '',
      item.color || '',
      item.stock,
      item.tipo
    ]),
    getNextY(doc, 230)
  );

  addFooter(doc);

  const storePart = info.storeName
    ? safeFileName(info.storeName)
    : 'tienda';

  doc.save(
    `reporte-vendedor-${storePart}-${info.startDate}-${info.endDate}.pdf`
  );
}