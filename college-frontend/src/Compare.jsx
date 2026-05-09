import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

export default function Compare() {
  const [searchParams] = useSearchParams();
  const ids = searchParams.get('ids'); // Gets "1,2" from the URL
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);


  
  useEffect(() => {
    if (ids) {
      fetch(`https://college-discovery-platform-i9pb.onrender.com/api/compare?ids=${ids}`)
        .then((res) => res.json())
        .then((data) => {
          setColleges(data);
          setLoading(false);
        })
        .catch((err) => console.error("Error fetching comparison:", err));
    }
  }, [ids]);

  if (loading) return <div className="text-center p-20 text-xl text-black">Loading Comparison...</div>;
  if (colleges.length === 0) return <div className="text-center p-20 text-black">No colleges selected to compare.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Compare Colleges</h1>
          <Link to="/" className="text-blue-600 hover:underline font-semibold">
            &larr; Back to Search
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="p-4 border-b-2 border-gray-200 bg-gray-100 font-semibold text-gray-700 w-1/4">Feature</th>
                {colleges.map(college => (
                  <th key={college.id} className="p-4 border-b-2 border-gray-200 bg-gray-100 font-bold text-blue-900 text-lg text-center">
                    {college.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Location Row */}
              <tr className="hover:bg-gray-50">
                <td className="p-4 border-b font-semibold text-gray-700">Location</td>
                {colleges.map(college => (
                  <td key={college.id} className="p-4 border-b text-center">{college.location}</td>
                ))}
              </tr>
              {/* Rating Row */}
              <tr className="hover:bg-gray-50">
                <td className="p-4 border-b font-semibold text-gray-700">Rating</td>
                {colleges.map(college => (
                  <td key={college.id} className="p-4 border-b text-center font-bold text-yellow-600">★ {college.rating}</td>
                ))}
              </tr>
              {/* Fees Row */}
              <tr className="hover:bg-gray-50">
                <td className="p-4 border-b font-semibold text-gray-700">Fees</td>
                {colleges.map(college => (
                  <td key={college.id} className="p-4 border-b text-center">₹{college.fees?.toLocaleString()}</td>
                ))}
              </tr>
              {/* Placement Rate Row */}
              <tr className="hover:bg-gray-50">
                <td className="p-4 border-b font-semibold text-gray-700">Placement %</td>
                {colleges.map(college => (
                  <td key={college.id} className="p-4 border-b text-center text-green-700 font-bold">
                    {college.placement_percentage ? `${college.placement_percentage}%` : 'N/A'}
                  </td>
                ))}
              </tr>
              {/* Average Package Row */}
              <tr className="hover:bg-gray-50">
                <td className="p-4 border-b font-semibold text-gray-700">Avg. Package</td>
                {colleges.map(college => (
                  <td key={college.id} className="p-4 border-b text-center">
                    {college.average_package || 'N/A'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}