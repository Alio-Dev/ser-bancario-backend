'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Play, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TerminalPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const executeQuery = async () => {
    if (!query.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a SQL query',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    toast({
      title: 'Not Implemented',
      description: 'SQL query execution is not yet implemented for security reasons',
      variant: 'destructive',
    });
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Terminal SQL</h1>
        <p className="mt-2 text-slate-600">Execute custom SQL queries</p>
      </div>

      <div className="rounded-lg bg-yellow-50 p-4">
        <div className="flex gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-800" />
          <div>
            <p className="font-medium text-yellow-800">Warning</p>
            <p className="text-sm text-yellow-700">
              SQL query execution is restricted for security reasons. Use with caution.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SQL Query Editor</CardTitle>
          <CardDescription>
            Write and execute custom SQL queries against the database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="SELECT * FROM users LIMIT 10;"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-[200px] font-mono"
          />
          <Button onClick={executeQuery} disabled={loading}>
            <Play className="mr-2 h-4 w-4" />
            Execute Query
          </Button>

          {result && (
            <div className="rounded-lg border bg-slate-50 p-4">
              <pre className="text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
