import AddToCartButton from '@/components/AddToCartButton';

async function getProduct(id) {
  try {

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${apiUrl}/api/products/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function ProductDetailsPage({ params }) {
  const product = await getProduct(params.id);

  if (!product) {
    return <p className="text-center mt-12">Product not found.</p>;
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Left Column: Image */}
        <div className="bg-white border rounded-2xl shadow-sm p-4">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-auto object-contain aspect-square" 
          />
        </div>

        {/* Right Column: Details */}
        <div>
          {product.tag && (
            <span className="bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              {product.tag}
            </span>
          )}
          {/*<h1 className="text-4xl font-extrabold mt-4">{product.name}</h1>*/}
          <h1 className="text-3xl md:text-4xl font-extrabold mt-4">{product.name}</h1>

          <p className="text-lg text-gray-500 mt-2">{product.category}</p>
          {/*<p className="text-4xl font-bold my-6">*/}

          <p className="text-3xl md:text-4xl font-bold my-6">
            ₹{product.price}
            <span className="text-xl font-medium text-gray-500"> / {product.unit}</span>
          </p>
          
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-gray-700 leading-relaxed">{product.description}</p>
          
          {/* Interactive Client Component for the button */}
          <AddToCartButton productId={product._id} />
        </div>
      </div>
    </main>
  );
}