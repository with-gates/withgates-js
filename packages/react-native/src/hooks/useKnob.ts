import { useContext } from 'react';

import { GateContext } from '../Provider';
import { createHash } from '../utils/hash';

/**
 * A hook that retrieves the state of a feature flag/knob.
 * @param key - The unique identifier for the feature flag
 * @param defaultValue - The default state of the flag if not found (defaults to false)
 * @returns The current state of the feature flag (true/false)
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isFeatureEnabled = useKnob('my-feature');
 *
 *   return (
 *     <div>
 *       {isFeatureEnabled && <NewFeature />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useKnob(key: string, defaultValue = false): boolean {
  const { gates } = useContext(GateContext) ?? {};
  const knobs = gates?.store?.knobs ?? {};

  const hashedKey = createHash(key);

  if (knobs[hashedKey]) {
    return knobs[hashedKey];
  }

  return defaultValue ?? false;
}
