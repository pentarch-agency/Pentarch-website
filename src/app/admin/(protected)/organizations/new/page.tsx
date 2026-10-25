'use client';

import { useState } from 'react';
import { createOrganization } from '../actions';
import Link from 'next/link';

export default function NewOrganizationPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [slug, setSlug] = useState('');

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 63);
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    const result = await createOrganization(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // On success, the server action redirects
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <Link href="/admin/organizations" className="text-sm text-gray-500 hover:text-gray-700">
          &larr; Back to organizations
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Create Organization</h1>

      <form action={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Organization name
          </label>
          <input
            id="name"
            name="name"
            required
            onChange={(e) => setSlug(generateSlug(e.target.value))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
            placeholder="Acme Corp"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
            Subdomain slug
          </label>
          <div className="flex items-center">
            <input
              id="slug"
              name="slug"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none font-mono"
              placeholder="acme"
            />
            <span className="px-4 py-2.5 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-500 text-sm">
              .pentarch.agency
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Lowercase letters, numbers, and hyphens only.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create organization'}
          </button>
          <Link
            href="/admin/organizations"
            className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
