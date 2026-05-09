import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function CollegeDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [newQuestion, setNewQuestion] = useState("");

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    const res = await fetch(`https://college-discovery-platform-i9pb.onrender.com/api/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ college_id: id, question_text: newQuestion })
    });

    if (res.ok) {
      const result = await res.json();
      // Use setData (not setCollege) and update 'qna' (not 'questions') to match your JSX
      setData(prev => ({
        ...prev,
        qna: [{ id: Date.now(), question: result.question_text, answer: "Pending staff response..." }, ...(prev.qna || [])]
      }));
      setNewQuestion("");
    }
  };

  useEffect(() => {
    fetch(`https://college-discovery-platform-i9pb.onrender.com/api/colleges/${id}`)
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error("Error fetching details:", err));
  }, [id]);

  if (!data) return <div className="text-center p-20 text-2xl text-black">Loading College Details...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <Link to="/" className="text-blue-600 hover:underline mb-6 inline-block font-semibold">
          &larr; Back to Search
        </Link>

        <div className="mb-8 border-b pb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{data.name}</h1>
          <p className="text-lg text-gray-600 mb-4">{data.location} • Rating: ★ {data.rating}</p>
          <p className="text-gray-800 text-lg">{data.overview}</p>
          <p className="mt-4 text-xl font-semibold text-blue-900">Fees: ₹{data.fees.toLocaleString()}</p>
        </div>

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

        {/* Updated Q&A Section with Interactive Form */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Q&A / Discussion</h2>
          
          <form onSubmit={handleQuestionSubmit} className="mb-6 flex gap-2">
            <input 
              type="text" 
              placeholder="Ask a question..." 
              className="flex-1 border p-2 rounded text-black focus:outline-blue-500"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700">
              Ask
            </button>
          </form>

          <div className="space-y-4">
            {data.qna?.map((item) => (
              <div key={item.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r">
                <p className="font-semibold text-gray-800">Q: {item.question}</p>
                <p className="text-gray-600 mt-1">A: {item.answer || "Waiting for an answer..."}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}