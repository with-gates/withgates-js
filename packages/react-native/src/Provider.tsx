import React, { createContext } from 'react';
import { Gates } from './Gates';

export interface GateContextType {
  gates: InstanceType<typeof Gates>;
}

export const GateContext = createContext<GateContextType | undefined>(
  undefined
);

interface GateProviderProps {
  children: React.ReactNode;
  gates: InstanceType<typeof Gates>;
}

export function GateProvider({ children, gates }: GateProviderProps) {
  const context = React.useMemo(() => {
    return {
      gates: gates,
    };
  }, [gates]);

  return (
    <GateContext.Provider value={context}>{children}</GateContext.Provider>
  );
}
