import Link from 'next/link';

// This is a simple, presentational component.
export default function CategoryCard({ category }) {
  return (
    <Link href={`/category/${category.slug}`}>
      <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-transform duration-300 hover:-translate-y-1 border flex flex-col items-center text-center">
        <div className="text-blue-600 mb-2">{category.icon}</div>
        <h3 className="font-bold text-gray-800">{category.name}</h3>
      </div>
    </Link>
  );
}