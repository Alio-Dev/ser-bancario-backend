'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/dashboard/data-table';
import { useToast } from '@/hooks/use-toast';
import { CategoryFormDialog } from '@/components/dashboard/category-form-dialog';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const { toast } = useToast();

  const fetchCategories = async (search = '') => {
    setLoading(true);
    try {
      const url = `/api/tables/categories?${search ? `search=${search}` : ''}`;
      const res = await fetch(url);
      const json = await res.json();
      setCategories(json.data || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch categories', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (row: any) => {
    setSelectedCategory(row);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setDialogMode('add');
    setDialogOpen(true);
  };

  const handleFormSuccess = () => {
    toast({
      title: 'Success',
      description: dialogMode === 'add' ? 'Category added successfully' : 'Category updated successfully',
    });
    fetchCategories(searchValue);
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'slug', label: 'Slug' },
    { key: 'description', label: 'Description' },
  ];

  const handleDelete = async (row: any) => {
    if (!confirm(`Delete category "${row.name}"?`)) return;
    try {
      await fetch(`/api/tables/categories/${row.id}`, { method: 'DELETE' });
      toast({ title: 'Success', description: 'Category deleted' });
      fetchCategories(searchValue);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
        <p className="mt-2 text-slate-600">Manage content categories</p>
      </div>
      <DataTable
        data={categories}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onRefresh={() => fetchCategories(searchValue)}
        onSearch={(s) => { setSearchValue(s); fetchCategories(s); }}
        onExport={() => {}}
        loading={loading}
        searchValue={searchValue}
      />

      <CategoryFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={handleFormSuccess}
        category={selectedCategory}
        mode={dialogMode}
      />
    </div>
  );
}
