import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import Hero from '@/components/Hero';

// --- NEW, RELEVANT SVG ICONS ---

// A simple icon representing leafy greens or vegetables
const VegetableIcon = () => (
  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.82 18.24c-2.1-2.94-3.82-6.43-4.24-9.24" />
    <path d="M6.28 17.21c-2.83-2.52-3.83-6.5-2.28-9.21" />
    <path d="M14.65 14.39c-2.45-2.2-3.6-5.8-2.65-8.39" />
  </svg>
);

// A simple icon representing an apple or fruit
const FruitIcon = () => (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a5 5 0 0 0-5 5c0 2.24 1.24 4.16 3 5.12V14a5 5 0 0 0-5 5h14a5 5 0 0 0-5-5v-1.88c1.76-.96 3-2.88 3-5.12a5 5 0 0 0-5-5Z" />
        <path d="M12 2a2 2 0 0 1 2 2.5c0 .83-.34 1.5-.9 2" />
    </svg>
);

// A simple icon representing a milk carton or dairy product
const DairyIcon = () => (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3h8c1.1 0 2 .9 2 2v11c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2Z" />
        <path d="M8 3v3h8V3" />
        <path d="m14 10-2 2-2-2" />
    </svg>
);

// Async function to fetch product data from our API
async function getProducts() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${apiUrl}/api/products`, { 
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

  // --- UPDATED CATEGORIES ARRAY ---
  const categories = [
    { name: 'Vegetables', slug: 'vegetables', icon: <VegetableIcon /> },
    { name: 'Fruits', slug: 'fruits', icon: <FruitIcon /> },
    { name: 'Dairy Products', slug: 'dairy-products', icon: <DairyIcon /> },
  ];

  return (
    <main className="container mx-auto px-4 py-8">
      <Hero />
      
      <section id="categories" className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800">Shop by Category</h2>

        {/* --- UPDATED GRID LAYOUT --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
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
