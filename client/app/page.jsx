import ProductCard from '@/components/ProductCard';

// Async function to fetch product data from our API
async function getProducts() {
  try {
    const res = await fetch('http://localhost:5001/api/products', { 
      cache: 'no-store' // Use this to ensure fresh data on every request
    });

    if (!res.ok) {
      throw new Error('Failed to fetch products');
    }
    return res.json();
  } catch (error) {
    console.error(error);
    return []; // Return an empty array on error
  }
}

// This is a Server Component, so we can make it async
export default async function HomePage() {
  const products = await getProducts();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold text-center mb-2">
        Fresh Picks For You
      </h1>
      <p className="text-center text-gray-500 mb-8">
        Groceries delivered fresh from the farm to your door, on a fixed time.
      </p>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">No products found. Please add some products!</p>
      )}
    </main>
  );
}