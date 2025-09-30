import ProductCard from '@/components/ProductCard';

// Helper function to format the slug for display
function formatCategoryTitle(slug) {
    return slug
        .split('-')
        // Capitalize the first letter of each word
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

async function getCategoryProducts(slug) {
  try {
    // Our slugs are like "dairy-eggs", but our categories are "Dairy & Eggs"
    // We'll pass the raw category name to the API.
    const categoryName = slug.replace('-', ' & '); 
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    const res = await fetch(`${apiUrl}/api/products/category/${encodeURIComponent(categoryName)}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const products = await getCategoryProducts(slug);
  const title = formatCategoryTitle(slug);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">
        Shop in: <span className="text-blue-600">{title}</span>
      </h1>
      <p className="text-gray-600 mb-8">{products.length} product(s) found in this category.</p>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-gray-700">No products found in this category yet.</p>
          <p className="text-gray-500 mt-2">Check back soon!</p>
        </div>
      )}
    </main>
  );
}