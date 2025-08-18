import ProductCard from '@/components/ProductCard';

// Fetch search results from our API
async function getSearchResults(query) {
  if (!query) return [];
  try {
    const res = await fetch(`http://localhost:5001/api/products/search?q=${query}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch results');
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

// This is an async Server Component
export default async function SearchPage({ searchParams }) {
  const query = searchParams.q || '';
  const products = await getSearchResults(query);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">
        Search Results for: <span className="text-blue-600">"{query}"</span>
      </h1>
      <p className="text-gray-600 mb-8">{products.length} product(s) found.</p>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-gray-700">No products found matching your search.</p>
          <p className="text-gray-500 mt-2">Try searching for something else!</p>
        </div>
      )}
    </main>
  );
}