import { NavLink } from 'react-router';
import {
  LayoutDashboard,
  Workflow as WorkflowIcon,
  Package,
  Wallet,
  Car,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard },
    { name: 'Workflows', to: '/workflows', icon: WorkflowIcon },
    { name: 'Parts Management', to: '/parts', icon: Package },
    { name: 'Finance', to: '/finance', icon: Wallet },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <div className="font-semibold">Workshop</div>
            <div className="text-sm text-gray-400">Management</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="mb-3 px-4">
          <div className="text-sm text-gray-400">Logged in as</div>
          <div className="font-medium">{user?.name}</div>
          <div className="text-sm text-indigo-400 capitalize">
            {user?.role === 'admin2' ? 'Admin' : user?.role}
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
