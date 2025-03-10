import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'expo-router';

const BackHistoryContext = createContext();

export function BackHistoryProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const previousPath = useRef('/');

  // Track the previous route whenever the path changes
  useEffect(() => {
    return () => {
      previousPath.current = pathname;
    };
  }, [pathname]);

  const goBack = () => {
    if (previousPath.current && previousPath.current !== pathname) {
      router.replace(previousPath.current);
    } else {
      router.replace('/'); // Default fallback
    }
  };

  return (
    <BackHistoryContext.Provider value={{ goBack }}>
      {children}
    </BackHistoryContext.Provider>
  );
}

export function useBackHistory() {
  return useContext(BackHistoryContext);
}
