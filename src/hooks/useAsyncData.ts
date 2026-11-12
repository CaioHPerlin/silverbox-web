import { useCallback, useEffect, useRef, useState } from "react";

// A new loader identifies a new resource. Only the latest active request may commit.
export function useAsyncData<T>(load: () => Promise<T>, initial: T) {
  const [state, setState] = useState<{
    load: () => Promise<T>; value?: T; error?: unknown; loading: boolean;
  } | null>(null);
  const request = useRef(0);
  const active = useRef<(() => Promise<T>) | null>(null);

  useEffect(() => {
    active.current = load;
    const id = ++request.current;
    let cancelled = false;
    load().then(
      value => {
        if (!cancelled && id === request.current) setState({ load, value, loading: false });
      },
      error => {
        if (!cancelled && id === request.current) setState({ load, error, loading: false });
      },
    );
    return () => { cancelled = true; active.current = null; };
  }, [load]);

  const reload = useCallback(async () => {
    if (active.current !== load) return;
    const id = ++request.current;
    setState(previous => ({ load, value: previous?.load === load ? previous.value : undefined, loading: true }));
    try {
      const value = await load();
      if (active.current === load && id === request.current) setState({ load, value, loading: false });
    } catch (error) {
      if (active.current === load && id === request.current) setState({ load, error, loading: false });
    }
  }, [load]);

  const current = state?.load === load ? state : null;
  return { value: current?.value ?? initial, error: current?.error, loading: current?.loading ?? true, reload };
}
