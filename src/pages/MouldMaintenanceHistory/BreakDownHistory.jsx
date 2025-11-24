import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../partials/DashboardLayout";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// ---------------- TOP 10 BAR DATA ----------------
const top10Reasons = [
  { reason: "Thermo couple", Duration: 76 },
  { reason: "Heater", Duration: 54 },
  { reason: "Ejector Pin", Duration: 34 },
];

// ---------------- MAIN COMPONENT ----------------
const BreakDownHistory = () => {
  const navigate = useNavigate();

  // ---------------- STATE ----------------
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");

  const [chartData, setChartData] = useState([
    { date: "2024-01-01", Duration: 40, Occurence: 5 },
    { date: "2024-01-02", Duration: 75, Occurence: 10 },
    { date: "2024-01-03", Duration: 55, Occurence: 7 },
  ]);

  const [tableData] = useState([
    {
      BreakDownID: 1,
      Reason: "Lifter Broken",
      Remark: "Gear issue",
      MouldName: "Mould-12",
      StartTime: "2024-01-01 08:00",
      EndTime: "2024-01-01 10:00",
      Duration: "120 min",
    },
    {
      BreakDownID: 2,
      Reason: "Heater Fault",
      Remark: "Low temp",
      MouldName: "Mould-45",
      StartTime: "2024-01-03 09:00",
      EndTime: "2024-01-03 11:20",
      Duration: "140 min",
    },
  ]);

  // ---------------- GROUPING LOGIC ----------------
  const getGroupingMode = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);

    if (s.toDateString() === e.toDateString()) return "shift";

    const diffDays = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    if (diffDays <= 30) return "day";
    return "month";
  };

  const applyFilter = () => {
    if (!rangeStart || !rangeEnd) {
      alert("Please select both start & end date.");
      return;
    }

    const mode = getGroupingMode(rangeStart, rangeEnd);

    if (mode === "shift") loadShiftData(rangeStart);
    else if (mode === "day") loadDayWiseData(rangeStart, rangeEnd);
    else loadMonthWiseData(rangeStart, rangeEnd);
  };

  // ---------------- LOADERS ----------------
  const loadShiftData = () => {
    setChartData([
      { shift: "Shift A", Duration: 50, Occurence: 5 },
      { shift: "Shift B", Duration: 80, Occurence: 8 },
      { shift: "Shift C", Duration: 30, Occurence: 3 },
    ]);
  };

  const loadDayWiseData = () => {
    setChartData([
      { date: "2024-01-01", Duration: 60, Occurence: 7 },
      { date: "2024-01-02", Duration: 40, Occurence: 3 },
      { date: "2024-01-03", Duration: 90, Occurence: 9 },
    ]);
  };

  const loadMonthWiseData = () => {
    setChartData([
      { month: "Jan", Duration: 200, Occurence: 15 },
      { month: "Feb", Duration: 150, Occurence: 9 },
      { month: "Mar", Duration: 300, Occurence: 22 },
    ]);
  };

  // Dynamic X Axis Key
  const grouping = getGroupingMode(rangeStart, rangeEnd);

  const stats = [
    { label: "Total Breakdown Count", value: 240 },
    { label: "Longest Duration", value: 320 },
    { label: "Mould Max BreakDown", mould: "ABC", duration: 150 },
    { label: "Mould Min BreakDown", mould: "BDE", duration: 20 },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 w-full">

        {/* ---------------------- FILTER BAR ---------------------- */}
        <div className="flex flex-wrap items-center justify-between bg-white p-4 rounded-xl shadow mb-6">

          <div className="flex gap-3 flex-wrap">
            <button className="px-6 py-2 rounded-lg bg-blue-600 text-white" onClick={() => navigate("/MouldMaintenanceHistory")}>PM</button>
            <button className="px-6 py-2 rounded-lg bg-blue-600 text-white" onClick={() => navigate("/HCHistory")}>HC</button>
            <button className="px-6 py-2 rounded-lg bg-red-600 text-white" onClick={() => navigate("/MouldBreakdownHistory")}>Breakdown</button>
            <button className="px-6 py-2 rounded-lg bg-blue-600 text-white" onClick={() => navigate("/SparePartHistory")}>Spare Part</button>
          </div>

          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <div>
              <label className="block text-sm font-semibold">Start Date</label>
              <input type="date" className="border px-3 py-2 rounded-lg w-40"
                value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-semibold">End Date</label>
              <input type="date" className="border px-3 py-2 rounded-lg w-40"
                value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} />
            </div>

            <button className="bg-gray-900 text-white px-4 mt-5 py-2 rounded-lg"
              onClick={applyFilter}>
              Apply
            </button>
          </div>
        </div>


        {/* ---------------------- CHART ---------------------- */}
        <div className="w-full h-80 bg-white rounded-xl shadow-md p-5 mb-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey={
                  grouping === "shift"
                    ? "shift"
                    : grouping === "day"
                    ? "date"
                    : "month"
                }
              />

              <YAxis />
              <Tooltip />
              <Legend />

              <Bar dataKey="Duration" fill="#1E3A8A" />
              <Bar dataKey="Occurence" fill="#F97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>


        {/* ---------------------- SUMMARY CARDS ---------------------- */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {stats.map((item, index) => (
            <div key={index} className="bg-white shadow rounded-xl p-3 text-center">
              <h3 className="text-lg font-semibold text-gray-700">{item.label}</h3>

              {item.mould ? (
                <div className="mt-2">
                  <p className="text-2xl font-bold">{item.mould}</p>
                  <p className="text-xl font-semibold text-blue-700">{item.duration}</p>
                </div>
              ) : (
                <p className="text-3xl font-bold mt-2">{item.value}</p>
              )}
            </div>
          ))}
        </div>


        {/* ---------------------- TOP 10 BAR ---------------------- */}
        <div className="bg-white shadow-md rounded-md p-2 mb-4">
          <h3 className="font-semibold mb-2 text-center">Top 10 Breakdown By Reason</h3>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={top10Reasons}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="reason" type="category" />
              <Tooltip />
              <Legend />
              <Bar dataKey="Duration" fill="#2f72bd" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>


        {/* ---------------------- TABLE ---------------------- */}
        <div className="bg-white p-4 rounded-xl shadow-md mb-10">
          <h3 className="font-semibold text-lg mb-3">Breakdown Details Table</h3>

          <table className="w-full border-collapse text-sm">
            <thead className="bg-blue-900 text-white text-xs">
              <tr>
                <th className="p-2 border">BreakDownID</th>
                <th className="p-2 border">BreakDown Reason</th>
                <th className="p-2 border">BreakDown Remark</th>
                <th className="p-2 border">Mould Name</th>
                <th className="p-2 border">Start Time</th>
                <th className="p-2 border">End Time</th>
                <th className="p-2 border">Duration</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((r, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="p-2 border">{r.BreakDownID}</td>
                  <td className="p-2 border">{r.Reason}</td>
                  <td className="p-2 border">{r.Remark}</td>
                  <td className="p-2 border">{r.MouldName}</td>
                  <td className="p-2 border">{r.StartTime}</td>
                  <td className="p-2 border">{r.EndTime}</td>
                  <td className="p-2 border">{r.Duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default BreakDownHistory;
