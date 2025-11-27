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
const HC_STATUS_ENDPOINT = `${BASE}/HCStatus/MouldHCStatus`;
const HC_WEEKWISE_ENDPOINT = `${BASE}/HCStatus/MouldHCWeekWisePlan`;
const HC_MOULDWISE_PLAN_ENDPOINT = `${BASE}/HCStatus/MouldWiseHCPlan`;
const HC_NEXT_DUE_ENDPOINT = `${BASE}/HCStatus/MouldWiseNextHCDuedate`;
const HC_NEXT_DUE_BY_SHOT_ENDPOINT = `${BASE}/HCStatus/MouldWiseNextHCDueByShot`;

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

// ⛔️ hcByShotCountData dummy REMOVED
// ⛔️ hcByData dummy already removed in previous step

const nextSixMonthData = [
  { month: "Dec", count: 12 },
  { month: "Jan", count: 9 },
  { month: "Feb", count: 10 },
  { month: "Mar", count: 7 },
  { month: "Apr", count: 11 },
  { month: "May", count: 8 },
];

const HCStatus = () => {
  // 🔹 1) HC Warning / Alarm / Alert table (API)
  const [hcStatusRows, setHcStatusRows] = useState([]);
  const [loadingHC, setLoadingHC] = useState(false);
  const [hcError, setHcError] = useState(null);

  // 🔹 2) Week-wise HC plan histogram (API)
  const [weekWisehcPlan, setWeekWisehcPlan] = useState([]);
  const [loadingWeekPlan, setLoadingWeekPlan] = useState(false);
  const [weekPlanError, setWeekPlanError] = useState(null);

  // 🔹 3) HC in Plan table (Mould-wise HC plan, API)
  const [hcPlanRows, setHcPlanRows] = useState([]);
  const [loadingHcPlan, setLoadingHcPlan] = useState(false);
  const [hcPlanError, setHcPlanError] = useState(null);

  // 🔹 4) Next HC Date table (API: MouldWiseNextHCDuedate)
  const [nextHcRows, setNextHcRows] = useState([]);
  const [loadingNextHc, setLoadingNextHc] = useState(false);
  const [nextHcError, setNextHcError] = useState(null);

  // 🔹 5) HC by Shot Count table (API: MouldWiseNextHCDueByShot)
  const [hcShotRows, setHcShotRows] = useState([]);
  const [loadingHcShot, setLoadingHcShot] = useState(false);
  const [hcShotError, setHcShotError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoadingHC(true);
      setHcError(null);

      setLoadingWeekPlan(true);
      setWeekPlanError(null);

      setLoadingHcPlan(true);
      setHcPlanError(null);

      setLoadingNextHc(true);
      setNextHcError(null);

      setLoadingHcShot(true);
      setHcShotError(null);

      try {
        const [hcRes, weekRes, planRes, nextRes, shotRes] = await Promise.all([
          axios.get(HC_STATUS_ENDPOINT),
          axios.get(HC_WEEKWISE_ENDPOINT),
          axios.get(HC_MOULDWISE_PLAN_ENDPOINT),
          axios.get(HC_NEXT_DUE_ENDPOINT),
          axios.get(HC_NEXT_DUE_BY_SHOT_ENDPOINT),
        ]);

        // ---- HC status mapping ----
        const rows = hcRes?.data?.data ?? [];
        const mapped = rows.map((r) => ({
          mould: r.MouldName || r.MouldID,
          status: r.MouldHealthStatus ?? "-",
          nextHCDueDate: formatDate(r.NextHCDueDate),
          shotCount: r.HealthCheckDue ?? "-", // HealthCheckDue as shot count
        }));
        setHcStatusRows(mapped);

        // ---- Week-wise HC plan mapping ----
        const weekRows = weekRes?.data?.data ?? [];
        const mappedWeek = weekRows.map((r) => ({
          week: r.WeekName,
          plan: r.HCPlanCount,
        }));
        setWeekWisehcPlan(mappedWeek);

        // ---- Mould-wise HC plan (hc in Plan table) mapping ----
        const planRows = planRes?.data?.data ?? [];
        const mappedPlan = planRows.map((r) => ({
          mould: r.MouldName || r.MouldID,
          planDate: formatDate(r.PlanDate),
        }));
        setHcPlanRows(mappedPlan);

        // ---- Next HC due date table mapping ----
        const nextRows = nextRes?.data?.data ?? [];
        const mappedNext = nextRows.map((r) => ({
          mould: r.MouldName || r.MouldID,
          nextHCDate: formatDate(r.NextHCDueDate),
        }));
        setNextHcRows(mappedNext);

        // ---- HC by Shot Count table mapping ----
        const shotRows = shotRes?.data?.data ?? [];
        const mappedShot = shotRows.map((r) => ({
          mould: r.MouldName || r.MouldID,
          shotCount: r.HealthCheckDue ?? 0,
        }));
        setHcShotRows(mappedShot);
      } catch (err) {
        console.error("Failed to load HC data:", err);
        setHcError("Failed to load HC Warning / Alarm / Alert status.");
        setWeekPlanError("Failed to load week-wise HC plan.");
        setHcPlanError("Failed to load HC in Plan data.");
        setNextHcError("Failed to load Next HC By Date data.");
        setHcShotError("Failed to load HC by Shot Count data.");
      } finally {
        setLoadingHC(false);
        setLoadingWeekPlan(false);
        setLoadingHcPlan(false);
        setLoadingNextHc(false);
        setLoadingHcShot(false);
      }
    };

    fetchAll();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-4">
        {/* 1️⃣ Warning / Alarm / Alert */}
        <div className="bg-blue-900 text-center text-white px-8 py-5 rounded-md mb-2 text-medium font-bold block w-fit">
          Table which will show the hc Warning / Alarm / Alert status
        </div>

        <div
          className="bg-white shadow-md rounded-lg mb-6"
          style={{ maxHeight: "250px", overflowY: "auto" }}
        >
          <table className="w-full border border-collapse-separate">
            <thead className="sticky top-0 z-30 bg-blue-700 text-white text-center">
              <tr>
                <th className="border p-2">Mould</th>
                <th className="border p-2 ">Status</th>
                <th className="border p-2 ">Next HC Due</th>
                <th className="border p-2 ">Shot Count</th>
              </tr>
            </thead>
            <tbody>
              {loadingHC ? (
                <tr>
                  <td colSpan={4} className="border p-2 text-center">
                    Loading...
                  </td>
                </tr>
              ) : hcError ? (
                <tr>
                  <td colSpan={4} className="border p-2 text-center text-red-600">
                    {hcError}
                  </td>
                </tr>
              ) : hcStatusRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="border p-2 text-center">
                    No data available.
                  </td>
                </tr>
              ) : (
                hcStatusRows.map((row, i) => (
                  <tr key={i}>
                    <td className="border p-2 text-center text-black font-medium">{row.mould}</td>
                    <td className="border p-2 text-center text-black font-medium">{row.status}</td>
                    <td className="border p-2 text-center text-black font-medium">{row.nextHCDueDate}</td>
                    <td className="border p-2 text-center text-black font-medium">{row.shotCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 2️⃣ Week Wise Histogram (API: MouldHCWeekWisePlan) */}
        <div className="bg-blue-900 text-center text-white px-8 py-5 rounded-md mb-2 text-medium font-bold block w-fit">
          Week wise hc Plan Histogram
        </div>
        <div className="bg-white shadow-md p-4 rounded-lg mb-6" style={{ height: 300 }}>
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
              <BarChart data={weekWisehcPlan}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week"  tick={{ fontSize: 15, fill: "#000", fontWeight: "bold" }} />
                <YAxis  tick={{ fontSize: 15, fill: "#000", fontWeight: "bold" }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="plan" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 3️⃣ hc in Plan Table (API: MouldWiseHCPlan) */}
        <div className="bg-blue-900 text-center text-white px-8 py-5 rounded-md mb-2 text-medium font-bold block w-fit">
          Table which will show the hc in Plan
        </div>
        <div
          className="bg-white shadow-md  rounded-lg mb-6"
          style={{ maxHeight: "250px", overflowY: "auto" }}
        >
          <table className="w-full border border-collapse-separate">
            <thead className="sticky top-0 z-30 bg-blue-700 text-white text-center">
              <tr>
                <th className="border p-2 ">Mould</th>
                <th className="border p-2 ">Plan Date</th>
              </tr>
            </thead>
            <tbody>
              {loadingHcPlan ? (
                <tr>
                  <td colSpan={2} className="border p-2 text-center">
                    Loading...
                  </td>
                </tr>
              ) : hcPlanError ? (
                <tr>
                  <td colSpan={2} className="border p-2 text-center text-red-600">
                    {hcPlanError}
                  </td>
                </tr>
              ) : hcPlanRows.length === 0 ? (
                <tr>
                  <td colSpan={2} className="border p-2 text-center">
                    No data available.
                  </td>
                </tr>
              ) : (
                hcPlanRows.map((row, i) => (
                  <tr key={i}>
                    <td className="border p-2 text-black text-center font-medium">{row.mould}</td>
                    <td className="border p-2 text-black text-center font-medium">{row.planDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 4️⃣ Duration Table ASC (API: MouldWiseNextHCDuedate) */}
        <div className="bg-blue-900 text-center text-white px-8 py-5 rounded-md mb-2 text-medium font-bold block w-fit">
          Table which will show the hc by Duration
        </div>
        <div
          className="bg-white shadow-md rounded-lg mb-6"
          style={{ maxHeight: "250px", overflowY: "auto" }}
        >
          <table className="w-full border">
            <thead className="w-full border border-collapse-separate bg-blue-700 text-white sticky top-0 z-20">
              <tr>
                <th className="border p-2 ">Mould</th>
                <th className="border p-2 ">Next HC Date</th>
              </tr>
            </thead>
            <tbody>
              {loadingNextHc ? (
                <tr>
                  <td colSpan={2} className="border p-2 text-center">
                    Loading...
                  </td>
                </tr>
              ) : nextHcError ? (
                <tr>
                  <td colSpan={2} className="border p-2 text-center text-red-600">
                    {nextHcError}
                  </td>
                </tr>
              ) : nextHcRows.length === 0 ? (
                <tr>
                  <td colSpan={2} className="border p-2 text-center">
                    No data available.
                  </td>
                </tr>
              ) : (
                nextHcRows
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(a.nextHCDate) - new Date(b.nextHCDate)
                  )
                  .map((row, i) => (
                    <tr key={i}>
                      <td className="border p-2 font-medium text-black text-center">{row.mould}</td>
                      <td className="border p-2 font-medium text-black text-center">{row.nextHCDate}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {/* 5️⃣ Next 6 months chart */}
        <div className="bg-blue-900 text-center text-white px-8 py-5 rounded-md mb-2 text-medium font-bold block w-fit">
          Chart for showing next 6 months how many mould will come in hc
        </div>
        <div className="bg-white shadow-md p-4 rounded-lg mb-6" style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={nextSixMonthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month"  tick={{ fontSize: 15, fill: "#000", fontWeight: "bold" }}/>
              <YAxis  tick={{ fontSize: 15, fill: "#000", fontWeight: "bold" }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 6️⃣ Shot Count ASC (API: MouldWiseNextHCDueByShot) */}
        <div className="bg-blue-900 text-center text-white px-8 py-5 rounded-md mb-2 text-medium font-bold block w-fit">
          Table which will show the hc by Shot Count
        </div>
        <div
          className="bg-white shadow-md rounded-lg mb-6"
          style={{ maxHeight: "250px", overflowY: "auto" }}
        >
          <table className="w-full border border-collapse-separate">
            <thead className="sticky top-0 z-30 bg-blue-700 text-white text-center">
              <tr>
                <th className="border p-2 ">Mould</th>
                <th className="border p-2 ">Shot Count</th>
              </tr>
            </thead>
            <tbody>
              {loadingHcShot ? (
                <tr>
                  <td colSpan={2} className="border p-2 text-center">
                    Loading...
                  </td>
                </tr>
              ) : hcShotError ? (
                <tr>
                  <td colSpan={2} className="border p-2 text-center text-red-600">
                    {hcShotError}
                  </td>
                </tr>
              ) : hcShotRows.length === 0 ? (
                <tr>
                  <td colSpan={2} className="border p-2 text-center">
                    No data available.
                  </td>
                </tr>
              ) : (
                hcShotRows
                  .slice()
                  .sort((a, b) => a.shotCount - b.shotCount)
                  .map((row, i) => (
                    <tr key={i}>
                      <td className="border p-2 font-medium text-black text-center">{row.mould}</td>
                      <td className="border p-2 font-medium text-black text-center">{row.shotCount}</td>
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

export default HCStatus;
