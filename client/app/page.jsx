import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard'; // Import the new component
import Hero from '@/components/Hero'; // Import the new Hero component
import { FireIcon, BeakerIcon, CakeIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';



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

   // Define our categories for the new section
   const categories = [
    { name: 'Fruits & Vegetables', slug: 'fruits-vegetables', icon: <FireIcon className="h-8 w-8"/> },
    { name: 'Dairy & Eggs', slug: 'dairy-eggs', icon: <BeakerIcon className="h-8 w-8"/> },
    { name: 'Bakery', slug: 'bakery', icon: <CakeIcon className="h-8 w-8"/> },
    { name: 'Pantry Staples', slug: 'pantry-staples', icon: <ShoppingBagIcon className="h-8 w-8"/> },
  ];

  return (
    <main className="container mx-auto px-4 py-8">
      <Hero /> {/* Add the Hero component here */}
       {/* NEW CATEGORY SECTION */}
       <section id="categories" className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map(category => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </section>
      <h1 className="text-4xl font-extrabold text-center mb-2">
        Fresh Picks For You
      </h1>
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