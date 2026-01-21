import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { AuthProvider } from "@/context/AuthContex";

import { ME } from "@/core/graphql/user/user.gql";

// Auth
import SignIn from "@/pages/AuthPages/SignIn";
import ResetPassword from "@/pages/AuthPages/ResetPassword";

// Layout
import AppLayout from "@/layout/AppLayout";

// Marketing
import DigitalHome from "@/pages/Dashboard/DigitalHome";
import MarketingEvent from "@/pages/Calendar";
import LeadEntry from "@/pages/Forms/LeadEntry";
import LeadTable from "@/pages/Tables/BasicTables";

// Sales (RM)
import SalesRMDashboard from "@/pages/Dashboard/salesHome";
import SalesEvent from "@/pages/Sales/Event_sales/Event_Rm";
import LeadStagesPage from "@/pages/Sales/LeadStagesPage";
import ViewLeadPage from "@/pages/Sales/ViewLeadPage";
import LeadProfileLanding from "@/pages/Sales/LeadProfileLanding";
import OnboardingProcess from "@/components/sales/OnboardingPage/OnboardingProcess";

// Admin
import AdminDashboard from "@/pages/Admin/AdminDashboard";
import IPKUsers from "@/pages/Admin/IPKUsers";

// Common
import Unauthorized from "@/pages/OtherPage/Unauthorized";
import NotFound from "@/pages/OtherPage/NotFound";
import UserProfiles from "@/pages/UserProfiles";
import Blank from "@/pages/Blank";

// Onboarding Steps
import ClientProfile from "@/components/sales/OnboardingPage/steps/ClientProfile";
import Authentication from "@/components/sales/OnboardingPage/steps/Authentication";
import RiskType from "@/components/sales/OnboardingPage/steps/RiskType";
import Suitability from "@/components/sales/OnboardingPage/steps/Suitability";
import Agreement from "@/components/sales/OnboardingPage/steps/Agreement";
import ESign from "@/components/sales/OnboardingPage/steps/ESign";
import OnboardingListPage from "@/components/sales/OnboardingPage/OnboardingListPage";
import OnboardingPage from "@/styles";
import "./styles/media.css";

type Role = "ADMIN" | "RM" | "STAFF" | "MARKETING" | "ANALYST";

/** Role-based landing */
function RoleLanding() {
  const { data, loading, error } = useQuery(ME, { fetchPolicy: "cache-first" });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm font-medium text-gray-600">
        Loading...
      </div>
    );
  }

  if (error || !data?.me) return <Navigate to="/signin" replace />;

  const role = data.me.role as Role;

  if (role === "RM") return <Navigate to="/sales/dashboard" replace />;
  if (role === "STAFF") return <Navigate to="/sales/dashboard" replace />;
  if (role === "MARKETING") return <Navigate to="/marketing/dashboard" replace />;
  if (role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;

  return <Navigate to="/unauthorized" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>

          {/* Public */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Private App Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<RoleLanding />} />

            {/* Admin */}
            <Route element={<ProtectedRoute allow={["ADMIN"]} />}>
              <Route path="admin/dashboard" element={<AdminDashboard />} />
              <Route path="admin/users" element={<IPKUsers />} />
            </Route>

            {/* Marketing */}
            <Route element={<ProtectedRoute allow={["MARKETING", "ADMIN", "STAFF"]} />}>
              <Route path="marketing/dashboard" element={<DigitalHome />} />
              <Route path="marketing/calendar" element={<MarketingEvent />} />
              <Route path="marketing/leads_create" element={<LeadEntry />} />
              <Route path="marketing/overall-leads" element={<LeadTable />} />
            </Route>

            {/* Sales (RM) */}
            <Route element={<ProtectedRoute allow={["RM", "ADMIN", "STAFF"]} />}>
              <Route path="sales/dashboard" element={<SalesRMDashboard />} />
              <Route path="sales/assigned" element={<Navigate to="/sales/stages" replace />} />
              <Route path="sales/stages" element={<LeadStagesPage />} />
              <Route path="sales/leads" element={<LeadProfileLanding />} />
              <Route path="sales/leads/:id" element={<ViewLeadPage />} />
              <Route path="sales/events" element={<SalesEvent />} />

              {/* ================= ONBOARDING MODULE ================= */}
              <Route path="sales/onboarding" element={<Outlet />}>

                {/* List page */}
                <Route index element={<OnboardingListPage />} />

                {/* Process */}
                <Route path="process" element={<OnboardingProcess />}>
                  <Route index element={<ClientProfile />} />
                  <Route path="client-profile" element={<ClientProfile />} />
                  <Route path="authentication" element={<Authentication />} />
                  <Route path="risk-type" element={<RiskType />} />
                  <Route path="suitability" element={<Suitability />} />
                  <Route path="agreement" element={<Agreement />} />
                  <Route path="e-sign" element={<ESign />} />
                </Route>

              </Route>
              {/* ====================================================== */}

            </Route>

            {/* Common */}
            <Route path="profile" element={<UserProfiles />} />
            <Route path="blank" element={<Blank />} />

          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}























