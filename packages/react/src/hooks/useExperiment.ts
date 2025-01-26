import { useContext } from 'react';

import { GateContext } from '../Provider';
import { createHash } from '../utils/hash';

/**
 * A hook that retrieves the state of an experiment/AB test.
 * @param key - The unique identifier for the experiment
 * @param defaultValue - The default state of the experiment if not found (defaults to false)
 * @returns The current state of the experiment (true/false)
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isInExperiment = useExperiment('new-layout-test');
 *
 *   return (
 *     <div>
 *       {isInExperiment ? (
 *         <NewLayoutVersion />
 *       ) : (
 *         <CurrentLayout />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useExperiment(key: string, defaultValue = false): boolean {
  const { gates } = useContext(GateContext) ?? {};
  const xp = gates?.store?.experiments ?? {};

  const hashedKey = createHash(key);

  if (xp[hashedKey]) {
    return xp[hashedKey];
  }

  return defaultValue ?? false;
}
