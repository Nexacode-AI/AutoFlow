import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Shell } from './shell/Shell';
import { Dashboard } from '@/features/dashboard/Dashboard';
import { JobBoard } from '@/features/jobs/JobBoard';
import { RepairOrder } from '@/features/jobs/repair-order/RepairOrder';
import { Parts } from '@/features/parts/Parts';
import { Finance } from '@/features/finance/Finance';
import { Reports } from '@/features/reports/Reports';
import { SettingsPage } from '@/features/settings/Settings';
import { Login } from '@/features/public/Login';
import { CustomerApproval } from '@/features/public/CustomerApproval';
import { CustomerFeedback } from '@/features/public/CustomerFeedback';
import { PrimitivesShowcase } from './_dev/PrimitivesShowcase';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes (no shell) */}
        <Route path="/login"            element={<Login />} />
        <Route path="/client-approval"  element={<CustomerApproval />} />
        <Route path="/client-feedback"  element={<CustomerFeedback />} />

        {/* App shell */}
        <Route element={<Shell />}>
          <Route path="/"           element={<Dashboard />} />
          <Route path="/jobs"       element={<JobBoard />} />
          <Route path="/jobs/:code" element={<RepairOrder />} />
          <Route path="/jobs/new"   element={<RepairOrder />} />
          <Route path="/parts"      element={<Parts />} />
          <Route path="/finance"    element={<Finance />} />
          <Route path="/reports"    element={<Reports />} />
          <Route path="/settings"   element={<SettingsPage />} />
          <Route path="/_dev/primitives" element={<PrimitivesShowcase />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
