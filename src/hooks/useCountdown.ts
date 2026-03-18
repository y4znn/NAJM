import { useState, useEffect, useCallback } from 'react';

export function useCountdown(targetTimestamp: number | null) {
  const calcRemaining = useCallback(() => {
    if (!targetTimestamp) return 0;
    return Math.max(0, Math.floor((targetTimestamp - Date.now()) / 1000));
  }, [targetTimestamp]);

  const [remaining, setRemaining] = useState(calcRemaining);

  useEffect(() => {
    if (!targetTimestamp) {
      setRemaining(0);
      return;
    }

    setRemaining(calcRemaining());
    const interval = setInterval(() => {
      const r = calcRemaining();
      setRemaining(r);
      if (r <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTimestamp, calcRemaining]);

  return { remaining, expired: remaining <= 0 && targetTimestamp !== null };
}
