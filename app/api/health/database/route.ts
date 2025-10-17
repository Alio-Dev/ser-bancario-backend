import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const startTime = Date.now();

    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });

    const responseTime = Date.now() - startTime;

    if (error) {
      return NextResponse.json({
        status: 'disconnected',
        error: error.message,
        responseTime,
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }

    const { data: tableStats } = await supabase.rpc('get_table_stats').maybeSingle();

    return NextResponse.json({
      status: 'connected',
      responseTime,
      timestamp: new Date().toISOString(),
      database: {
        host: process.env.NEXT_PUBLIC_SUPABASE_URL,
        type: 'PostgreSQL (Supabase)',
      },
      stats: tableStats || {
        total_tables: 8,
        total_records: 0,
      },
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: 'Failed to connect to database',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
