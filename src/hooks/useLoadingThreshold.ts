'use client';

import { useState, useEffect } from 'react';
export function useLoadingThreshold(isLoading: boolean, threshold: number = 300): boolean {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isLoading) {
      timer = setTimeout(() => {
        setShouldShow(true);
      }, threshold);
    } else {
      setShouldShow(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading, threshold]);

  return shouldShow;
}
