'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setResetLink('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        if (data.resetUrl) {
          setResetLink(data.resetUrl);
        }
      } else {
        setMessage(data.error || 'Erro ao enviar pedido');
      }
    } catch (error) {
      setMessage('Erro ao processar pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <img
              src="https://image2url.com/images/1760652842082-bc1c1f14-6030-4d3f-9ef9-37e00413c01c.jpg"
              alt="Serbancario"
              className="h-16 w-auto"
            />
          </div>
          <CardTitle className="text-2xl text-center">Redefinir Senha</CardTitle>
          <CardDescription className="text-center">
            Apenas para Super-Administradores. Insira o seu email para receber um link de redefinição.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <div className={`mb-4 p-4 rounded-lg ${resetLink ? 'bg-green-50 text-green-800' : 'bg-blue-50 text-blue-800'}`}>
              <p className="text-sm">{message}</p>
              {resetLink && (
                <div className="mt-3 p-3 bg-white rounded border border-green-200">
                  <p className="text-xs font-medium mb-2">Link de redefinição (modo de desenvolvimento):</p>
                  <a
                    href={resetLink}
                    className="text-xs text-blue-600 hover:underline break-all"
                  >
                    {resetLink}
                  </a>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'A enviar...' : 'Enviar Link de Redefinição'}
            </Button>
          </form>

          <div className="mt-6">
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Dashboard
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
