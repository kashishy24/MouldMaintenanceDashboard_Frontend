import React, { useEffect, useState } from "react";
import DashboardLayout from "../partials/DashboardLayout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

// 🔹 API base + endpoints
const BASE = (
  import.meta.env.VITE_BACKEND_BASE_URL || "http://192.168.1.14:3004/api"
).replace(/\/+$/, "");
const PM_STATUS_ENDPOINT = `${BASE}/PMStatus/MouldPMStatus`;
const PM_WEEKWISE_ENDPOINT = `${BASE}/PMStatus/MouldPMWeekWisePlan`;
const PM_MOULDWISE_PLAN_ENDPOINT = `${BASE}/PMStatus/MouldWisePMPlan`;
const PM_NEXT_DUE_ENDPOINT = `${BASE}/PMStatus/MouldWiseNextPMDuedate`;
const PM_NEXT_DUE_BY_SHOT_ENDPOINT = `${BASE}/PMStatus/MouldWiseNextPMDueByShot`;

// 🔹 Helper to format date
const formatDate = (iso) => {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  } catch {
    return iso;
  }
};

// ⛔️ pmByShotCountData DUMMY REMOVED

const nextSixMonthData = [
  { month: "Dec", count: 12 },
  { month: "Jan", count: 9 },
  { month: "Feb", count: 10 },
  { month: "Mar", count: 7 },
  { month: "Apr", count: 11 },
  { month: "May", count: 8 },
];

