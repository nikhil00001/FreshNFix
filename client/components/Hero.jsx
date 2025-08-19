import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

export default function Hero() {
  return (
    
    <section className="relative h-[500px] rounded-2xl overflow-hidden mb-12">
      {/* Background Image */}
      <img
        src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=3600"
        alt="Fresh vegetables on a wooden table"
        className="w-full h-full object-cover"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40" />
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
          Your Daily Groceries, Delivered Fresh & On Time
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl drop-shadow-md">
          The best quality products for you and your family, available with just a few clicks.
        </p>
         {/* UPDATE: This is now a form */}
         <form action="/search" method="GET" className="w-full max-w-xl">
          <div className="relative">
            <input
              type="search"
              name="q" // This is important, it becomes the URL query parameter
              placeholder="Search for products..."
              className="w-full p-4 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
            <button type="submit" className="absolute top-1/2 right-2 -translate-y-1/2 p-3 bg-orange-500 text-white rounded-full hover:bg-orange-600">
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>
          </div>
        </form>
         {/* ADD THIS BUTTON */}
         <a 
           href="#categories"
           className="mt-4 px-6 py-2 border border-white rounded-full text-white font-semibold hover:bg-white hover:text-gray-900 transition-colors duration-300"
         >
           Browse All Categories
         </a>
      </div>
    </section>
  );
}

