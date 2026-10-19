"use client";
import { useCallback, useEffect, useState } from "react";
import { api, useToast } from "@/components/ui/client";

export function useCase(caseId) {
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    try {
      setData(await api(`/api/cases/${caseId}`));
      setError(null);
    } catch (e) {
      setError(e);
    }
  }, [caseId]);

  useEffect(() => {
    let alive = true;
    api(`/api/cases/${caseId}`)
      .then((d) => {
        if (!alive) return;
        setData(d);
        setError(null);
      })
      .catch((e) => alive && setError(e));
    return () => {
      alive = false;
    };
  }, [caseId]);

  const act = useCallback(
    async (action, payload = {}, success) => {
      setBusy(true);
      try {
        await api(`/api/cases/${caseId}`, { method: "PATCH", body: { action, ...payload } });
        await reload();
        if (success) toast(success);
        return true;
      } catch (e) {
        toast(e.message, "error");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [caseId, reload, toast]
  );

  return { data, error, busy, reload, act, toast };
}
