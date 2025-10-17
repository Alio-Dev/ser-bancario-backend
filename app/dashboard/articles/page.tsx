'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/dashboard/data-table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArticleFormDialog } from '@/components/dashboard/article-form-dialog';

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const { toast } = useToast();

  const fetchArticles = async (search = '') => {
    setLoading(true);
    try {
      const url = `/api/tables/articles?${search ? `search=${search}` : ''}`;
      const res = await fetch(url);
      const json = await res.json();
      setArticles(json.data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch articles',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleEdit = (row: any) => {
    setSelectedArticle(row);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedArticle(null);
    setDialogMode('add');
    setDialogOpen(true);
  };

  const handleFormSuccess = () => {
    toast({
      title: 'Success',
      description: dialogMode === 'add' ? 'Article added successfully' : 'Article updated successfully',
    });
    fetchArticles(searchValue);
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'slug', label: 'Slug' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const colors: Record<string, string> = {
          draft: 'bg-slate-100 text-slate-800',
          published: 'bg-green-100 text-green-800',
          archived: 'bg-red-100 text-red-800',
        };
        return <Badge className={colors[value] || ''}>{value}</Badge>;
      },
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const handleDelete = async (row: any) => {
    if (!confirm(`Delete article "${row.title}"?`)) return;
    try {
      await fetch(`/api/tables/articles/${row.id}`, { method: 'DELETE' });
      toast({ title: 'Success', description: 'Article deleted' });
      fetchArticles(searchValue);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Articles</h1>
        <p className="mt-2 text-slate-600">Manage articles and blog posts</p>
      </div>
      <DataTable
        data={articles}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onRefresh={() => fetchArticles(searchValue)}
        onSearch={(s) => { setSearchValue(s); fetchArticles(s); }}
        onExport={() => {}}
        loading={loading}
        searchValue={searchValue}
      />

      <ArticleFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={handleFormSuccess}
        article={selectedArticle}
        mode={dialogMode}
      />
    </div>
  );
}
