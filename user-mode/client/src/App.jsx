import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Teams from "./pages/Teams.jsx";
import Matches from "./pages/Matches.jsx";
import Results from "./pages/Results.jsx";
import PointsTablePage from "./pages/PointsTablePage.jsx";
import TopScorers from "./pages/TopScorers.jsx";

function App() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      <main className="min-w-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/results" element={<Results />} />
          <Route path="/points" element={<PointsTablePage />} />
          <Route path="/top-scorers" element={<TopScorers />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
