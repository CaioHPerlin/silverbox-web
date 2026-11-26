import { useCallback } from "react";
import { getAdminMetrics, type AdminMetrics, type AdminMetricsPeriod } from "../services/adminMetrics";
import { useAsyncData } from "./useAsyncData";

export function useAdminMetrics(period: AdminMetricsPeriod) {
  const load = useCallback(() => getAdminMetrics(period), [period]);
  const { value, error, loading, reload } = useAsyncData<AdminMetrics | null>(load, null);

  return { metrics: value, error, loading, atualizar: reload };
}
