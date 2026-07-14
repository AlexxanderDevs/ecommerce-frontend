import * as XLSX from 'xlsx';
import type {
  AdminReportData,
  SellerReportData
} from '../types/report.types';

interface ExportInfo {
  startDate: string;
  endDate: string;
  storeName?: string;
}

function moneyNumber(value: string | number) {
  return Number(value || 0);
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

function appendSheet(
  workbook: XLSX.WorkBook,
  sheetName: string,
  rows: Record<string, string | number | null>[]
) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
}

export function exportAdminReportToExcel(
  report: AdminReportData,
  info: ExportInfo
) {
  const workbook = XLSX.utils.book_new();

  const resumen = report.resumen;

  appendSheet(workbook, 'Resumen', [
    {
      Indicador: 'Rango de fechas',
      Valor: `${info.startDate} hasta ${info.endDate}`
    },
    {
      Indicador: 'Tienda',
      Valor: info.storeName || 'Todas las tiendas'
    },
    {
      Indicador: 'Total pedidos',
      Valor: resumen.total_pedidos
    },
    {
      Indicador: 'Pedidos pendientes',
      Valor: resumen.pedidos_pendientes
    },
    {
      Indicador: 'Pedidos confirmados',
      Valor: resumen.pedidos_confirmados
    },
    {
      Indicador: 'Pedidos entregados',
      Valor: resumen.pedidos_entregados
    },
    {
      Indicador: 'Pedidos cancelados',
      Valor: resumen.pedidos_cancelados
    },
    {
      Indicador: 'Ventas confirmadas',
      Valor: moneyNumber(resumen.ventas_confirmadas)
    },
    {
      Indicador: 'Ventas canceladas',
      Valor: moneyNumber(resumen.ventas_perdidas_canceladas)
    },
    {
      Indicador: 'Ticket promedio',
      Valor: moneyNumber(resumen.ticket_promedio)
    }
  ]);

  appendSheet(
    workbook,
    'Ventas por día',
    report.ventas_por_dia.map((item) => ({
      Fecha: formatDate(item.fecha),
      Pedidos: item.total_pedidos,
      Pendientes: item.pendientes,
      Confirmados: item.confirmados,
      Entregados: item.entregados,
      Cancelados: item.cancelados,
      Ventas: moneyNumber(item.ventas)
    }))
  );

  appendSheet(
    workbook,
    'Pedidos por estado',
    report.pedidos_por_estado.map((item) => ({
      Estado: item.estado,
      Cantidad: item.cantidad,
      Total: moneyNumber(item.total)
    }))
  );

  appendSheet(
    workbook,
    'Productos más vendidos',
    report.productos_mas_vendidos.map((item, index) => ({
      Ranking: index + 1,
      Producto: item.nombre_producto,
      Cantidad: item.cantidad_vendida,
      Total: moneyNumber(item.total_vendido)
    }))
  );

  appendSheet(
    workbook,
    'Tiendas con más ventas',
    report.tiendas_mas_vendidas.map((item, index) => ({
      Ranking: index + 1,
      Tienda: item.nombre_tienda,
      Slug: item.slug,
      Pedidos: item.total_pedidos,
      Total: moneyNumber(item.total_vendido)
    }))
  );

  const storePart = info.storeName
    ? safeFileName(info.storeName)
    : 'todas-las-tiendas';

  XLSX.writeFile(
    workbook,
    `reporte-admin-${storePart}-${info.startDate}-${info.endDate}.xlsx`
  );
}

export function exportSellerReportToExcel(
  report: SellerReportData,
  info: ExportInfo
) {
  const workbook = XLSX.utils.book_new();

  const resumen = report.resumen;

  appendSheet(workbook, 'Resumen', [
    {
      Indicador: 'Rango de fechas',
      Valor: `${info.startDate} hasta ${info.endDate}`
    },
    {
      Indicador: 'Tienda',
      Valor: info.storeName || 'Tienda'
    },
    {
      Indicador: 'Total pedidos',
      Valor: resumen.total_pedidos
    },
    {
      Indicador: 'Pedidos pendientes',
      Valor: resumen.pedidos_pendientes
    },
    {
      Indicador: 'Pedidos confirmados',
      Valor: resumen.pedidos_confirmados
    },
    {
      Indicador: 'Pedidos entregados',
      Valor: resumen.pedidos_entregados
    },
    {
      Indicador: 'Pedidos cancelados',
      Valor: resumen.pedidos_cancelados
    },
    {
      Indicador: 'Ventas confirmadas',
      Valor: moneyNumber(resumen.ventas_confirmadas)
    },
    {
      Indicador: 'Ventas canceladas',
      Valor: moneyNumber(resumen.ventas_perdidas_canceladas)
    },
    {
      Indicador: 'Ticket promedio',
      Valor: moneyNumber(resumen.ticket_promedio)
    }
  ]);

  appendSheet(
    workbook,
    'Ventas por día',
    report.ventas_por_dia.map((item) => ({
      Fecha: formatDate(item.fecha),
      Pedidos: item.total_pedidos,
      Pendientes: item.pendientes,
      Confirmados: item.confirmados,
      Entregados: item.entregados,
      Cancelados: item.cancelados,
      Ventas: moneyNumber(item.ventas)
    }))
  );

  appendSheet(
    workbook,
    'Pedidos por estado',
    report.pedidos_por_estado.map((item) => ({
      Estado: item.estado,
      Cantidad: item.cantidad,
      Total: moneyNumber(item.total)
    }))
  );

  appendSheet(
    workbook,
    'Productos más vendidos',
    report.productos_mas_vendidos.map((item, index) => ({
      Ranking: index + 1,
      Producto: item.nombre_producto,
      Cantidad: item.cantidad_vendida,
      Total: moneyNumber(item.total_vendido)
    }))
  );

  appendSheet(
    workbook,
    'Stock bajo',
    report.stock_bajo.map((item) => ({
      Producto: item.producto,
      Talla: item.talla || '',
      Color: item.color || '',
      Stock: item.stock,
      Tipo: item.tipo
    }))
  );

  const storePart = info.storeName
    ? safeFileName(info.storeName)
    : 'tienda';

  XLSX.writeFile(
    workbook,
    `reporte-vendedor-${storePart}-${info.startDate}-${info.endDate}.xlsx`
  );
}