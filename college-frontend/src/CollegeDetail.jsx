import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function CollegeDetail() {
  const { id } = useParams(); // Grabs the college ID from the URL
  const [data, setData] = useState(null);

  useEffect(() => {
    // Fetch the single college data from your Node.js backend
    fetch(`http://localhost:5000/api/colleges/${id}`)
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error("Error fetching details:", err));
  }, [id]);

  if (!data) return <div className="text-center p-20 text-2xl text-black">Loading College Details...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200">
        
        {/* Back Button */}
        <Link to="/" className="text-blue-600 hover:underline mb-6 inline-block font-semibold">
          &larr; Back to Search
        </Link>

        {/* Overview Section */}
        <div className="mb-8 border-b pb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{data.name}</h1>
          <p className="text-lg text-gray-600 mb-4">{data.location} • Rating: ★ {data.rating}</p>
          <p className="text-gray-800 text-lg">{data.overview}</p>
          <p className="mt-4 text-xl font-semibold text-blue-900">Fees: ₹{data.fees.toLocaleString()}</p>
        </div>

        {/* Courses & Placements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-blue-900">Courses Offered</h2>
            <ul className="list-disc pl-5 space-y-2">
              {data.courses?.map((course) => (
                <li key={course.id} className="text-gray-700">{course.course_name}</li>
              ))}
            </ul>
          </div>

          <div className="bg-green-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-green-900">Placement Stats</h2>
            <ul className="space-y-4">
              {data.placements?.map((place) => (
                <li key={place.id} className="bg-white p-4 rounded shadow-sm border border-green-100">
                  <p className="text-gray-700"><strong>Placement Rate:</strong> {place.placement_percentage}%</p>
                  <p className="text-gray-700"><strong>Average Package:</strong> {place.average_package}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Q&A Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Q&A / Discussion</h2>
          <div className="space-y-4">
            {data.qna?.map((item) => (
              <div key={item.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r">
                <p className="font-semibold text-gray-800">Q: {item.question}</p>
                <p className="text-gray-600 mt-1">A: {item.answer}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}