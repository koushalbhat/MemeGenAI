import { NextResponse } from 'next/server'
import { createClient } from '../../../utils/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
  const baseUrl = host ? `${protocol}://${host}` : request.url;
  
  return NextResponse.redirect(new URL('/', baseUrl), { status: 302 })
}
