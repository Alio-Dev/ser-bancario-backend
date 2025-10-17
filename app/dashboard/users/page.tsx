'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/dashboard/data-table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { UserFormDialog } from '@/components/dashboard/user-form-dialog';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });
  const { toast } = useToast();

  const fetchUsers = async (search = '', page = 1) => {
    setLoading(true);
    try {
      const url = `/api/tables/users?${search ? `search=${search}&` : ''}page=${page}&limit=10`;
      const res = await fetch(url);
      const json = await res.json();
      setUsers(json.data || []);
      if (json.pagination) {
        setPagination(json.pagination);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(searchValue, currentPage);
  }, [currentPage]);

  const handleEdit = (row: any) => {
    setSelectedUser(row);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleDelete = async (row: any) => {
    if (!confirm(`Are you sure you want to delete user ${row.username}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/tables/users/${row.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'User deleted successfully',
        });
        fetchUsers(searchValue, currentPage);
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const handleAdd = () => {
    setSelectedUser(null);
    setDialogMode('add');
    setDialogOpen(true);
  };

  const handleFormSuccess = () => {
    toast({
      title: 'Success',
      description: dialogMode === 'add' ? 'User added successfully' : 'User updated successfully',
    });
    fetchUsers(searchValue, currentPage);
  };

  const handleSearch = (search: string) => {
    setSearchValue(search);
    setCurrentPage(1);
    fetchUsers(search, 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Username', 'Email', 'Role', 'Created At'].join(','),
      ...users.map((u: any) =>
        [u.id, u.username, u.email, u.role, u.created_at].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'username', label: 'Nome de Utilizador' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Função',
      render: (value: string) => {
        const colors: Record<string, string> = {
          'super-admin': 'bg-red-100 text-red-800',
          admin: 'bg-blue-100 text-blue-800',
          manager: 'bg-green-100 text-green-800',
          support: 'bg-slate-100 text-slate-800',
        };
        return (
          <Badge className={colors[value] || 'bg-slate-100 text-slate-800'}>
            {value === 'super-admin' ? 'Super-Administrador' : value === 'admin' ? 'Administrador' : value === 'manager' ? 'Gestor' : 'Support'}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Users</h1>
          <p className="mt-2 text-slate-600">Manage user accounts and permissions</p>
        </div>
      </div>

      <DataTable
        data={users}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onRefresh={() => fetchUsers(searchValue, currentPage)}
        onSearch={handleSearch}
        onExport={handleExport}
        loading={loading}
        searchValue={searchValue}
        pagination={pagination}
        onPageChange={handlePageChange}
      />

      <UserFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={handleFormSuccess}
        user={selectedUser}
        mode={dialogMode}
      />
    </div>
  );
}
