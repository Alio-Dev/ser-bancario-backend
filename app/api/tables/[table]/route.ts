import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logActivity } from '@/lib/activity-logger';

const ALLOWED_TABLES = ['users', 'articles', 'events', 'sponsors', 'categories', 'tags', 'activity_logs'];

export async function GET(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  try {
    const { table } = params;

    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = (supabase as any).from(table).select('*', { count: 'exact' });

    if (search) {
      const searchColumns = getSearchColumns(table);
      const orConditions = searchColumns.map(col => `${col}.ilike.%${search}%`).join(',');
      query = query.or(orConditions);
    }

    query = query.order(sortBy, { ascending: sortOrder === 'asc' }).range(from, to);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data,
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  try {
    const { table } = params;

    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
    }

    const body = await request.json();

    const { data, error } = await (supabase as any).from(table).insert(body).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logActivity({
      action: 'INSERT',
      table_name: table,
      record_id: data.id,
      new_values: data,
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getSearchColumns(table: string): string[] {
  const searchColumnsMap: Record<string, string[]> = {
    users: ['username', 'email', 'role'],
    articles: ['title', 'content', 'excerpt'],
    events: ['title', 'description', 'location'],
    sponsors: ['name', 'website', 'description'],
    categories: ['name', 'description'],
    tags: ['name'],
    activity_logs: ['action', 'table_name'],
  };

  return searchColumnsMap[table] || ['id'];
}
