import React, { useState } from "react";
import DashboardLayout from "../../partials/DashboardLayout";
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
import { useNavigate } from "react-router-dom";

const HCHistory = () => {
  // -----------------------------
// ================================
// 1. MASTER DUMMY DATA (RAW DATA)
// ================================
const masterDummyData = [
  // ---------- 10-Nov-2025 (Shift Wise) ----------
  { date: "2025-11-10", shift: "A", plan: 2, actual: 1 },
  { date: "2025-11-10", shift: "B", plan: 2, actual: 2 },
  { date: "2025-11-10", shift: "C", plan: 2, actual: 1 },

  // ---------- 11–20 November (Day Wise) ----------
  { date: "2025-11-11", plan: 6, actual: 5 },
  { date: "2025-11-12", plan: 6, actual: 5 },
  { date: "2025-11-13", plan: 6, actual: 4 },
  { date: "2025-11-14", plan: 6, actual: 5 },
  { date: "2025-11-15", plan: 6, actual: 5 },
  { date: "2025-11-16", plan: 6, actual: 4 },
  { date: "2025-11-17", plan: 6, actual: 5 },
  { date: "2025-11-18", plan: 6, actual: 5 },
  { date: "2025-11-19", plan: 6, actual: 3 },
  { date: "2025-11-20", plan: 6, actual: 4 },

  // ---------- December Data (Monthly Wise) ----------
  { date: "2025-12-01", plan: 5, actual: 4 },
  { date: "2025-12-05", plan: 5, actual: 5 },
  { date: "2025-12-10", plan: 5, actual: 3 },
  { date: "2025-12-15", plan: 5, actual: 4 },
  { date: "2025-12-20", plan: 5, actual: 5 },
  { date: "2025-12-25", plan: 5, actual: 4 },

  // ---------- January (Cross Month Test) ----------
  { date: "2026-01-05", plan: 7, actual: 6 },
  { date: "2026-01-15", plan: 7, actual: 5 },
  { date: "2026-01-25", plan: 7, actual: 6 },
];
const tableDummyData = [
  {
    UID: "HC0001",
    EqID: "EQ-101",
    MouldID: "M-5001",
    MouldLife: 12000,
    MouldActualLife: 8500,
    HCWarning: 10000,
    NextHCDueDate: "2025-11-20",
    NextHCWarningDate: "2025-11-15",
    MouldLifeStatus: "Good",
    MouldHCStatus: "On Time",
    MouldStatus: "Running",
  },
  {
    UID: "HC0002",
    EqID: "EQ-102",
    MouldID: "M-5002",
    MouldLife: 15000,
    MouldActualLife: 14900,
    HCWarning: 14000,
    NextHCDueDate: "2025-11-22",
    NextHCWarningDate: "2025-11-19",
    MouldLifeStatus: "Critical",
    MouldHCStatus: "Delayed",
    MouldStatus: "Running",
  },
  {
    UID: "HC0003",
    EqID: "EQ-103",
    MouldID: "M-5003",
    MouldLife: 16000,
    MouldActualLife: 12000,
    HCWarning: 14000,
    NextHCDueDate: "2025-11-25",
    NextHCWarningDate: "2025-11-20",
    MouldLifeStatus: "Warning",
    MouldHCStatus: "On Time",
    MouldStatus: "Idle",
  },
  {
    UID: "HC0004",
    EqID: "EQ-104",
    MouldID: "M-5004",
    MouldLife: 10000,
    MouldActualLife: 9500,
    HCWarning: 9000,
    NextHCDueDate: "2025-11-30",
    NextHCWarningDate: "2025-11-28",
    MouldLifeStatus: "Critical",
    MouldHCStatus: "On Time",
    MouldStatus: "Running",
  },
  {
    UID: "HC0005",
    EqID: "EQ-105",
    MouldID: "M-5005",
    MouldLife: 18000,
    MouldActualLife: 17000,
    HCWarning: 16000,
    NextHCDueDate: "2025-12-05",
    NextHCWarningDate: "2025-12-01",
    MouldLifeStatus: "Warning",
    MouldHCStatus: "Delayed",
    MouldStatus: "Running",
  },
];
const stats = [
  { label: "Average Time of HC", value: 240 },
  { label: "Max Time of HC", value: 320 },
  { label: "Min Time of HC", value: 120 },
  { label: "Total No of HC", value: 32 },
  { label: "On Time HC", value: 52 },
  { label: "Delayed HC", value: 2 },
];

  const [rangeStart, setRangeStart] = useState("");
const [rangeEnd, setRangeEnd] = useState("");
const [chartData, setChartData] = useState([]);   // ✅ ADD THIS

  

  // -----------------------------
  // 2. FILTER ACTION
  // -----------------------------
  const applyFilter = () => {
    if (!rangeStart) return;

    let start = new Date(rangeStart);
    let end = rangeEnd ? new Date(rangeEnd) : start;

    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    // FILTER MASTER DATA FOR RANGE
    const filtered = masterDummyData.filter((item) => {
      const d = new Date(item.date);
      return d >= start && d <= end;
    });

    // -----------------------------
    // CASE 1: SHIFT WISE (1 DATE SELECTED)
    // -----------------------------
    if (!rangeEnd || rangeStart === rangeEnd) {
      const shiftWise = filtered
        .filter((d) => d.shift)
        .map((d) => ({
          date: `${d.date} (Shift ${d.shift})`,
          plan: d.plan,
          actual: d.actual,
        }));
      setChartData(shiftWise);
      return;
    }

    // -----------------------------
    // CASE 2: DAY WISE (≤ 30 days)
    // -----------------------------
    if (diffDays <= 30) {
      const dayMap = {};

      filtered.forEach((item) => {
        if (!dayMap[item.date]) dayMap[item.date] = { plan: 0, actual: 0 };
        dayMap[item.date].plan += item.plan || 0;
        dayMap[item.date].actual += item.actual || 0;
      });

      const dayWise = Object.keys(dayMap).map((date) => ({
        date,
        plan: dayMap[date].plan,
        actual: dayMap[date].actual,
      }));

      setChartData(dayWise);
      return;
    }

    // -----------------------------
    // CASE 3: MONTH WISE (> 30 days)
    // -----------------------------
    const monthMap = {};

    filtered.forEach((item) => {
      const d = new Date(item.date);
      const key = `${d.toLocaleString("default", {
        month: "short",
      })}-${d.getFullYear()}`;

      if (!monthMap[key]) monthMap[key] = { plan: 0, actual: 0 };
      monthMap[key].plan += item.plan || 0;
      monthMap[key].actual += item.actual || 0;
    });

    const monthWise = Object.keys(monthMap).map((month) => ({
      date: month,
      plan: monthMap[month].plan,
      actual: monthMap[month].actual,
    }));

    setChartData(monthWise);
  };
const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="p-6 w-full text-gray-800">

        {/* TOP SECTION */}
        <div className="flex flex-wrap items-center justify-between bg-white p-4 rounded-xl shadow mb-6">

          {/* BUTTONS */}
          <div className="flex gap-3 flex-wrap">
            <button className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow" onClick={() => navigate("/MouldMaintenanceHistory")}>
              HC
            </button>
            <button
  className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 shadow"
  onClick={() => navigate("/HCHistory")}
>
  HC
</button>
            <button className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow" onClick={() => navigate("/MouldBreakdownHistory")}>
              Breakdown
            </button>
            <button className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow" onClick={() => navigate("/SparePartHistory")}>
              Spare Part
            </button>
          </div>

          {/* DATE FILTER */}
           {/* DATE FILTER */}
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <div>
              <label className="block text-sm font-semibold">Start Date</label>
              <input
                type="date"
                className="border px-3 py-2 rounded-lg shadow-sm w-40"
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold">End Date</label>
              <input
                type="date"
                className="border px-3 py-2 rounded-lg shadow-sm w-40"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
              />
            </div>

            <button
              className="bg-gray-900 text-white px-4 mt-5 py-2 rounded-lg shadow hover:bg-gray-700"
              onClick={applyFilter}
            >
              Apply
            </button>
          </div>
        </div>

        {/* TITLE */}
        <h2 className="text-center text-3xl font-bold mb-6 text-gray-900 tracking-wide">
          Mould Health check Maintenance
        </h2>

       {/* CHART */}
               <div className="w-full h-80 bg-white rounded-xl shadow-md p-5 mb-10">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={chartData}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis dataKey="date" />
                     <YAxis />
                     <Tooltip />
                     <Legend />
                     <Bar dataKey="plan" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
                     <Bar dataKey="actual" fill="#F97316" radius={[4, 4, 0, 0]} />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
       
                       {/* STATS */}
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                 {stats.map((item, index) => (
                   <div
                     key={index}
                     className="bg-white shadow rounded-xl p-5 flex flex-col items-center justify-center"
                   >
                     <h3 className="text-lg font-semibold text-gray-700">{item.label}</h3>
                     <p className="text-3xl font-bold text-gray-900 mt-2">{item.value}</p>
                   </div>
                 ))}
               </div>
       
               {/* TABLE SECTION */}
               <div className="bg-white rounded-xl shadow p-6">
                 <h3 className="text-2xl font-bold mb-4 text-gray-900">
                   Mould HC Details
                 </h3>
       
                 <div className="overflow-x-auto">
                   <table className="w-full border-collapse">
                     <thead className="bg-gray-900 text-white">
                       <tr>
                         <th className="p-3 border">UID</th>
                         <th className="p-3 border">EqID</th>
                         <th className="p-3 border">Mould ID</th>
                         <th className="p-3 border">Mould Life</th>
                         <th className="p-3 border">Actual Life</th>
                         <th className="p-3 border">HC Warning</th>
                         <th className="p-3 border">Next HC Due</th>
                         <th className="p-3 border">Next HC Warning</th>
                         <th className="p-3 border">Life Status</th>
                         <th className="p-3 border">HC Status</th>
                         <th className="p-3 border">Mould Status</th>
                       </tr>
                     </thead>
       
                     <tbody>
                       {tableDummyData.map((row, index) => (
                         <tr key={index} className="text-center border">
                           <td className="p-3 border">{row.UID}</td>
                           <td className="p-3 border">{row.EqID}</td>
                           <td className="p-3 border">{row.MouldID}</td>
                           <td className="p-3 border">{row.MouldLife}</td>
                           <td className="p-3 border">{row.MouldActualLife}</td>
                           <td className="p-3 border">{row.HCWarning}</td>
                           <td className="p-3 border">{row.NextHCDueDate}</td>
                           <td className="p-3 border">{row.NextHCWarningDate}</td>
                           <td className="p-3 border">{row.MouldLifeStatus}</td>
                           <td className="p-3 border">{row.MouldHCStatus}</td>
                           <td className="p-3 border">{row.MouldStatus}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>
      </div>
    </DashboardLayout>
  );
}

export default HCHistory
