// App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import DashboardLayout from "./components/layout/DashboardLayout";
import SignIn from "./pages/Auth/SignIn";
import AllLotteriesPage from "./pages/Dashboard/AllLotteriesPage";
import CreateLotteryPage from "./pages/Dashboard/CreateLotteryPage";
import EditLotteryPage from "./pages/Dashboard/EditLotteryPage";
import CopyLotteryPage from "./pages/Dashboard/CopyLotteryPage";
import LotteryPage from "./pages/LotteryPage";

function App() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  return (
    <Router>
      <Routes>
        {/* Public lottery page does not require auth */}
        <Route path="/l/:id" element={<LotteryPage />} />

        {/* Auth-protected dashboard */}
        {user ? (
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<AllLotteriesPage />} />
            <Route path="/dashboard/create" element={<CreateLotteryPage />} />
            <Route path="/dashboard/edit/:id" element={<EditLotteryPage />} />
            <Route path="/dashboard/copy/:id" element={<CopyLotteryPage />} />
            <Route path="*" element={<AllLotteriesPage />} />
          </Route>
        ) : (
          // If not logged in, show SignIn as default
          <Route path="*" element={<SignIn />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
