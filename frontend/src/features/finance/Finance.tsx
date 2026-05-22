import { useState } from 'react';
import { PageHeader } from '@/design/primitives/PageHeader';
import { Tabs } from '@/design/primitives/Tabs';
import { CompanyExpenses } from './CompanyExpenses';
import { PersonalExpenses } from './PersonalExpenses';
import { ProfitCalculator } from './ProfitCalculator';

const TABS = [
  { value: 'company',  label: 'Company Expenses' },
  { value: 'personal', label: 'Personal Expenses' },
  { value: 'profit',   label: 'Profit Calculator' },
] as const;
type Tab = (typeof TABS)[number]['value'];

export function Finance() {
  const [tab, setTab] = useState<Tab>('company');

  return (
    <div className="px-8 py-6 max-w-[1400px] mx-auto space-y-5">
      <PageHeader
        title="Finance"
        subtitle="Company expenses from bank slips, personal admin spending, and profit per workflow."
      />
      <Tabs value={tab} onChange={setTab} tabs={TABS} />

      {tab === 'company'  && <CompanyExpenses />}
      {tab === 'personal' && <PersonalExpenses />}
      {tab === 'profit'   && <ProfitCalculator />}
    </div>
  );
}
