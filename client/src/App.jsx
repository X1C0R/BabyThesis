import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/LoginFolder/Register";
import UserLanding from "./components/landingpages/UserLanding";
import Login from "./components/LoginFolder/login";
import Accommodation from "./components/Accommodation/Accommodation";
import AdminProvesAccounts from "./components/Admin/AdminProvesAccounts";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register/>}/>
        <Route path="/" element={<UserLanding/>}/>
        <Route path="/accommodation" element={<Accommodation/>}/>
        <Route path="/AdminProvesAccounts" element={<AdminProvesAccounts/>}/>
      </Routes>
    </Router>
  );
}

export default App;