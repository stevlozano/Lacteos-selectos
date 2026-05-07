'use client';

import { useState } from 'react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GoogleLoader } from '@/components/GoogleLoader';

export default function CustomerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const { login, register } = useCustomerAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    const success = await login(email, password);
    if (success) {
      router.push('/tienda');
    } else {
      setError('Email o contraseña incorrectos.');
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (!email.includes('@')) {
      setError('Por favor ingresa un email válido.');
      return;
    }

    const success = await register(email, password, name, phone, address);
    if (success) {
      setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
      setActiveTab('login');
      setConfirmPassword('');
      setName('');
      setPhone('');
      setAddress('');
    } else {
      setError('No se pudo completar el registro. El email ya podría estar registrado.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <span className="material-symbols-outlined text-6xl text-neutral-300 dark:text-neutral-700 mb-4">person</span>
          <h1 className="text-4xl font-extralight tracking-tight text-black dark:text-white">
            Clientes
          </h1>
          <p className="text-xs font-light text-neutral-400 dark:text-neutral-600 mt-2 uppercase tracking-widest">
            Lácteos Selectos
          </p>
        </div>

        {/* Tabs */}
        <div className="flex mb-8 border-b border-neutral-100 dark:border-neutral-900">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-4 text-sm font-light tracking-wide transition-all
              ${activeTab === 'login' 
                ? 'border-b border-black dark:border-white text-black dark:text-white' 
                : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-400'
              }`}
          >
            <span className="material-symbols-outlined text-lg mr-2 align-text-bottom">login</span>
            Entrar
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-4 text-sm font-light tracking-wide transition-all
              ${activeTab === 'register' 
                ? 'border-b border-black dark:border-white text-black dark:text-white' 
                : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-400'
              }`}
          >
            <span className="material-symbols-outlined text-lg mr-2 align-text-bottom">person_add</span>
            Registro
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 text-sm">
            <span className="material-symbols-outlined text-sm mr-2 align-text-bottom">error</span>
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 text-sm">
            <span className="material-symbols-outlined text-sm mr-2 align-text-bottom">check_circle</span>
            {success}
          </div>
        )}

        {activeTab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-light text-neutral-400 dark:text-neutral-600 mb-2 uppercase tracking-widest">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-0 py-3 border-0 border-b border-neutral-200 dark:border-neutral-800 
                           bg-transparent text-black dark:text-white text-lg font-light
                           focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-xs font-light text-neutral-400 dark:text-neutral-600 mb-2 uppercase tracking-widest">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-0 py-3 border-0 border-b border-neutral-200 dark:border-neutral-800 
                           bg-transparent text-black dark:text-white text-lg font-light
                           focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-black dark:bg-white text-white dark:text-black py-4 
                         font-light tracking-wide hover:bg-neutral-800 dark:hover:bg-neutral-200 
                         transition-colors flex items-center justify-center gap-3
                         disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <GoogleLoader size="sm" />
              ) : (
                <>
                  <span className="material-symbols-outlined">arrow_forward</span>
                  Entrar
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-xs font-light text-neutral-400 dark:text-neutral-600 mb-2 uppercase tracking-widest">
                Nombre
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-0 py-3 border-0 border-b border-neutral-200 dark:border-neutral-800 
                           bg-transparent text-black dark:text-white text-lg font-light
                           focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label className="block text-xs font-light text-neutral-400 dark:text-neutral-600 mb-2 uppercase tracking-widest">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-0 py-3 border-0 border-b border-neutral-200 dark:border-neutral-800 
                           bg-transparent text-black dark:text-white text-lg font-light
                           focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-xs font-light text-neutral-400 dark:text-neutral-600 mb-2 uppercase tracking-widest">
                Teléfono
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-0 py-3 border-0 border-b border-neutral-200 dark:border-neutral-800 
                           bg-transparent text-black dark:text-white text-lg font-light
                           focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                placeholder="Tu teléfono"
              />
            </div>

            <div>
              <label className="block text-xs font-light text-neutral-400 dark:text-neutral-600 mb-2 uppercase tracking-widest">
                Dirección
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-0 py-3 border-0 border-b border-neutral-200 dark:border-neutral-800 
                           bg-transparent text-black dark:text-white text-lg font-light
                           focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                placeholder="Tu dirección"
              />
            </div>

            <div>
              <label className="block text-xs font-light text-neutral-400 dark:text-neutral-600 mb-2 uppercase tracking-widest">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-0 py-3 border-0 border-b border-neutral-200 dark:border-neutral-800 
                           bg-transparent text-black dark:text-white text-lg font-light
                           focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label className="block text-xs font-light text-neutral-400 dark:text-neutral-600 mb-2 uppercase tracking-widest">
                Confirmar
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-0 py-3 border-0 border-b border-neutral-200 dark:border-neutral-800 
                           bg-transparent text-black dark:text-white text-lg font-light
                           focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                placeholder="Repite tu contraseña"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-8 bg-black dark:bg-white text-white dark:text-black py-4 
                         font-light tracking-wide hover:bg-neutral-800 dark:hover:bg-neutral-200 
                         transition-colors flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined">person_add</span>
              Crear Cuenta
            </button>
          </form>
        )}

        <div className="mt-12 pt-8 border-t border-neutral-100 dark:border-neutral-900 text-center">
          <p className="text-[10px] font-light text-neutral-300 dark:text-neutral-700 uppercase tracking-widest">
            <Link href="/admin/login" className="hover:text-black dark:hover:text-white transition-colors">
              ¿Eres administrador?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
