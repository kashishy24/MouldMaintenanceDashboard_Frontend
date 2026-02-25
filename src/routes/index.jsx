import { Routes, Route } from "react-router-dom";
import PrivateRoute from "../pages/PrivateRoute.jsx";

// pages
import Login from "../pages/Login.jsx";
import Home from "../pages/Home.jsx";
import Error from "../pages/Error.jsx";
import MouldMaintenanceHistory from "../pages/MouldMaintenanceHistory/MouldMaintanceHistory.jsx";
import PMStatus from "../pages/PMStatus.jsx";
import HCStatus from "../pages/HCStatus.jsx";
import SparePart from "../pages/SparePart.jsx";
import MouldSummary from "../pages/MouldSummary.jsx";
import HCHistory from "../pages/MouldMaintenanceHistory/HCHistory.jsx";
import MouldBreakdownHistory from "../pages/MouldMaintenanceHistory/BreakDownHistory.jsx";
import SparePartHistory from "../pages/MouldMaintenanceHistory/SparePartHistory.jsx";
import Parameters from "../pages/Parameters.jsx";
import PMCheckPointReport from "../pages/MouldMaintenanceHistory/PMCheckPointReport.jsx";
import HCCheckpointReport from "../pages/MouldMaintenanceHistory/HCCheckpointReport.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/home"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />

      <Route
        path="/MouldMaintenanceHistory"
        element={
          <PrivateRoute>
            <MouldMaintenanceHistory />
          </PrivateRoute>
        }
      />

      <Route
        path="/PMStatus"
        element={
          <PrivateRoute>
            <PMStatus />
          </PrivateRoute>
        }
      />

      <Route
        path="/HCStatus"
        element={
          <PrivateRoute>
            <HCStatus />
          </PrivateRoute>
        }
      />

      <Route
        path="/SparePart"
        element={
          <PrivateRoute>
            <SparePart />
          </PrivateRoute>
        }
      />

      <Route
        path="/MouldSummary"
        element={
          <PrivateRoute>
            <MouldSummary />
          </PrivateRoute>
        }
      />
 <Route
        path="/parameters"
        element={
          <PrivateRoute>
            <Parameters />
          </PrivateRoute>
        }
      />
      <Route
        path="/HCHistory"
        element={
          <PrivateRoute>
            <HCHistory />
          </PrivateRoute>
        }
      />

      <Route
        path="/MouldBreakdownHistory"
        element={
          <PrivateRoute>
            <MouldBreakdownHistory />
          </PrivateRoute>
        }
      />

      <Route
        path="/SparePartHistory"
        element={
          <PrivateRoute>
            <SparePartHistory />
          </PrivateRoute>
        }
      />

      <Route
        path="/PMCheckPointReport"
        element={
          <PrivateRoute>
            <PMCheckPointReport />
          </PrivateRoute>
        }
      />

      <Route
        path="/HCCheckPointReport"
        element={
          <PrivateRoute>
            <HCCheckpointReport />
          </PrivateRoute>
        }
      />

      {/* Catch-all route */}
      <Route path="*" element={<Error />} />
    </Routes>
  );
}
