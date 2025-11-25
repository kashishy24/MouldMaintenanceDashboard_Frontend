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
import axios from "axios";

export default function MouldMaintenanceHistory() {
  const navigate = useNavigate();

  // stats initial state — will be replaced by APIs
  const [stats, setStats] = useState([
    { label: "Average Time of PM", value: "-" },
    { label: "Max Time of PM", value: "-" },
    { label: "Min Time of PM", value: "-" },
    { label: "Total No of PM", value: "-" },
    { label: "On Time PM", value: "-" },
    { label: "Delayed PM", value: "-" },
  ]);

  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [chartData, setChartData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [chartError, setChartError] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState(null);

  // ---- table states ----
  const [pmTableData, setPmTableData] = useState([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [tableError, setTableError] = useState(null);

  // BASE (Vite env) - fallback to your local ip (no trailing slash)
  const BASE = (import.meta.env.VITE_BACKEND_BASE_URL || "http://192.168.1.6:3004/api").replace(/\/+$/, "");
  const PM_API_ENDPOINT = `${BASE}/MouldMaintenanceHistoryPM/PmPlannedVsActualCustom`;
  const PM_TIME_ENDPOINT = `${BASE}/MouldMaintenanceHistoryPM/PmTimeDetails`;
  const PM_DELAY_ENDPOINT = `${BASE}/MouldMaintenanceHistoryPM/PmDelayOnTime`;

  // NEW: PM details table endpoint
  const PM_HISTORY_DETAIL_ENDPOINT = `${BASE}/MouldMaintenanceHistoryPM/PmHistoryDetailTable`;

  // helper: normalize date to yyyy-mm-dd
  const toISODate = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };

  const formatFriendlyDate = (isoString) => {
    if (!isoString) return "";
    try {
      const dt = new Date(isoString);
      // format e.g. 2025-11-21 05:00 (local)
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, "0");
      const d = String(dt.getDate()).padStart(2, "0");
      const hh = String(dt.getHours()).padStart(2, "0");
      const mm = String(dt.getMinutes()).padStart(2, "0");
      return `${y}-${m}-${d} ${hh}:${mm}`;
    } catch {
      return isoString;
    }
  };

  // -----------------------
  // FETCH Chart (SP: PmPlannedVsActualCustom)
  // -----------------------
  const fetchChart = async (start, end) => {
    setLoadingChart(true);
    setChartError(null);
    try {
      let url = `${PM_API_ENDPOINT}`;
      const qs = [];
      if (start) qs.push(`startDate=${encodeURIComponent(start)}`);
      if (end) qs.push(`endDate=${encodeURIComponent(end)}`);
      if (qs.length) url += `?${qs.join("&")}`;

      const res = await axios.get(url);
      const rows = res?.data?.data ?? [];
      const mapped = (rows || []).map((r) => ({
        date: r.WorkDate,
        plan: Number(r.PlannedCount ?? r.Planned ?? 0),
        actual: Number(r.ActualCount ?? r.Actual ?? 0),
      }));
      setChartData(mapped);
    } catch (err) {
      console.error("Failed to load PM Planned vs Actual:", err);
      setChartError("Failed to load chart data");
      setChartData([]);
    } finally {
      setLoadingChart(false);
    }
  };

  // -----------------------
  // FETCH Stats (PmTimeDetails)
  // -----------------------
  const fetchTimeStats = async (start, end) => {
    try {
      let url = `${PM_TIME_ENDPOINT}`;
      const qs = [];
      if (start) qs.push(`startDate=${encodeURIComponent(start)}`);
      if (end) qs.push(`endDate=${encodeURIComponent(end)}`);
      if (qs.length) url += `?${qs.join("&")}`;

      const res = await axios.get(url);
      const rows = res?.data?.data ?? [];
      const first = rows && rows.length ? rows[0] : null;

      if (first) {
        return {
          averageTime: first.AverageTimePM ?? 0,
          maxTime: first.MaxPMDuration ?? 0,
          minTime: first.MinPMDuration ?? 0,
          totalPM: first.NumberOfPM ?? 0,
        };
      }
      return { averageTime: 0, maxTime: 0, minTime: 0, totalPM: 0 };
    } catch (err) {
      console.error("Failed to load PM time details:", err);
      throw err;
    }
  };

  // -----------------------
  // FETCH Delay Stats (PmDelayOnTime)
  // -----------------------
  const fetchDelayStats = async (start, end) => {
    try {
      let url = `${PM_DELAY_ENDPOINT}`;
      const qs = [];
      if (start) qs.push(`startDate=${encodeURIComponent(start)}`);
      if (end) qs.push(`endDate=${encodeURIComponent(end)}`);
      if (qs.length) url += `?${qs.join("&")}`;

      const res = await axios.get(url);
      const rows = res?.data?.data ?? [];
      const first = rows && rows.length ? rows[0] : null;

      const onTime = first?.OnTimeCount ?? 0;
      const delayed = first?.DelayedCount ?? 0;

      return {
        onTime: Number.isFinite(Number(onTime)) ? Number(onTime) : 0,
        delayed: Number.isFinite(Number(delayed)) ? Number(delayed) : 0,
      };
    } catch (err) {
      console.error("Failed to load OnTime/Delayed stats:", err);
      return { onTime: 0, delayed: 0 };
    }
  };

  // -----------------------
  // FETCH PM DETAILS TABLE (PmHistoryDetailTable)
  // -----------------------
  const fetchPmDetails = async (start, end) => {
    setLoadingTable(true);
    setTableError(null);
    try {
      let url = `${PM_HISTORY_DETAIL_ENDPOINT}`;
      const qs = [];
      if (start) qs.push(`startDate=${encodeURIComponent(start)}`);
      if (end) qs.push(`endDate=${encodeURIComponent(end)}`);
      if (qs.length) url += `?${qs.join("&")}`;

      const res = await axios.get(url);
      const rows = res?.data?.data ?? [];

      // Map fields as required for the table
      const mapped = (rows || []).map((r, idx) => ({
        key: idx,
        checkListName: r.CheckListName ?? "",
        mouldName: r.MouldName ?? "",
        materialName: r.MaterialName ?? "",
        userId: r.UserID ?? "",
        pmStatus: r.PMStatus ?? "",
        instance: r.Instance ?? "",
        remark: r.Remark ?? "",
        startTime: r.StartTime ?? "",
        endTime: r.EndTime ?? "",
        pmDuration: r.PMDuration ?? 0,
        atMouldLife: r.AtMouldLife ?? "",
      }));

      setPmTableData(mapped);
    } catch (err) {
      console.error("Failed to load PM history detail table:", err);
      setTableError("Failed to load PM details");
      setPmTableData([]);
    } finally {
      setLoadingTable(false);
    }
  };

  // -----------------------
  // Apply button -> run all fetches in parallel and update UI (including table)
  // -----------------------
  const applyFilter = async () => {
    if (!rangeStart) {
      alert("Please select a start date.");
      return;
    }
    const start = toISODate(rangeStart);
    const end = rangeEnd ? toISODate(rangeEnd) : "";

    setLoadingStats(true);
    setStatsError(null);
    setLoadingChart(true);
    setChartError(null);

    try {
      // run chart + time stats + delay stats + pm details (table) in parallel
      const [, timeStats, delayStats] = await Promise.all([
        fetchChart(start, end),
        fetchTimeStats(start, end),
        fetchDelayStats(start, end),
        // run pm details separately because fetchChart returns void; call fetchPmDetails but don't put into array result
      ]);

      // also fetch table (not part of returned Promise results above)
      // we intentionally do it in parallel but after initiating the Promise.all above to keep code straightforward
      fetchPmDetails(start, end);

      // update stats cards (timeStats then delayStats)
      const newStats = [
        { label: "Average Time of PM", value: timeStats.averageTime ?? 0 },
        { label: "Max Time of PM", value: timeStats.maxTime ?? 0 },
        { label: "Min Time of PM", value: timeStats.minTime ?? 0 },
        { label: "Total No of PM", value: timeStats.totalPM ?? 0 },
        { label: "On Time PM", value: delayStats.onTime ?? 0 },
        { label: "Delayed PM", value: delayStats.delayed ?? 0 },
      ];
      setStats(newStats);
    } catch (err) {
      console.error("Error fetching combined data:", err);
      setStatsError("Failed to load stats");
    } finally {
      setLoadingStats(false);
      setLoadingChart(false);
      // Note: table loading state is managed by fetchPmDetails
    }
  };

  // local uploaded image path (your tooling will transform into a URL)
  const SAMPLE_IMAGE_URL = "/mnt/data/16ba7035-6471-40fc-963f-93e243f3c1ca.png";

  return (
    <DashboardLayout>
      <div className="p-6 w-full text-gray-800">
        {/* TOP FILTER + BUTTONS */}
        <div className="flex flex-wrap items-center justify-between bg-white p-4 rounded-xl shadow mb-6">
          <div className="flex gap-3 flex-wrap">
            <button className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 shadow">PM</button>

            <button className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow" onClick={() => navigate("/HCHistory")}>HC</button>

            <button className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow" onClick={() => navigate("/MouldBreakdownHistory")}>Breakdown</button>

            <button className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow" onClick={() => navigate("/SparePartHistory")}>Spare Part</button>
          </div>

          {/* DATE FILTER */}
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <div>
              <label className="block text-sm font-semibold">Start Date</label>
              <input type="date" className="border px-3 py-2 rounded-lg shadow-sm w-40" value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-semibold">End Date</label>
              <input type="date" className="border px-3 py-2 rounded-lg shadow-sm w-40" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} />
            </div>

            <button className="bg-gray-900 text-white px-4 mt-5 py-2 rounded-lg shadow hover:bg-gray-700" onClick={applyFilter}>Apply</button>
          </div>
        </div>

        {/* TITLE */}
        <h2 className="text-center text-3xl font-bold mb-6 text-gray-900 tracking-wide">Mould Preventive Maintenance</h2>

        {/* CHART */}
        <div className="w-full h-80 bg-white rounded-xl shadow-md p-5 mb-6">
          {loadingChart ? (
            <div className="flex items-center justify-center h-full">Loading chart...</div>
          ) : chartError ? (
            <div className="text-red-600">{chartError}</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="plan" fill="#1E3A8A" radius={[4, 4, 0, 0]} name="Plan" />
                <Bar dataKey="actual" fill="#F97316" radius={[4, 4, 0, 0]} name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {loadingStats ? (
            <div className="col-span-3 bg-white shadow rounded-xl p-5 flex items-center justify-center">Loading stats...</div>
          ) : statsError ? (
            <div className="col-span-3 text-red-600">{statsError}</div>
          ) : (
            stats.map((item, index) => (
              <div key={index} className="bg-white shadow rounded-xl p-5 flex flex-col items-center justify-center">
                <h3 className="text-lg font-semibold text-gray-700">{item.label}</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{item.value}</p>
              </div>
            ))
          )}
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-2xl font-bold mb-4 text-gray-900">Mould PM Details</h3>

          {loadingTable ? (
            <div className="p-6 flex items-center justify-center">Loading PM details...</div>
          ) : tableError ? (
            <div className="text-red-600 p-4">{tableError}</div>
          ) : (
            // Outer wrapper: fixed height with scroll
            <div
              className="w-full"
              style={{
                maxHeight: 420, // px - adjust to your preference
                overflow: "auto", // enables both vertical + horizontal
              }}
            >
              {/* Inner wrapper ensures table can be wider than container to show horizontal scrollbar */}
              <div style={{ minWidth: 1200 }}>
                <table className="w-full border-collapse">
                  <thead className="bg-gray-900 text-white">
                    <tr>
                      <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-900 z-10">Checklist</th>
                      <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-900 z-10">Instance</th>
                      <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-900 z-10">Mould Name</th>
                      <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-900 z-10">Material Name</th>
                      <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-900 z-10">User Name</th>
                      <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-900 z-10">PM Status</th>
                      <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-900 z-10">Duration (min)</th>
                      <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-900 z-10">At Mould Life</th>
                      <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-900 z-10">Start Time</th>
                      <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-900 z-10">Remark</th>
                    </tr>
                  </thead>

                  <tbody>
                    {pmTableData.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="p-4 text-center text-gray-600">No PM history found for selected range.</td>
                      </tr>
                    ) : (
                      pmTableData.map((row, index) => (
                        <tr key={row.key ?? index} className="text-center border">
                          <td className="p-3 border text-left whitespace-nowrap">{row.checkListName}</td>
                          <td className="p-3 border whitespace-nowrap">{row.instance}</td>
                          <td className="p-3 border whitespace-nowrap">{row.mouldName}</td>
                          <td className="p-3 border whitespace-nowrap">{row.materialName}</td>
                          <td className="p-3 border whitespace-nowrap">{row.userId}</td>
                          <td className="p-3 border whitespace-nowrap">{row.pmStatus}</td>
                          <td className="p-3 border whitespace-nowrap">{row.pmDuration}</td>
                          <td className="p-3 border whitespace-nowrap">{row.atMouldLife ?? "-"}</td>
                          <td className="p-3 border whitespace-nowrap">{formatFriendlyDate(row.startTime)}</td>
                          <td className="p-3 border text-left whitespace-nowrap">{row.remark || "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
