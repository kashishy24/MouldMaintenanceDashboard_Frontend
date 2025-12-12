// src/pages/SparePartUI.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../partials/DashboardLayout.jsx";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
import axios from "axios";

// normalize BASE (remove trailing slash)
const BASE = (import.meta.env.VITE_BACKEND_BASE_URL || "").replace(/\/+$/, "");

export default function SparePartUI() {
  const navigate = useNavigate();

  // -------------------------
  // UI state
  // -------------------------
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");

  // Category
  const [category, setCategory] = useState("");
  const [categoryList, setCategoryList] = useState([]); // from server
  const [selectedCategoryID, setSelectedCategoryID] = useState(null);

  // API-driven spare consumption (by date/month)
  const [spareConsumptionChart, setSpareConsumptionChart] = useState([]); // [{ label, value }]
  const [loadingApi, setLoadingApi] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Top 50 spare consumption from API
  const [top50Chart, setTop50Chart] = useState([]); // [{ name, value }]
  const [loadingTop50, setLoadingTop50] = useState(false);
  const [top50Error, setTop50Error] = useState(null);

  // -------------------------
  // Fetch categories from server
  // -------------------------
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(
          `${BASE}/MouldMaintenanceHistorySparePart/SparePartCategoryName`
        );
        const rows = res.data?.data ?? [];
        if (Array.isArray(rows) && rows.length) {
          setCategoryList(rows);
        } else {
          console.warn("No categories returned from server.");
        }
      } catch (err) {
        console.error("Error fetching SparePartCategoryName:", err);
      }
    };

    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------
  // helper: call SP API with CategoryID + Date range
  // DashboardSpareConsumptionByCategory
  // -------------------------
  const fetchSpareConsumption = async (startDate, endDate, sparePartCategoryID) => {
    if (!sparePartCategoryID) {
      setApiError("Please select a valid spare part category.");
      setSpareConsumptionChart([]);
      return;
    }

    const params = {
      startDate,
      endDate,
      sparePartCategoryID,
    };

    setLoadingApi(true);
    setApiError(null);
    setSpareConsumptionChart([]);

    try {
      const url = `${BASE}/MouldMaintenanceHistorySparePart/DashboardSpareConsumptionByCategory`;
      const res = await axios.get(url, { params });
      const rows = res.data?.data ?? [];

      if (!Array.isArray(rows) || rows.length === 0) {
        setSpareConsumptionChart([]);
        setApiError("No consumption data returned for selected category/date range.");
        return;
      }

      // We know the shape: { Date, TotalConsumption, SparePartCategoryName }
      const parsed = rows.map((r) => {
        const label = r.Date; // ISO string
        const value = Number(r.TotalConsumption) || 0;
        return { label, value };
      });

      // Sort by date
      parsed.sort((a, b) => new Date(a.label) - new Date(b.label));

      setSpareConsumptionChart(parsed);
    } catch (err) {
      console.error("API error DashboardSpareConsumptionByCategory:", err);
      setApiError("Failed to fetch spare consumption from server.");
    } finally {
      setLoadingApi(false);
    }
  };

  // -------------------------
  // DashboardTop50SpareConsumption
  // -------------------------
  const fetchTop50SpareConsumption = async (startDate, endDate, sparePartCategoryID) => {
    if (!sparePartCategoryID) {
      setTop50Error("Please select a valid spare part category.");
      setTop50Chart([]);
      return;
    }

    const params = {
      startDate,
      endDate,
      sparePartCategoryID,
    };

    setLoadingTop50(true);
    setTop50Error(null);
    setTop50Chart([]);

    try {
      const url = `${BASE}/MouldMaintenanceHistorySparePart/DashboardTop50SpareConsumption`;
      const res = await axios.get(url, { params });
      const rows = res.data?.data ?? [];

      if (!Array.isArray(rows) || rows.length === 0) {
        setTop50Chart([]);
        setTop50Error("No top spare consumption data for selected range.");
        return;
      }

      // Aggregate by SparePartName (sum TotalConsumption across dates)
      const agg = {};
      rows.forEach((r) => {
        const name = r.SparePartName ?? `ID-${r.SparePartID}`;
        const qty = Number(r.TotalConsumption) || 0;
        agg[name] = (agg[name] || 0) + qty;
      });

      const data = Object.keys(agg)
        .map((name) => ({ name, value: agg[name] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 50);

      setTop50Chart(data);
    } catch (err) {
      console.error("API error DashboardTop50SpareConsumption:", err);
      setTop50Error("Failed to fetch top-50 spare consumption from server.");
    } finally {
      setLoadingTop50(false);
    }
  };

  // -------------------------
  // when category changes, update ID + optionally call APIs
  // -------------------------
  const handleCategoryChange = (e) => {
    const name = e.target.value;
    setCategory(name);

    if (!name) {
      setSelectedCategoryID(null);
      setSpareConsumptionChart([]);
      setTop50Chart([]);
      setApiError(null);
      setTop50Error(null);
      return;
    }

    const found = categoryList.find(
      (c) => c.SparePartCategoryName === name
    );
    const newId = found ? Number(found.SparePartCategoryID) : null;
    setSelectedCategoryID(newId);

    // Only auto-call APIs if dates are selected as well
    if (newId && rangeStart && rangeEnd) {
      fetchSpareConsumption(rangeStart, rangeEnd, newId);
      fetchTop50SpareConsumption(rangeStart, rangeEnd, newId);
    }
  };

  // -------------------------
  // Apply filter logic (only APIs now, no dummy logic)
  // -------------------------
  const applyFilter = async () => {
    if (!rangeStart || !rangeEnd) {
      alert("Please select both Start Date and End Date");
      return;
    }

    const start = new Date(rangeStart);
    const end = new Date(rangeEnd);
    if (end < start) {
      alert("End date must be same or after start date");
      return;
    }

    if (!category) {
      alert("Please select a category");
      return;
    }

    if (!selectedCategoryID) {
      setApiError("Please select a spare part category first.");
      setSpareConsumptionChart([]);
      setTop50Chart([]);
      return;
    }

    await fetchSpareConsumption(rangeStart, rangeEnd, selectedCategoryID);
    await fetchTop50SpareConsumption(rangeStart, rangeEnd, selectedCategoryID);
  };

  // line-chart-ready data from API
  const apiLineChartData = spareConsumptionChart.map((d) => ({
    name: d.label,
    value: d.value,
  }));

  const topTitle = "Spare Part Consumption";
  const midTitle = "Top 50 Spare Parts";

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Top filter row */}
        <div className="flex flex-wrap items-center justify-between bg-white p-4 rounded-xl shadow mb-6">
          <div className="flex gap-3 flex-wrap">
            <button
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow"
              onClick={() => navigate("/MouldMaintenanceHistory")}
            >
              PM
            </button>
            <button
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow"
              onClick={() => navigate("/HCHistory")}
            >
              HC
            </button>
            <button
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow"
              onClick={() => navigate("/MouldBreakdownHistory")}
            >
              Breakdown
            </button>
            <button
              className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 shadow"
              onClick={() => navigate("/SparePartHistory")}
            >
              Spare Part
            </button>
          </div>

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

        {/* Category dropdown */}
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg backdrop-blur-md bg-white/40 border border-white/30">
            <label className="font-semibold text-gray-800 mr-2">
              Category
            </label>

            <select
              value={category || ""}
              onChange={handleCategoryChange}
              className="px-4 py-2 rounded-xl bg-white/70 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium w-60 shadow-sm"
            >
              <option value="">Select Category</option>
              {categoryList.length === 0 ? (
                <option disabled>No categories</option>
              ) : (
                categoryList.map((c) => (
                  <option key={c.SparePartCategoryID} value={c.SparePartCategoryName}>
                    {c.SparePartCategoryName}
                  </option>
                ))
              )}
            </select>

            <div className="ml-4 text-sm text-gray-600">
              {/* ID:{" "} */}
              {/* <span className="font-semibold">
                {selectedCategoryID ?? "—"}
              </span> */}
            </div>
          </div>
        </div>

        {/* Top line chart (from DashboardSpareConsumptionByCategory) */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <h3 className="text-center font-semibold text-black mb-2">
            {topTitle}
          </h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={
                  apiLineChartData.length
                    ? apiLineChartData
                    : [{ name: "No data", value: 0 }]
                }
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  interval={0} // show all ticks
                  tickFormatter={(value) => {
                    const d = new Date(value);
                    return isNaN(d.getTime())
                      ? value
                      : d.toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        });
                  }}
                  tick={{ fontSize: 12, fill: "#000000ff", fontWeight: "bold" }}
                  label={{
                    fill: "#181818ff",
                    fontSize: 12,
                    value: "Date",
                    position: "insideBottom",
                    dy: 10,
                  }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#000000ff", fontWeight: "bold" }}
                  label={{
                    fill: "#181818ff",
                    fontSize: 12,
                    value: "Consumption",
                    angle: -90,
                    dx: -12,
                  }}
                />
                <Tooltip
                  formatter={(val) => [val, "TotalConsumption"]}
                  labelFormatter={(value) => {
                    const d = new Date(value);
                    return isNaN(d.getTime())
                      ? value
                      : d.toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        });
                  }}
                />
                <Line type="monotone" dataKey="value" stroke="#1E3A8A" dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {apiError && (
            <div className="text-center text-sm text-red-600 mt-2">
              {apiError}
            </div>
          )}
        </div>

        {/* Middle: horizontal bar (Top 50 from DashboardTop50SpareConsumption) */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h4 className="text-center font-semibold text-gray-800 text-lg mb-4">
            {midTitle}
          </h4>

          {loadingTop50 ? (
            <div className="text-center py-4">
              Loading top 50 spare consumption...
            </div>
          ) : top50Error ? (
            <div className="text-center py-4 text-red-600 text-sm">
              {top50Error}
            </div>
          ) : (
            <div style={{ height: 600, overflowY: "auto", paddingRight: 10 }}>
              <ResponsiveContainer width="100%" height={1600}>
                <BarChart
                  data={
                    top50Chart.length
                      ? top50Chart
                      : [{ name: "No data", value: 0 }]
                  }
                  layout="vertical"
                  barCategoryGap={2}
                  margin={{ top: 20, right: 40, left: 80, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: "#000", fontWeight: "600" }}
                    label={{
                      value: "Total Consumption",
                      position: "insideBottom",
                      dy: 10,
                      fill: "#333",
                      fontWeight: "600",
                    }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={160}
                    tick={{ fontSize: 12, fill: "#000", fontWeight: "600" }}
                    interval={0}
                    label={{
                      value: "Spare Part",
                      angle: -90,
                      dx: -60,
                      fill: "#333",
                      fontWeight: "600",
                    }}
                  />
                  <Tooltip
                    wrapperStyle={{ fontSize: 14, borderRadius: 8 }}
                    contentStyle={{ borderRadius: 8 }}
                  />
                  <Bar
                    dataKey="value"
                    name="TotalConsumption"
                    fill="#1E3A8A"
                    barSize={12}
                    radius={[6, 6, 6, 6]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
