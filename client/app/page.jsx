import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import Hero from '@/components/Hero';
// 1. Import the new, better icons from Lucide
import { Carrot, Apple, Milk } from 'lucide-react';

// Async function to fetch product data from our API
async function getProducts() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${apiUrl}/api/products`, {
      cache: 'no-store'
    });
    if (!res.ok) {
      throw new Error('Failed to fetch products');
    }
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function HomePage() {
  const products = await getProducts();

  // 2. Updated categories array with new icons and colors
  const categories = [
    { name: 'Vegetables', slug: 'vegetables', icon: <Carrot />, color: 'text-green-600' },
    { name: 'Fruits', slug: 'fruits', icon: <Apple />, color: 'text-red-500' },
    { name: 'Dairy Products', slug: 'dairy-products', icon: <Milk />, color: 'text-blue-500' },
  ];

  return (
    <main className="container mx-auto px-4 py-8">
      <Hero />
      <section id="categories" className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-gray-800">Shop by Category</h2>

        {/* 3. Updated grid for a cleaner, centered 3-column layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
          {categories.map(category => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </section>

      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800" id="products">
        Our Fresh Picks
      </h2>
      <p className="text-center text-gray-500 mb-8">
        Groceries delivered fresh from the farm to your door, on a fixed time.
      </p>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
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

