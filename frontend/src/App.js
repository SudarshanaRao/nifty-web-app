
import './App.css';
import Login from './components/Login/Login'
import {Route, Routes} from "react-router-dom"
import Otp from './components/Otp/Otp'
import HomePage  from './components/HomePage/HomePage';
import Markets from './components/Market/Markets'
import '@fortawesome/fontawesome-free/css/all.min.css';
import Company  from './components/Company/Company';

function App() {
  
  return (
    <Routes>
      <Route path="/home" element={<HomePage />} />
      <Route path='/login' element={<Login />} />
      <Route path="/otp" element={<Otp />} />
      <Route path="/markets" element={<Markets />} />
      <Route path="/company" element={<Company />} />
    </Routes>
    
  );
}

export default App;
