import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logActivity } from '@/lib/activity-logger';

const ALLOWED_TABLES = ['users', 'articles', 'events', 'sponsors', 'categories', 'tags', 'activity_logs'];

export async function GET(
  request: NextRequest,
  { params }: { params: { table: string; id: string } }
) {
  try {
    const { table, id } = params;

    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
    }

    const { data, error } = await (supabase as any)
      .from(table)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { table: string; id: string } }
) {
  try {
    const { table, id } = params;

    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
    }

    const { data: oldData } = await (supabase as any)
      .from(table)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    const body = await request.json();
    body.updated_at = new Date().toISOString();

    const { data, error } = await (supabase as any)
      .from(table)
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logActivity({
      action: 'UPDATE',
      table_name: table,
      record_id: id,
      old_values: oldData,
      new_values: data,
    });

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { table: string; id: string } }
) {
  try {
    const { table, id } = params;

    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
    }

    const { data: oldData } = await (supabase as any)
      .from(table)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    const { error } = await (supabase as any).from(table).delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logActivity({
      action: 'DELETE',
      table_name: table,
      record_id: id,
      old_values: oldData,
    });

    return NextResponse.json({ message: 'Record deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
