import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";

// Lazy-load all pages for code splitting — improves initial load time (Core Web Vitals)
const Home = lazy(() => import("./pages/Home.jsx"));
const Teams = lazy(() => import("./pages/Teams.jsx"));
const Matches = lazy(() => import("./pages/Matches.jsx"));
const Results = lazy(() => import("./pages/Results.jsx"));
const PointsTablePage = lazy(() => import("./pages/PointsTablePage.jsx"));
const TopScorers = lazy(() => import("./pages/TopScorers.jsx"));

// Loading spinner shown while a lazy page chunk loads
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      <main className="min-w-0">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/results" element={<Results />} />
            <Route path="/points" element={<PointsTablePage />} />
            <Route path="/top-scorers" element={<TopScorers />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;
