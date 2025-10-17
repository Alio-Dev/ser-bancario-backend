'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database, Server, Clock, Activity, Key } from 'lucide-react';
import Link from 'next/link';

interface DatabaseHealth {
  status: string;
  responseTime: number;
  timestamp: string;
  database?: {
    host: string;
    type: string;
  };
  stats?: {
    total_tables: number;
    total_records: number;
  };
  error?: string;
}

export default function SettingsPage() {
  const [health, setHealth] = useState<DatabaseHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>('');

  const checkConnection = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health/database');
      const data = await res.json();
      setHealth(data);
      setLastChecked(new Date().toLocaleString());
    } catch (error) {
      setHealth({
        status: 'error',
        responseTime: 0,
        timestamp: new Date().toISOString(),
        error: 'Failed to connect to database',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const isConnected = health?.status === 'connected';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Definições</h1>
        <p className="mt-2 text-slate-600">Configuração da base de dados e estado da ligação</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Estado da Ligação</span>
              <Badge
                className={
                  isConnected
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }
              >
                {isConnected ? 'Conectado' : 'Desconectado'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Monitorização da ligação à base de dados em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium">Estado</span>
              </div>
              <span className="text-sm text-slate-600">
                {health?.status || 'A verificar...'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium">Tempo de Resposta</span>
              </div>
              <span className="text-sm text-slate-600">
                {health?.responseTime ? `${health.responseTime}ms` : '-'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium">Última Verificação</span>
              </div>
              <span className="text-sm text-slate-600">
                {lastChecked || '-'}
              </span>
            </div>

            {health?.error && (
              <div className="rounded-lg bg-red-50 p-3">
                <p className="text-sm text-red-800">{health.error}</p>
              </div>
            )}

            <Button
              onClick={checkConnection}
              disabled={loading}
              className="w-full"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Testar Ligação
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Informações da Base de Dados
            </CardTitle>
            <CardDescription>
              Detalhes da ligação e configuração
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Servidor</span>
                <span className="text-sm text-slate-600">
                  {health?.database?.host || process.env.NEXT_PUBLIC_SUPABASE_URL}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tipo de Base de Dados</span>
                <span className="text-sm text-slate-600">
                  {health?.database?.type || 'PostgreSQL (Supabase)'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Nome da Base de Dados</span>
                <span className="text-sm text-slate-600">serbanca_prod</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Estatísticas da Base de Dados</CardTitle>
            <CardDescription>
              Visão geral do tamanho da base de dados e registos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total de Tabelas</span>
                  <span className="text-2xl font-bold">
                    {health?.stats?.total_tables || 8}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total de Registos</span>
                  <span className="text-2xl font-bold">
                    {health?.stats?.total_records || 0}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuração</CardTitle>
          <CardDescription>
            Configuração do sistema e preferências
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              Monitorização da ligação ativa. O estado é verificado automaticamente a cada 30 segundos.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Redefinição de Senha
          </CardTitle>
          <CardDescription>
            Apenas para Super-Administradores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            Se esqueceu a sua senha de Super-Administrador, pode solicitar um link de redefinição por email.
          </p>
          <Link href="/forgot-password">
            <Button variant="outline" className="w-full">
              <Key className="mr-2 h-4 w-4" />
              Redefinir Senha
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
