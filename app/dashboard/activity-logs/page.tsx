'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/dashboard/data-table';
import { useToast } from '@/hooks/use-toast';

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const { toast } = useToast();

  const fetchLogs = async (search = '') => {
    setLoading(true);
    try {
      const url = `/api/tables/activity_logs?${search ? `search=${search}` : ''}&sortBy=created_at&sortOrder=desc`;
      const res = await fetch(url);
      const json = await res.json();
      setLogs(json.data || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch logs', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const columns = [
    { key: 'action', label: 'Action' },
    { key: 'table_name', label: 'Table' },
    { key: 'ip_address', label: 'IP Address' },
    {
      key: 'created_at',
      label: 'Timestamp',
      render: (value: string) => new Date(value).toLocaleString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Activity Logs</h1>
        <p className="mt-2 text-slate-600">View all system activity and changes</p>
      </div>
      <DataTable
        data={logs}
        columns={columns}
        onEdit={() => {}}
        onDelete={() => {}}
        onAdd={() => {}}
        onRefresh={() => fetchLogs(searchValue)}
        onSearch={(s) => { setSearchValue(s); fetchLogs(s); }}
        onExport={() => {}}
        loading={loading}
        searchValue={searchValue}
      />
    </div>
  );
}
