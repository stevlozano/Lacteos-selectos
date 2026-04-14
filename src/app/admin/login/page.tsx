'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const { login, register, isRegistrationOpen, hasRegisteredUsers } = useAuth();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const success = login(email, password);
    if (success) {
      router.push('/admin/dashboard');
    } else {
      setError('Credenciales incorrectas.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isRegistrationOpen) {
      setError('El registro está cerrado. Ya existe un administrador registrado.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const success = register(email, password);
    if (success) {
      setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
      setActiveTab('login');
      setConfirmPassword('');
    } else {
      setError('No se pudo completar el registro. El registro puede estar cerrado.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-black dark:text-white mb-2">
            Panel de Administración
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Lácteos Selectos
          </p>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 border-b border-neutral-200 dark:border-neutral-700">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 text-sm font-medium transition-colors
              ${activeTab === 'login' 
                ? 'border-b-2 border-green-600 text-green-600 dark:text-green-400' 
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
          >
            🔐 Iniciar Sesión
          </button>
          <button
            onClick={() => isRegistrationOpen && setActiveTab('register')}
            disabled={!isRegistrationOpen}
            className={`flex-1 py-3 text-sm font-medium transition-colors
              ${activeTab === 'register' 
                ? 'border-b-2 border-green-600 text-green-600 dark:text-green-400' 
                : isRegistrationOpen
                  ? 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
                  : 'text-neutral-300 dark:text-neutral-600 cursor-not-allowed'
              }`}
          >
            📝 Registro {!isRegistrationOpen && '(Cerrado)'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm rounded-lg">
            {success}
          </div>
        )}

        {!isRegistrationOpen && hasRegisteredUsers && activeTab === 'register' && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-sm rounded-lg">
            ⚠️ El registro está cerrado. Ya existe un administrador registrado en el sistema.
          </div>
        )}

        {activeTab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg 
                           bg-white dark:bg-neutral-700 text-black dark:text-white
                           focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="admin@lacteos.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg 
                           bg-white dark:bg-neutral-700 text-black dark:text-white
                           focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg 
                         transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
              Iniciar Sesión
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={!isRegistrationOpen}
                className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg 
                           bg-white dark:bg-neutral-700 text-black dark:text-white
                           focus:ring-2 focus:ring-green-500 focus:border-transparent
                           disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={!isRegistrationOpen}
                className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg 
                           bg-white dark:bg-neutral-700 text-black dark:text-white
                           focus:ring-2 focus:ring-green-500 focus:border-transparent
                           disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={!isRegistrationOpen}
                className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg 
                           bg-white dark:bg-neutral-700 text-black dark:text-white
                           focus:ring-2 focus:ring-green-500 focus:border-transparent
                           disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Repite tu contraseña"
              />
            </div>

            <button
              type="submit"
              disabled={!isRegistrationOpen}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-400 
                         text-white font-medium py-3 rounded-lg 
                         transition-colors flex items-center justify-center gap-2
                         disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" x2="20" y1="8" y2="14"/><line x1="23" x2="17" y1="11" y2="11"/></svg>
              Crear Cuenta de Admin
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link 
            href="/" 
            className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-green-600 dark:hover:text-green-400"
          >
            ← Volver a la tienda
          </Link>
        </div>

        <div className="mt-4 p-3 bg-neutral-100 dark:bg-neutral-700 rounded-lg text-xs text-neutral-600 dark:text-neutral-400">
          <p className="font-medium mb-1">ℹ️ Información:</p>
          <p>• Solo puede existir un administrador en el sistema.</p>
          <p>• Una vez registrado, el registro se cierra automáticamente.</p>
          {!isRegistrationOpen && <p className="text-red-500 mt-1">• El registro está actualmente cerrado.</p>}
        </div>
      </div>
    </div>
  );
}
