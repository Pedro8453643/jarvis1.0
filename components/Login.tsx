import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { api } from '../services/api';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await api.login(password);
      if (success) {
        onLogin();
      } else {
        setError('Código de acesso incorreto');
      }
    } catch (err) {
      setError('Erro ao conectar ao servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl border border-white animate-scale-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-black text-white mb-6 shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <Lock size={28} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Bem-vindo</h2>
          <p className="text-gray-500 mt-2">Comercial Soares • Sistema Seguro</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Input 
              type="password"
              placeholder="Código de Acesso"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="text-center text-lg tracking-widest h-12"
              disabled={isLoading}
            />
          </div>
          
          {error && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 animate-fade-in">
              <ShieldCheck size={16} />
              <span className="font-bold">{error}</span>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-12 text-base shadow-lg hover:shadow-xl transition-all bg-black text-white hover:bg-gray-800" 
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <><span className="mr-2">Acessar Sistema</span> <ArrowRight size={18} /></>}
          </Button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-300 font-medium">© {new Date().getFullYear()} Acesso Restrito • Firebase Secured</p>
        </div>
      </div>
    </div>
  );
};