import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Link, useNavigate } from 'react-router-dom'; // NEW: useNavigate

export default function Home() {
  const [colleges, setColleges] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

  // NEW: State to hold selected colleges for comparison
  const [selectedIds, setSelectedIds] = useState([]);
  const navigate = useNavigate(); 

  
  const { ref, inView } = useInView();

  const fetchColleges = async (resetPage = false) => {
    try {
      const currentPage = resetPage ? 1 : page;
      const res = await fetch(`https://college-discovery-platform-i9pb.onrender.com/api/colleges?page=${currentPage}&search=${search}&location=${location}`);
      const newData = await res.json();

      if (newData.length === 0) {
        setHasMore(false);
      } else {
        setHasMore(true);
        if (resetPage) {
          setColleges(newData);
        } else {
          setColleges((prev) => [...prev, ...newData]);
        }
      }
    } catch (error) {
      console.error("Error fetching colleges:", error);
    }
  };

  useEffect(() => {
    if (page > 1) fetchColleges(false);
  }, [page]);

  useEffect(() => {
    fetchColleges(true);
  }, []);

  useEffect(() => {
    if (inView && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [inView, hasMore]);

  const handleSearch = () => {
    setPage(1);
    fetchColleges(true);
  };

  // NEW: Handle checking/unchecking a college
  const toggleSelection = (e, id) => {
    e.preventDefault(); // Prevents the click from triggering the <Link> and taking us to the details page
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id)); // Remove it
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]); // Add it
      } else {
        alert("You can only compare up to 3 colleges at a time.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 relative pb-24 text-black">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-900 mb-8 text-center">
          Discover Top Colleges
        </h1>

        <div className="bg-white p-4 rounded-lg shadow-md mb-8 flex flex-col sm:flex-row gap-4 border border-gray-200">
          <input 
            type="text" 
            placeholder="Search by college name..." 
            className="flex-1 border p-2 rounded focus:outline-blue-500 text-black"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select 
            className="border p-2 rounded focus:outline-blue-500 bg-white text-black"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">All Locations</option>
            <option value="Shibpur">Shibpur</option>
            <option value="Bombay">Bombay</option>
            <option value="Trichy">Trichy</option>
          </select>
          <button 
            onClick={handleSearch}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-semibold"
          >
            Search
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {colleges.map((college, index) => (
            <Link 
              to={`/college/${college.id}`} 
              key={`${college.id}-${index}`} 
              className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 cursor-pointer ${selectedIds.includes(college.id) ? 'border-blue-500' : 'border-gray-200'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">{college.name}</h2>
                  <p className="text-gray-500">{college.location}</p>
                </div>
                <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">
                  ★ {college.rating}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-700 mt-4">
                <p><strong>Fees:</strong> ₹{college.fees.toLocaleString()}</p>
                
                {/* NEW: Compare Checkbox/Button */}
                <button 
                  onClick={(e) => toggleSelection(e, college.id)}
                  className={`px-4 py-2 rounded font-semibold text-sm transition-colors ${selectedIds.includes(college.id) ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {selectedIds.includes(college.id) ? '✓ Selected' : '+ Add to Compare'}
                </button>
              </div>
            </Link>
          ))}
        </div>

        {hasMore && (
          <div ref={ref} className="text-center py-8 text-gray-500">
            Loading more colleges...
          </div>
        )}
      </div>

      {/* NEW: Floating Compare Bar */}
      {selectedIds.length > 1 && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 flex justify-center items-center z-50">
          <div className="max-w-4xl w-full flex justify-between items-center px-4">
            <span className="text-gray-800 font-semibold text-lg">
              {selectedIds.length} Colleges Selected
            </span>
            <button 
              onClick={() => navigate(`/compare?ids=${selectedIds.join(',')}`)}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold shadow hover:bg-blue-700 transition-colors"
            >
              Compare Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}