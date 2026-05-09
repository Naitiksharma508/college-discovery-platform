import { Routes, Route } from 'react-router-dom';
import Home from './home';
import CollegeDetail from './CollegeDetail';
import Compare from './Compare';



function App() {
  return (
    <Routes>
      {/* If the URL is exactly "/", show the Home list */}
      <Route path="/" element={<Home />} /> 
      {/* If the URL is "/college/something", show the details */}
      <Route path="/college/:id" element={<CollegeDetail />} />
      <Route path="/compare" element={<Compare />} />
    </Routes>
  );
}

export default App;