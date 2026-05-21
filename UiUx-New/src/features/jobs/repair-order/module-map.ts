/* Re-export module/step helpers — keeps imports clean inside repair-order */
export { MODULES, STEPS, type ModuleKey } from '@/data/workflow';
import { STEPS, type ModuleKey } from '@/data/workflow';

export const stepsByModule = (key: ModuleKey) => STEPS.filter(s => {
  // explicit mapping mirrors data/workflow.ts MODULES.steps
  const map: Record<ModuleKey, number[]> = {
    'check-in':      [1, 2, 5],
    'vehicle':       [4],
    'communication': [3],
    'diagnosis':     [6, 7],
    'estimate':      [8, 9, 11],
    'authorization': [10],
    'repair':        [12, 13, 14, 15, 16],
    'close-out':     [17, 18, 19],
  };
  return map[key].includes(s.number);
});
