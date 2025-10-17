'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Users, FileText, Calendar, Award, Activity } from 'lucide-react';

interface Stats {
  users: number;
  articles: number;
  events: number;
  sponsors: number;
  categories: number;
  tags: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    users: 0,
    articles: 0,
    events: 0,
    sponsors: 0,
    categories: 0,
    tags: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const tables = ['users', 'articles', 'events', 'sponsors', 'categories', 'tags'];
        const results = await Promise.all(
          tables.map(async (table) => {
            const res = await fetch(`/api/tables/${table}?limit=1`);
            const data = await res.json();
            return { table, count: data.pagination?.total || 0 };
          })
        );

        const newStats = results.reduce((acc, { table, count }) => {
          acc[table as keyof Stats] = count;
          return acc;
        }, {} as Stats);

        setStats(newStats);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Users', value: stats.users, icon: Users, color: 'text-blue-600' },
    { title: 'Total Articles', value: stats.articles, icon: FileText, color: 'text-green-600' },
    { title: 'Total Events', value: stats.events, icon: Calendar, color: 'text-purple-600' },
    { title: 'Total Sponsors', value: stats.sponsors, icon: Award, color: 'text-orange-600' },
    { title: 'Categories', value: stats.categories, icon: Database, color: 'text-pink-600' },
    { title: 'Tags', value: stats.tags, icon: Activity, color: 'text-indigo-600' },
  ];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-lg text-slate-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">Welcome to Serbancario Admin Dashboard</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
