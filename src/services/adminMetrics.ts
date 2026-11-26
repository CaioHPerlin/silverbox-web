import { api } from "./apiClient";

export type AdminMetricsPeriod = 7 | 30;

export type AdminMetricDay = {
  day: string;
  uploads: number;
  downloads: number;
  uploadBytes: string;
  downloadBytes: string;
};

export type AdminMetrics = {
  users: { total: number; admins: number; blocked: number };
  files: { active: number; trash: number };
  storage: {
    usedBytes: string;
    trashBytes: string;
    reservedBytes: string;
    limitBytes: string;
    availableBytes: string;
    diskAvailableBytes: string;
    diskTotalBytes: string;
  };
  traffic: AdminMetricDay[];
};

export function getAdminMetrics(days: AdminMetricsPeriod) {
  return api.get<AdminMetrics>(`/admin/stats?days=${days}`);
}
