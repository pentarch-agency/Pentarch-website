'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');

    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          company: formData.get('company'),
          message: formData.get('message'),
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to submit');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="container mx-auto px-6 py-16 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Get in touch</h1>
      <p className="text-gray-600 mb-8">
        Tell us about your project and we&apos;ll get back to you within one business day.
      </p>

      {status === 'success' ? (
        <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-green-800">
          Thanks for reaching out! We&apos;ll be in touch soon.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text" id="name" name="name" required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email" id="email" name="email" required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Company (optional)</label>
            <input
              type="text" id="company" name="company"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              id="message" name="message" required rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {status === 'submitting' ? 'Sending...' : 'Send message'}
          </button>
          {status === 'error' && (
            <p className="text-red-600 text-sm">Something went wrong. Please try again.</p>
          )}
        </form>
      )}
    </div>
  );
}
