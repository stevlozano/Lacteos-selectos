'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email) {
      setError('Por favor ingresa tu email.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });

      if (error) {
        setError('No se pudo enviar el email de recuperación. Verifica que el email sea correcto.');
      } else {
        setSuccess('Te hemos enviado un email con instrucciones para recuperar tu contraseña.');
      }
    } catch (error) {
      setError('Error al procesar tu solicitud. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <span className="material-symbols-outlined text-6xl text-neutral-300 dark:text-neutral-700 mb-4">
            lock_reset
          </span>
          <h1 className="text-4xl font-extralight tracking-tight text-black dark:text-white">
            Recuperar Contraseña
          </h1>
          <p className="text-xs font-light text-neutral-400 dark:text-neutral-600 mt-2 uppercase tracking-widest">
            Admin - Lácteos Selectos
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
            <span className="material-symbols-outlined text-sm mr-2 align-text-bottom">error</span>
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm">
            <span className="material-symbols-outlined text-sm mr-2 align-text-bottom">check_circle</span>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <button
            type="submit"
            disabled={loading || !!success}
            className="w-full mt-8 bg-black dark:bg-white text-white dark:text-black py-4 
                       font-light tracking-wide hover:bg-neutral-800 dark:hover:bg-neutral-200 
                       transition-colors flex items-center justify-center gap-3
                       disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="material-symbols-outlined">send</span>
                Enviar Email de Recuperación
              </>
            )}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-neutral-100 dark:border-neutral-900 text-center">
          <Link 
            href="/admin/login"
            className="text-sm font-light text-neutral-400 dark:text-neutral-600 hover:text-black dark:hover:text-white transition-colors"
          >
            ← Volver al login
          </Link>
        </div>
      </div>
    </div>
  );
}
