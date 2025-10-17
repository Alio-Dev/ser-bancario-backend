'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/dashboard/data-table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { EventFormDialog } from '@/components/dashboard/event-form-dialog';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const { toast } = useToast();

  const fetchEvents = async (search = '') => {
    setLoading(true);
    try {
      const url = `/api/tables/events?${search ? `search=${search}` : ''}`;
      const res = await fetch(url);
      const json = await res.json();
      setEvents(json.data || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch events', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEdit = (row: any) => {
    setSelectedEvent(row);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedEvent(null);
    setDialogMode('add');
    setDialogOpen(true);
  };

  const handleFormSuccess = () => {
    toast({
      title: 'Success',
      description: dialogMode === 'add' ? 'Event added successfully' : 'Event updated successfully',
    });
    fetchEvents(searchValue);
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'location', label: 'Location' },
    {
      key: 'event_date',
      label: 'Event Date',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const colors: Record<string, string> = {
          upcoming: 'bg-blue-100 text-blue-800',
          ongoing: 'bg-green-100 text-green-800',
          completed: 'bg-slate-100 text-slate-800',
          cancelled: 'bg-red-100 text-red-800',
        };
        return <Badge className={colors[value] || ''}>{value}</Badge>;
      },
    },
  ];

  const handleDelete = async (row: any) => {
    if (!confirm(`Delete event "${row.title}"?`)) return;
    try {
      await fetch(`/api/tables/events/${row.id}`, { method: 'DELETE' });
      toast({ title: 'Success', description: 'Event deleted' });
      fetchEvents(searchValue);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Events</h1>
        <p className="mt-2 text-slate-600">Manage events and conferences</p>
      </div>
      <DataTable
        data={events}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onRefresh={() => fetchEvents(searchValue)}
        onSearch={(s) => { setSearchValue(s); fetchEvents(s); }}
        onExport={() => {}}
        loading={loading}
        searchValue={searchValue}
      />

      <EventFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={handleFormSuccess}
        event={selectedEvent}
        mode={dialogMode}
      />
    </div>
  );
}
