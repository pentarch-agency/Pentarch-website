import { headers } from 'next/headers';

export default async function ProductPage() {
  const headersList = await headers();
  const productSlug = headersList.get('x-pentarch-product-slug');

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {productSlug}
        </h1>
        <p className="text-gray-500">
          Product application shell. Each product defines its own content and auth.
        </p>
      </div>
    </div>
  );
}
