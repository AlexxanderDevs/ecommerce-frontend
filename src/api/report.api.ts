import { http } from './http';
import type {
  AdminReportData,
  SellerReportData
} from '../types/report.types';

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  storeId?: string;
}

export async function getAdminReport(filters: ReportFilters = {}) {
  const { data } = await http.get('/reports/admin', {
    params: {
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      storeId: filters.storeId || undefined
    }
  });

  return data.report as AdminReportData;
}

export async function getSellerStoreReport(
  storeId: string,
  filters: ReportFilters = {}
) {
  const { data } = await http.get(`/reports/seller/stores/${storeId}`, {
    params: {
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined
    }
  });

  return data.report as SellerReportData;
}