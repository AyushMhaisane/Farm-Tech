import { Link } from 'react-router-dom';

const ResourcesHub = () => {
  return (
    <div className="max-w-5xl mx-auto py-8">
      
      {/* Header */}
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">Farm Equipment Exchange</h2>
        <p className="text-gray-500 mt-3 text-lg">Are you looking to hire equipment, or do you have machinery to rent out?</p>
      </div>

      {/* Choice Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        
        {/* Card 1: Resource Gainer */}
        <Link 
          to="/resources/gainer" 
          className="group relative bg-white rounded-3xl p-10 shadow-sm border-2 border-green-100 hover:border-green-500 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center overflow-hidden"
        >
          {/* Decorative background circle */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
          
          <div className="relative z-10">
            <div className="w-24 h-24 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-5xl mb-6 mx-auto group-hover:scale-110 transition-transform shadow-inner">
              🚜
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Resource Gainer</h3>
            <p className="text-gray-500 font-medium px-4">
              Find and hire tractors, harvesters, irrigation tools, and more from local farmers near your location.
            </p>
            <div className="mt-8 inline-block bg-green-50 text-green-700 font-bold py-2 px-6 rounded-full group-hover:bg-green-600 group-hover:text-white transition-colors">
              Find Equipment →
            </div>
          </div>
        </Link>

        {/* Card 2: Resource Provider */}
        <Link 
          to="/resources/provider" 
          className="group relative bg-white rounded-3xl p-10 shadow-sm border-2 border-blue-100 hover:border-blue-500 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center overflow-hidden"
        >
           {/* Decorative background circle */}
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
          
          <div className="relative z-10">
            <div className="w-24 h-24 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-5xl mb-6 mx-auto group-hover:scale-110 transition-transform shadow-inner">
              🤝
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Resource Provider</h3>
            <p className="text-gray-500 font-medium px-4">
              List your idle farming machinery and tools to earn extra income by renting them to your community.
            </p>
            <div className="mt-8 inline-block bg-blue-50 text-blue-700 font-bold py-2 px-6 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
              List Equipment →
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
};

export default ResourcesHub;