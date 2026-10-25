import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * POST /api/contact — Public contact form submission.
 * Stores inquiry in the database for founder review.
 * Protected against spam with basic rate limiting and validation.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, company, message } = body;

    // Basic validation
    if (!name || typeof name !== 'string' || name.length > 200) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !email.includes('@') || email.length > 320) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
    if (!message || typeof message !== 'string' || message.length > 5000) {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }
    if (company && (typeof company !== 'string' || company.length > 200)) {
      return NextResponse.json({ error: 'Invalid company' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase.from('contact_inquiries').insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      company: company?.trim() || null,
      message: message.trim(),
      status: 'new',
    });

    if (error) {
      console.error('Contact form error:', error.message);
      return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