const PMStatus = () => {
  // 1️⃣ Top PM Warning/Alarm table
  const [pmStatusRows, setPmStatusRows] = useState([]);
  const [loadingPM, setLoadingPM] = useState(false);
  const [pmError, setPmError] = useState(null);

  // 2️⃣ Week-wise histogram
  const [weekWisePMPlan, setWeekWisePMPlan] = useState([]);
  const [loadingWeekPlan, setLoadingWeekPlan] = useState(false);
  const [weekPlanError, setWeekPlanError] = useState(null);

  // 3️⃣ PM in Plan table (Mould-wise plan)
  const [pmPlanRows, setPmPlanRows] = useState([]);
  const [loadingPmPlan, setLoadingPmPlan] = useState(false);
  const [pmPlanError, setPmPlanError] = useState(null);

  // 4️⃣ Next PM By Date table
  const [nextPmRows, setNextPmRows] = useState([]);
  const [loadingNextPm, setLoadingNextPm] = useState(false);
  const [nextPmError, setNextPmError] = useState(null);

  // 5️⃣ PM by Shot Count table
  const [pmShotRows, setPmShotRows] = useState([]);
  const [loadingPmShot, setLoadingPmShot] = useState(false);
  const [pmShotError, setPmShotError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      // flags
      setLoadingPM(true);
      setPmError(null);

      setLoadingWeekPlan(true);
      setWeekPlanError(null);

      setLoadingPmPlan(true);
      setPmPlanError(null);

      setLoadingNextPm(true);
      setNextPmError(null);

      setLoadingPmShot(true);
      setPmShotError(null);

      try {
        const [pmRes, weekRes, mouldPlanRes, nextPmRes, nextShotRes] =
          await Promise.all([
            axios.get(PM_STATUS_ENDPOINT),
            axios.get(PM_WEEKWISE_ENDPOINT),
            axios.get(PM_MOULDWISE_PLAN_ENDPOINT),
            axios.get(PM_NEXT_DUE_ENDPOINT),
            axios.get(PM_NEXT_DUE_BY_SHOT_ENDPOINT),
          ]);

        // ---- PM status mapping ----
        const pmRows = pmRes?.data?.data ?? [];
        const mappedPM = pmRows.map((r) => ({
          mould: r.MouldName || r.MouldID,
          status: r.MouldPMStatus ?? "-",
          nextPMDueDate: formatDate(r.NextPMDueDate),
          shotCount: r.NextPMDue ?? "-",
        }));
        setPmStatusRows(mappedPM);

        // ---- Week-wise plan mapping ----
        const weekRows = weekRes?.data?.data ?? [];
        const mappedWeek = weekRows.map((r) => ({
          week: r.WeekName,
          plan: r.PMPlanCount,
        }));
        setWeekWisePMPlan(mappedWeek);

        // ---- Mould-wise PM plan table mapping ----
        const planRows = mouldPlanRes?.data?.data ?? [];
        const mappedPlan = planRows.map((r) => ({
          mould: r.MouldName || r.MouldID,
          planDate: formatDate(r.PlanDate),
        }));
        setPmPlanRows(mappedPlan);

        // ---- Next PM due date table mapping ----
        const nextRows = nextPmRes?.data?.data ?? [];
        const mappedNext = nextRows.map((r) => ({
          mould: r.MouldName || r.MouldID,
          nextPMDate: formatDate(r.NextPMDueDate),
        }));
        setNextPmRows(mappedNext);

        // ---- PM by Shot Count table mapping ----
        const shotRows = nextShotRes?.data?.data ?? [];
        const mappedShot = shotRows.map((r) => ({
          mould: r.MouldName || r.MouldID,
          shotCount: r.NextPMDue ?? 0,
        }));
        setPmShotRows(mappedShot);
      } catch (err) {
        console.error("Error loading PM status data:", err);
        setPmError("Failed to load PM Warning / Alarm / Alert status.");
        setWeekPlanError("Failed to load week-wise PM plan.");
        setPmPlanError("Failed to load mould-wise PM plan.");
        setNextPmError("Failed to load Next PM By Date data.");
        setPmShotError("Failed to load PM By Shot Count data.");
      } finally {
        setLoadingPM(false);
        setLoadingWeekPlan(false);
        setLoadingPmPlan(false);
        setLoadingNextPm(false);
        setLoadingPmShot(false);
      }
    };

    fetchAll();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-4">
        {/* 1️⃣ Warning / Alarm / Alert */}
        <div className="bg-blue-700 text-white p-3 rounded-lg mb-3 font-semibold">
          Table which will show the PM Warning / Alarm / Alert status
        </div>

        <div
          className="bg-white shadow-md p-4 rounded-lg mb-6"
          style={{ maxHeight: "250px", overflowY: "auto" }}
        >
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 ">Mould</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Next PM Due</th>
                <th className="border p-2">Shot Count</th>
              </tr>
            </thead>
            <tbody>
              {loadingPM ? (
                <tr>
                  <td colSpan={4} className="border p-2 text-center">
                    Loading...
                  </td>
                </tr>
              ) : pmError ? (
                <tr>
                  <td colSpan={4} className="border p-2 text-center text-red-600">
                    {pmError}
                  </td>
                </tr>
              ) : pmStatusRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="border p-2 text-center">
                    No data available.
                  </td>
                </tr>
              ) : (
                pmStatusRows.map((row, i) => (
                  <tr key={i}>
                    <td className="border p-2">{row.mould}</td>
                    <td className="border p-2">{row.status}</td>
                    <td className="border p-2">{row.nextPMDueDate}</td>
                    <td className="border p-2">{row.shotCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 2️⃣ Week Wise Histogram */}
        <div className="bg-blue-700 text-white p-3 rounded-lg mb-3 font-semibold">
          Week wise PM Plan Histogram
        </div>
        <div
          className="bg-white shadow-md p-4 rounded-lg mb-6"
          style={{ height: 300 }}
        >
          {loadingWeekPlan ? (
            <div className="w-full h-full flex items-center justify-center">
              Loading chart...
            </div>
          ) : weekPlanError ? (
            <div className="w-full h-full flex items-center justify-center text-red-600">
              {weekPlanError}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekWisePMPlan}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="plan" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 3️⃣ PM in Plan Table (API: MouldWisePMPlan) */}
        <div className="bg-blue-700 text-white p-3 rounded-lg mb-3 font-semibold">
          Table which will show the PM in Plan
        </div>
        <div
          className="bg-white shadow-md p-4 rounded-lg mb-6"
          style={{ maxHeight: "250px", overflowY: "auto" }}
        >
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Mould</th>
                <th className="border p-2">Plan Date</th>
              </tr>
            </thead>
            <tbody>
              {loadingPmPlan ? (
                <tr>
                  <td colSpan={2} className="border p-2 text-center">
                    Loading...
                  </td>
                </tr>
              ) : pmPlanError ? (
                <tr>
                  <td colSpan={2} className="border p-2 text-center text-red-600">
                    {pmPlanError}
                  </td>
                </tr>
              ) : pmPlanRows.length === 0 ? (
                <tr>
                  <td colSpan={2} className="border p-2 text-center">
                    No data available.
                  </td>
                </tr>
              ) : (
                pmPlanRows.map((row, i) => (
                  <tr key={i}>
                    <td className="border p-2">{row.mould}</td>
                    <td className="border p-2">{row.planDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 4️⃣ PM Due Date Table ASC (API: MouldWiseNextPMDuedate) */}
        <div className="bg-blue-700 text-white p-3 rounded-lg mb-3 font-semibold">
          Table which will show Next PM By Date
        </div>
        <div
          className="bg-white shadow-md p-4 rounded-lg mb-6"
          style={{ maxHeight: "250px", overflowY: "auto" }}
        >
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Mould</th>
                <th className="border p-2">Duration</th>
              </tr>
            </thead>
            <tbody>
              {loadingNextPm ? (
                <tr>
                  <td colSpan={2} className="border p-2 text-center">
                    Loading...
                  </td>
                </tr>
              ) : nextPmError ? (
                <tr>
                  <td colSpan={2} className="border p-2 text-center text-red-600">
                    {nextPmError}
                  </td>
                </tr>
              ) : nextPmRows.length === 0 ? (
                <tr>
                  <td colSpan={2} className="border p-2 text-center">
                    No data available.
                  </td>
                </tr>
              ) : (
                nextPmRows
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(a.nextPMDate) - new Date(b.nextPMDate)
                  )
                  .map((row, i) => (
                    <tr key={i}>
                      <td className="border p-2">{row.mould}</td>
                      <td className="border p-2">{row.nextPMDate}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {/* 5️⃣ Next 6 months chart */}
        <div className="bg-blue-700 text-white p-3 rounded-lg mb-3 font-semibold">
          Chart for showing next 6 months how many mould will come in PM
        </div>
        <div
          className="bg-white shadow-md p-4 rounded-lg mb-6"
          style={{ height: 300 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={nextSixMonthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 6️⃣ Shot Count ASC (API: MouldWiseNextPMDueByShot) */}
        <div className="bg-blue-700 text-white p-3 rounded-lg mb-3 font-semibold">
          Table which will show the PM by Shot Count
        </div>
        <div
          className="bg-white shadow-md p-4 rounded-lg mb-6"
          style={{ maxHeight: "250px", overflowY: "auto" }}
        >
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Mould</th>
                <th className="border p-2">Shot Count</th>
              </tr>
            </thead>
            <tbody>
              {loadingPmShot ? (
                <tr>
                  <td colSpan={2} className="border p-2 text-center">
                    Loading...
                  </td>
                </tr>
              ) : pmShotError ? (
                <tr>
                  <td colSpan={2} className="border p-2 text-center text-red-600">
                    {pmShotError}
                  </td>
                </tr>
              ) : pmShotRows.length === 0 ? (
                <tr>
                  <td colSpan={2} className="border p-2 text-center">
                    No data available.
                  </td>
                </tr>
              ) : (
                pmShotRows
                  .slice()
                  .sort((a, b) => a.shotCount - b.shotCount)
                  .map((row, i) => (
                    <tr key={i}>
                      <td className="border p-2">{row.mould}</td>
                      <td className="border p-2">{row.shotCount}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PMStatus;
