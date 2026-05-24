import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutGrid, ClipboardList, Package, Wallet, BarChart3,
  Settings, ChevronsLeft, ChevronsRight, Car, LogOut,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/lib/auth/useAuthStore';

interface Props { collapsed: boolean; onToggle: () => void; }

const NAV = [
  { to: '/',          label: 'Dashboard',  icon: LayoutGrid,    end: true,  minRole: 'bay' },
  { to: '/jobs',      label: 'Job Board',  icon: ClipboardList, end: false, minRole: 'bay' },
  { to: '/parts',     label: 'Parts',      icon: Package,       end: false, minRole: 'bay' },
  { to: '/finance',   label: 'Finance',    icon: Wallet,        end: false, minRole: 'admin' },
  { to: '/reports',   label: 'Reports',    icon: BarChart3,     end: false, minRole: 'admin' },
  { to: '/settings',  label: 'Settings',   icon: Settings,      end: false, minRole: 'bay' },
];

// Role hierarchy for filtering
const ROLE_LEVELS: Record<string, number> = {
  bay: 1,
  admin: 2,
  super_admin: 3,
};

export function Sidebar({ collapsed, onToggle }: Props) {
  const nav = useNavigate();
  const { user, logout } = useAuthStore();

  // Filter navigation items based on user role
  const userRoleLevel = ROLE_LEVELS[user?.role || 'bay'] || 1;
  const visibleNav = NAV.filter((item) => {
    const requiredLevel = ROLE_LEVELS[item.minRole] || 1;
    return userRoleLevel >= requiredLevel;
  });

  const handleLogout = async () => {
    await logout();
    nav('/login');
  };

  // Get user initials for avatar
  const initials = user?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';

  return (
    <aside
      style={{ width: collapsed ? 56 : 240 }}
      className="shrink-0 flex flex-col bg-[var(--color-surface)] border-r border-[var(--color-border)] transition-[width] duration-200 ease-out"
    >
      {/* Workspace */}
      <Link
        to="/"
        className={cn(
          'h-14 flex items-center gap-2.5 px-3 border-b border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors',
          collapsed && 'justify-center px-0',
        )}
      >
        <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[var(--color-text-primary)] flex items-center justify-center shrink-0">
          <Car className="w-4 h-4 text-[var(--color-bg)]" strokeWidth={1.8} />
        </div>
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <p className="text-[13px] font-semibold tracking-tight text-[var(--color-text-primary)]">AutoFlow</p>
            <p className="text-[11px] text-[var(--color-text-tertiary)] truncate">Premium Auto Workshop</p>
          </div>
        )}
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {!collapsed && (
          <p className="px-2 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-tertiary)]">
            Operations
          </p>
        )}
        {visibleNav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                'relative flex items-center gap-2.5 h-8 rounded-[var(--radius-md)] text-[13px] font-medium transition-colors',
                collapsed ? 'justify-center px-0' : 'px-2.5',
                isActive
                  ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent-active)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r bg-[var(--color-accent)]" />
                )}
                <item.icon className="w-4 h-4 shrink-0" strokeWidth={1.6} />
                {!collapsed && <span>{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--color-border)] px-2 py-2 space-y-1">
        <button
          onClick={onToggle}
          title={collapsed ? 'Expand' : 'Collapse'}
          className={cn(
            'flex items-center gap-2.5 w-full h-8 rounded-[var(--radius-md)] text-[12px] text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors',
            collapsed ? 'justify-center px-0' : 'px-2.5',
          )}
        >
          {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>

        {/* User info */}
        <div className={cn(
          'flex items-center gap-2 h-9 rounded-[var(--radius-md)]',
          collapsed ? 'justify-center' : 'px-2.5',
        )}>
          <div className="w-6 h-6 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center text-[10px] font-semibold shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1 leading-tight">
              <p className="text-[12px] font-medium text-[var(--color-text-primary)] truncate">
                {user?.name || 'Unknown'}
              </p>
              <p className="text-[10px] text-[var(--color-text-tertiary)] truncate">
                {user?.role || 'No role'}
              </p>
            </div>
          )}
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          title="Logout"
          className={cn(
            'flex items-center gap-2.5 w-full h-8 rounded-[var(--radius-md)] text-[12px] text-[var(--color-text-tertiary)] hover:bg-red-50 hover:text-red-600 transition-colors',
            collapsed ? 'justify-center px-0' : 'px-2.5',
          )}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
