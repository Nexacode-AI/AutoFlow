import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { Car } from 'lucide-react';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = () => {
    // * Auth: login as SuperAdmin role for full access during development
    // Replace with role-based login once permissions are finalized
    login(Role.SUPERADMIN);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-indigo-600 p-3 rounded-full">
            <Car className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-center mb-2">
          Automotive Workshop
        </h1>
        <h2 className="text-center mb-8">
          Management System
        </h2>

        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <p className="text-center text-indigo-800 font-medium">
              Logging in as <strong>Admin 1</strong>
            </p>
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Login as Admin 1
          </button>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-blue-800">
              <strong>Demo Mode:</strong> All data is simulated and stored locally.
            </p>
          </div>

          <div className="mt-6 text-sm text-gray-600">
            <p><strong>Admin 1:</strong> Complete system access, can see all step details and complete any step</p>
          </div>
        </div>
      </div>
    </div>
  );
}
