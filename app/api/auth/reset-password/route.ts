import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    const { data: user, error: userError } = await (supabase as any)
      .from('users')
      .select('id, email, role')
      .eq('email', email)
      .eq('role', 'super-admin')
      .maybeSingle();

    if (userError || !user) {
      return NextResponse.json(
        { message: 'Se o email existir, receberá instruções de redefinição de senha.' },
        { status: 200 }
      );
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const { error: tokenError } = await (supabase as any)
      .from('password_reset_tokens')
      .insert({
        user_id: user.id,
        token,
        expires_at: expiresAt.toISOString(),
        used: false,
      });

    if (tokenError) {
      console.error('Error creating reset token:', tokenError);
      return NextResponse.json({ error: 'Erro ao processar pedido' }, { status: 500 });
    }

    const resetUrl = `${request.headers.get('origin')}/reset-password/${token}`;

    console.log('Password Reset Link:', resetUrl);
    console.log('Email:', email);

    return NextResponse.json({
      message: 'Se o email existir, receberá instruções de redefinição de senha.',
      resetUrl,
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
