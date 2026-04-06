import { useState } from 'react';
import { Building2, UserCircle, TrendingUp } from 'lucide-react';
import CompanyExpenses from '../components/finance/CompanyExpenses';
import PersonalExpenses from '../components/finance/PersonalExpenses';
import ProfitCalculator from '../components/finance/ProfitCalculator';

type Tab = 'company' | 'personal' | 'profit';

const tabs: { key: Tab; label: string; icon: typeof Building2 }[] = [
  { key: 'company',  label: 'Company Expenses',  icon: Building2 },
  { key: 'personal', label: 'Personal Expenses', icon: UserCircle },
  { key: 'profit',   label: 'Profit Calculator', icon: TrendingUp },
];

export default function Finance() {
  const [active, setActive] = useState<Tab>('company');

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Finance</h2>
        <p className="text-gray-600 mt-1">Track company expenses, personal admin spending, and profit per workflow</p>
      </div>

      {/* Tab bar — matches the rest of the app's nav style */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                active === key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {active === 'company'  && <CompanyExpenses />}
      {active === 'personal' && <PersonalExpenses />}
      {active === 'profit'   && <ProfitCalculator />}
    </div>
  );
}
