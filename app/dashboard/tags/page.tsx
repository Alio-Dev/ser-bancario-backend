'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/dashboard/data-table';
import { useToast } from '@/hooks/use-toast';
import { TagFormDialog } from '@/components/dashboard/tag-form-dialog';

export default function TagsPage() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<any>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const { toast } = useToast();

  const fetchTags = async (search = '') => {
    setLoading(true);
    try {
      const url = `/api/tables/tags?${search ? `search=${search}` : ''}`;
      const res = await fetch(url);
      const json = await res.json();
      setTags(json.data || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch tags', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleEdit = (row: any) => {
    setSelectedTag(row);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedTag(null);
    setDialogMode('add');
    setDialogOpen(true);
  };

  const handleFormSuccess = () => {
    toast({
      title: 'Success',
      description: dialogMode === 'add' ? 'Tag added successfully' : 'Tag updated successfully',
    });
    fetchTags(searchValue);
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'slug', label: 'Slug' },
    {
      key: 'created_at',
      label: 'Created',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const handleDelete = async (row: any) => {
    if (!confirm(`Delete tag "${row.name}"?`)) return;
    try {
      await fetch(`/api/tables/tags/${row.id}`, { method: 'DELETE' });
      toast({ title: 'Success', description: 'Tag deleted' });
      fetchTags(searchValue);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Tags</h1>
        <p className="mt-2 text-slate-600">Manage content tags</p>
      </div>
      <DataTable
        data={tags}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onRefresh={() => fetchTags(searchValue)}
        onSearch={(s) => { setSearchValue(s); fetchTags(s); }}
        onExport={() => {}}
        loading={loading}
        searchValue={searchValue}
      />

      <TagFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={handleFormSuccess}
        tag={selectedTag}
        mode={dialogMode}
      />
    </div>
  );
}
