'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/dashboard/data-table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { SponsorFormDialog } from '@/components/dashboard/sponsor-form-dialog';

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<any>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const { toast } = useToast();

  const fetchSponsors = async (search = '') => {
    setLoading(true);
    try {
      const url = `/api/tables/sponsors?${search ? `search=${search}` : ''}`;
      const res = await fetch(url);
      const json = await res.json();
      setSponsors(json.data || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch sponsors', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, []);

  const handleEdit = (row: any) => {
    setSelectedSponsor(row);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedSponsor(null);
    setDialogMode('add');
    setDialogOpen(true);
  };

  const handleFormSuccess = () => {
    toast({
      title: 'Success',
      description: dialogMode === 'add' ? 'Sponsor added successfully' : 'Sponsor updated successfully',
    });
    fetchSponsors(searchValue);
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'website', label: 'Website' },
    {
      key: 'tier',
      label: 'Tier',
      render: (value: string) => {
        const colors: Record<string, string> = {
          platinum: 'bg-slate-800 text-white',
          gold: 'bg-yellow-100 text-yellow-800',
          silver: 'bg-slate-100 text-slate-800',
          bronze: 'bg-orange-100 text-orange-800',
        };
        return <Badge className={colors[value] || ''}>{value}</Badge>;
      },
    },
    {
      key: 'active',
      label: 'Status',
      render: (value: boolean) => (
        <Badge className={value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  const handleDelete = async (row: any) => {
    if (!confirm(`Delete sponsor "${row.name}"?`)) return;
    try {
      await fetch(`/api/tables/sponsors/${row.id}`, { method: 'DELETE' });
      toast({ title: 'Success', description: 'Sponsor deleted' });
      fetchSponsors(searchValue);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Sponsors</h1>
        <p className="mt-2 text-slate-600">Manage sponsors and partners</p>
      </div>
      <DataTable
        data={sponsors}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onRefresh={() => fetchSponsors(searchValue)}
        onSearch={(s) => { setSearchValue(s); fetchSponsors(s); }}
        onExport={() => {}}
        loading={loading}
        searchValue={searchValue}
      />

      <SponsorFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={handleFormSuccess}
        sponsor={selectedSponsor}
        mode={dialogMode}
      />
    </div>
  );
}
