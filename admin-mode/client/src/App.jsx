import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ManageTeams from "./pages/ManageTeams.jsx";
import ManageGroups from "./pages/ManageGroups.jsx";
import ManageMatches from "./pages/ManageMatches.jsx";
import ManageResults from "./pages/ManageResults.jsx";
import ManageGoalScorers from "./pages/ManageGoalScorers.jsx";
import ManageCards from "./pages/ManageCards.jsx";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams"
          element={
            <ProtectedRoute>
              <Layout>
                <ManageTeams />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups"
          element={
            <ProtectedRoute>
              <Layout>
                <ManageGroups />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/matches"
          element={
            <ProtectedRoute>
              <Layout>
                <ManageMatches />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/results"
          element={
            <ProtectedRoute>
              <Layout>
                <ManageResults />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/goal-scorers"
          element={
            <ProtectedRoute>
              <Layout>
                <ManageGoalScorers />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cards"
          element={
            <ProtectedRoute>
              <Layout>
                <ManageCards />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
