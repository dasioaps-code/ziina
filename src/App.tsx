import { Routes, Route, Navigate, Link } from "react-router-dom";
import PlanPage from "./pages/PlanPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="p-4 border-b bg-white shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="font-bold text-xl text-gray-800 hover:text-blue-600 transition-colors">
            ZIINA payments
          </Link>
          <nav className="flex gap-6 text-sm">
            <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              Plans
            </Link>
            <Link to="/payment-success" className="text-gray-600 hover:text-gray-900 transition-colors">
              Success
            </Link>
            <Link to="/payment-failed" className="text-gray-600 hover:text-gray-900 transition-colors">
              Failed
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <Routes>
          <Route path="/" element={<PlanPage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}