import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { applyRates, type SavedState } from "../storage/model";
import { fetchRates } from "./api";

type Options = {
  isReady: boolean;
  updateState: Dispatch<SetStateAction<SavedState>>;
};

/** Checks on opening and on demand, keeping saved rates when a request fails. */
export function useRates({ isReady, updateState }: Options) {
  const [isRefreshing, setRefreshing] = useState(false);
  const [hasRatesError, setRatesError] = useState(false);
  const request = useRef<Promise<boolean> | null>(null);

  const refresh = useCallback((): Promise<boolean> => {
    if (request.current) {
      return request.current;
    }

    setRefreshing(true);
    request.current = fetchRates()
      .then((rates) => {
        updateState((previous) => applyRates(previous, rates));
        setRatesError(false);
        return true;
      })
      .catch(() => {
        setRatesError(true);
        return false;
      })
      .finally(() => {
        request.current = null;
        setRefreshing(false);
      });

    return request.current;
  }, [updateState]);

  useEffect(() => {
    if (isReady) {
      void refresh();
    }
  }, [isReady, refresh]);

  return { isRefreshing, hasRatesError, refresh };
}
