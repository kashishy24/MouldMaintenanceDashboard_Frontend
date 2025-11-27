import React, { useState, useEffect } from "react";
import DashboardLayout from "../partials/DashboardLayout";
import axios from "axios";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";

const BASE = import.meta.env.VITE_BACKEND_BASE_URL

const MouldSummary = () => {
  // ---------------- DROPDOWN + API STATE ----------------
  const [mouldList, setMouldList] = useState([]);
  const [selectedMould, setSelectedMould] = useState(""); // will store MouldName from dropdown
  const [mouldInfo, setMouldInfo] = useState({
    MouldID: "",
    MouldDesc: "",
  });

  // ---------------- FETCH MOULD LIST ON LOAD ----------------
  useEffect(() => {
    const fetchMouldNames = async () => {
      try {
        const res = await axios.get(`${BASE}/MouldSummary/MouldName`);
        if (res.data?.success && Array.isArray(res.data.data)) {
          // API: {success:true, data:[{MouldID, MouldName}, ...]}
          setMouldList(res.data.data);
        } else {
          console.error("Invalid MouldName API response", res.data);
        }
      } catch (err) {
        console.error("Error fetching MouldName list:", err);
      }
    };

    fetchMouldNames();
  }, []);

  // ---------------- HANDLE MOULD CHANGE ----------------
  const handleMouldChange = async (e) => {
    const mouldName = e.target.value;
    setSelectedMould(mouldName);
    setMouldInfo({ MouldID: "", MouldDesc: "" });

    if (!mouldName) return;

    try {
        const res = await axios.get(
        `${BASE}/MouldSummary/MouldIDDesc?mouldName=${encodeURIComponent(
          mouldName
        )}`
      );
      // API: {success:true, data:[{MouldID, MouldName, MouldDesc}]}
      if (res.data?.success && Array.isArray(res.data.data)) {
        const info = res.data.data[0] || {};
        setMouldInfo({
          MouldID: info.MouldID || "",
          MouldDesc: info.MouldDesc || "",
        });
      } else {
        console.error("Invalid MouldIDDesc API response", res.data);
      }
    } catch (err) {
      console.error("Error fetching MouldIDDesc:", err);
    }
  };

  // ---------------- DUMMY CHART DATA (UNCHANGED) ----------------
  const pmDuration = [
    { date: "10-Oct", duration: 2, status: "OnTime" },
    { date: "22-Oct", duration: 10, status: "Delayed" },
    { date: "11-Nov", duration: 12, status: "OnTime" },
    { date: "21-Jan", duration: 13, status: "Delayed" },
    { date: "10-Feb", duration: 3, status: "OnTime" },
    { date: "24-Jun", duration: 8, status: "Delayed" },
  ];

  const hcDuration = [
    { date: "10-Oct", duration: 2, status: "OnTime" },
    { date: "22-Oct", duration: 10, status: "Delayed" },
    { date: "11-Nov", duration: 12, status: "OnTime" },
    { date: "21-Jan", duration: 13, status: "Delayed" },
    { date: "10-Feb", duration: 3, status: "OnTime" },
    { date: "24-Jun", duration: 8, status: "Delayed" },
  ];

  const topBreakdownDuration = [
    { reason: "Material Shortage", duration: 12 },
    { reason: "PLC Error", duration: 4 },
    { reason: "Hydraulic Issue", duration: 3 },
    { reason: "Machine Fault", duration: 2 },
    { reason: "Oil Leakage", duration: 1 },
  ];

  const topBreakdownCount = [
    { reason: "Material Shortage", count: 4 },
    { reason: "Electrical Issue", count: 3 },
    { reason: "Machine Fault", count: 2 },
    { reason: "PLC Error", count: 1 },
    { reason: "Cooling Issue", count: 1 },
  ];

  const topSpareParts = [
    { name: "Heater Coil", qty: 8 },
    { name: "Nozzle Ring", qty: 4 },
    { name: "Thermocouple", qty: 3 },
    { name: "Hydraulic Seal", qty: 2 },
    { name: "O-Ring", qty: 1 },
    { name: "Heater Coil", qty: 8 },
    { name: "Nozzle Ring", qty: 4 },
    { name: "Thermocouple", qty: 3 },
    { name: "Hydraulic Seal", qty: 2 },
    { name: "O-Ring", qty: 1 },
  ];

  // ---------------- UI START ----------------
  return (
    <DashboardLayout>
      <div className="w-full p-4">
        {/* ---------------- MOULD INFO ROW ---------------- */}
        <div className="mb-8 bg-white p-5 rounded-2xl shadow-lg border border-gray-200 w-full">
          <div className="grid grid-cols-3 gap-6">
            {/* --- Mould Name Dropdown --- */}
            <div>
              <label className="font-semibold text-gray-700 mb-1 block">
                Select Mould
              </label>

              <select
                className="w-full border border-gray-300 px-4 py-3 rounded-lg shadow-sm 
                   focus:ring-2 focus:ring-blue-400 focus:outline-none bg-gray-50 text-black"
                value={selectedMould}
                onChange={handleMouldChange}
              >
                <option value="">-- Select Mould --</option>
                {mouldList.map((m, i) => (
                  <option key={i} value={m.MouldName}>
                    {m.MouldName} ({m.MouldID})
                  </option>
                ))}
              </select>
            </div>

            {/* --- Mould ID --- */}
            <div>
              <label className="font-semibold text-gray-700 mb-1 block">
                Mould ID
              </label>
              <div className="bg-gray-100 px-4 py-3 rounded-lg shadow-sm font-semibold text-gray-800">
                {mouldInfo.MouldID || "--"}
              </div>
            </div>

            {/* --- Mould Description --- */}
            <div>
              <label className="font-semibold text-gray-700 mb-1 block">
                Mould Description
              </label>
              <div className="bg-gray-100 px-4 py-3 rounded-lg shadow-sm font-semibold text-gray-800">
                {mouldInfo.MouldDesc || "--"}
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- KPI BLUE CARDS ---------------- */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {[
            { title: "Mould Start Date", value: "15 October 2024" },
            { title: "Mould Current Life", value: "905K" },
            { title: "Mould Current Life in Days", value: "5146" },
            { title: "Number of PM Done", value: "5" },
            { title: "PM Shot Count", value: "145K" },
            { title: "Last PM Date", value: "11 Sept 2025" },
            { title: "Next PM By Date", value: "01 Nov 2025" },
            { title: "Next PM By Shot Count", value: "25000" },
            { title: "HC Start Date", value: "01 Sept 2025" },
            { title: "HC Start Count", value: "10M" },
            { title: "Number HC Done", value: "11" },
            { title: "Last HC Shot Count", value: "955K" },
            { title: "Last HC Date", value: "11 Sept 2025" },
            { title: "Next HC By Date", value: "10 Oct 2025" },
            { title: "Next HC By Shot Count", value: "35000" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-blue-100 border border-blue-500 p-3 rounded-xl shadow text-center"
            >
              <p className="text-xs text-black font-semibold">{item.title}</p>
              <p className="text-lg font-bold text-black">{item.value}</p>
            </div>
          ))}
        </div>

        {/* ---------------- PM & HC Duration Charts ---------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          {/* PM Duration Card */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-black text-center">
              PM Duration
            </h2>

            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pmDuration} margin={{ bottom: 20 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tick={{
                      fill: "#181818ff",
                      fontSize: 12,
                      fontWeight: "bold",
                    }}
                    label={{
                      fill: "#181818ff",
                      fontSize: 12,
                      value: "Date of PM",
                      position: "insideBottom",
                      dy: 12,
                    }}
                  />
                  <YAxis
                    tick={{
                      fill: "#050505ff",
                      fontSize: 12,
                      fontWeight: "bold",
                    }}
                    label={{
                      fill: "#181818ff",
                      fontSize: 12,
                      value: "Duration",
                      angle: -90,
                      dx: -12,
                    }}
                  />
                  <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />

                  <Bar dataKey="duration" radius={[4, 4, 0, 0]}>
                    {pmDuration.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={
                          entry.status === "OnTime" ? "#16a34a" : "#dc2626"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* HC Duration Card */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-black text-center">
              HC Duration
            </h2>

            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hcDuration} margin={{ bottom: 20 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tick={{
                      fill: "#181818ff",
                      fontSize: 12,
                      fontWeight: "bold",
                    }}
                    label={{
                      fill: "#181818ff",
                      fontSize: 12,
                      value: "Date of HC",
                      position: "insideBottom",
                      dy: 12,
                    }}
                  />
                  <YAxis
                    tick={{
                      fill: "#181818ff",
                      fontSize: 12,
                      fontWeight: "bold",
                    }}
                    label={{
                      fill: "#181818ff",
                      fontSize: 12,
                      value: "Duration",
                      angle: -90,
                      dx: -12,
                    }}
                  />
                  <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />

                  <Bar dataKey="duration" radius={[4, 4, 0, 0]}>
                    {hcDuration.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={
                          entry.status === "OnTime" ? "#16a34a" : "#dc2626"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ---------------- Breakdown & Spare Part Charts ---------------- */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {/* Breakdown by Duration */}
          <div className="bg-white shadow-lg rounded-xl p-4">
            <h2 className="font-semibold mb-2 text-lg text-black text-center">
              Top 5 Breakdown by Duration
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topBreakdownDuration} margin={{ bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="reason"
                  angle={-40}
                  textAnchor="end"
                  interval={0}
                  height={60}
                  tick={{
                    fontSize: 12,
                    fill: "#181818ff",
                    fontWeight: "bold",
                  }}
                />
                <YAxis
                  tick={{
                    fontSize: 12,
                    fill: "#181818ff",
                    fontWeight: "bold",
                  }}
                />
                <Tooltip />
                <Bar dataKey="duration" fill="#5885E0" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Breakdown by Count */}
          <div className="bg-white shadow-lg rounded-xl p-4">
            <h2 className="font-semibold mb-2 text-lg text-black text-center">
              Top 5 Breakdown by Occurrence
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topBreakdownCount} margin={{ bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="reason"
                  angle={-40}
                  textAnchor="end"
                  interval={0}
                  height={60}
                  tick={{
                    fontSize: 12,
                    fill: "#181818ff",
                    fontWeight: "bold",
                  }}
                />
                <YAxis
                  tick={{
                    fontSize: 12,
                    fill: "#181818ff",
                    fontWeight: "bold",
                  }}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#FF8C42" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spare Part Consumption */}
        <div className="bg-white rounded-2xl p-5 mt-10 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-black text-center">
            Top 10 Spare Part Consumption
          </h2>

          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSpareParts}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />

                <XAxis
                  dataKey="name"
                  tick={{
                    fill: "#181818ff",
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                  angle={-8}
                  textAnchor="end"
                  interval={0}
                />

                <YAxis
                  tick={{
                    fill: "#181818ff",
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                />

                <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />

                <Bar dataKey="qty" fill="#22A699" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MouldSummary;
