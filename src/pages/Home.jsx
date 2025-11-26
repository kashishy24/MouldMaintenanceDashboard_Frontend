import React, { useState, useMemo, useEffect } from "react";
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
import DashboardLayout from "../partials/DashboardLayout";

export default function Home() {
  // ----- kept placeholders -----
  const hcPlanActual = [];

  // ----- helpers -----
  function getCurrentShift() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 14) return "A";
    if (hour >= 14 && hour < 22) return "B";
    return "C";
  }

  function formatDate(d) {
    if (!d) return "";
    const date = new Date(d);
    return date.toISOString().split("T")[0];
  }

  function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(formatDate(d));
    }
    return days;
  }

  function getMonthDays() {
    const result = [];
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const total = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= total; i++) {
      const d = new Date(year, month, i);
      result.push(formatDate(d));
    }
    return result;
  }

  // ----- UI States -----
  const [filter, setFilter] = useState("week"); // "shift","day","week","month","range"
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");

  // ----- PM Chart data state (from API) -----
  const [pmChartData, setPmChartData] = useState([]);
  const [pmLoading, setPmLoading] = useState(false);
  const [pmError, setPmError] = useState(null);
  // PM Table
  const [pmTableApi, setPmTableApi] = useState([]);
  // HC Table
  const [hcTableApi, setHcTableApi] = useState([]);
  // breakdown
  const [breakdownApiData, setBreakdownApiData] = useState([]);
  // spare parts (NEW)
  const [spareParts, setSpareParts] = useState([]);
  const [spareLoading, setSpareLoading] = useState(false);
  const [spareError, setSpareError] = useState(null);

  // ----- BASE & endpoints (from Vite env) -----
  const BASE = (import.meta.env.VITE_BACKEND_BASE_URL || "").replace(/\/+$/, "");
  // PM / HC / breakdown endpoints you've been using
  const API_BASE = `${BASE}/Home/mouldPMPlannedVsActual`;
  const PM_API = `${BASE}/Home/mouldPMStatus`;
  const HC_API = `${BASE}/Home/mouldHCStatus`; // fixed typo
  const BREAKDOWN_API = `${BASE}/Home/Top5BreakdownByDuration`;
  const BREAKDOWN_API_OCC = `${BASE}/Home/Top5BreakdownByOccurrences`;
  // SparePartMonitoring endpoint (your example used /home/SparePartMonitoring)
  const SPARE_API = `${BASE}/home/SparePartMonitoring`;

  // ----- filter mapping -----
  const filterTypeNumber = (f) => {
    switch (f) {
      case "shift": return 1;
      case "day": return 2;
      case "week": return 3;
      case "month": return 4;
      case "range": return 5;
      default: return 3;
    }
  };

  // ---------------- FETCH PM CHART --------------------
  useEffect(() => {
    const fetchPmChart = async () => {
      const typeNum = filterTypeNumber(filter);
      if (typeNum === 5 && (!rangeStart || !rangeEnd)) return;

      setPmLoading(true);
      setPmError(null);

      try {
        let url = `${API_BASE}?filterType=${typeNum}`;
        if (typeNum === 5) url += `&startDate=${rangeStart}&endDate=${rangeEnd}`;
        const res = await axios.get(url);
        const rows = res?.data?.data ?? res?.data ?? [];
        const formatted = (Array.isArray(rows) ? rows : []).map((r) => {
          const shift = r.OutputLabel ?? r.ShiftName ?? "";
          const workDate = r.WorkDateOutput ?? r.PlanDate ?? r.WorkDate ?? "";
          const planned = r.PlannedCount ?? r.Planned ?? 0;
          const actual = r.ActualCount ?? r.Actual ?? 0;
          let label = workDate;
          if (filter === "shift" || filter === "day" || filter === "week") {
            label = `${shift} (${workDate})`;
          }
          return { date: label, plan: Number(planned), actual: Number(actual) };
        });
        setPmChartData(formatted);
      } catch (err) {
        console.error("PM Chart API Error:", err);
        setPmError("Failed to load PM chart data");
        setPmChartData([]);
      } finally {
        setPmLoading(false);
      }
    };
    fetchPmChart();
  }, [filter, rangeStart, rangeEnd, API_BASE]);

  // ---------------- FETCH PM TABLE --------------------
  useEffect(() => {
    const fetchPMData = async () => {
      const type = filterTypeNumber(filter);
      if (type === 5 && (!rangeStart || !rangeEnd)) return;
      let url = `${PM_API}?caseType=${type}`;
      if (type === 5) url += `&startDate=${rangeStart}&endDate=${rangeEnd}`;
      try {
        const res = await axios.get(url);
        const rows = res.data?.data ?? [];
        const formatted = rows.map((r) => ({
          mouldName: r.MouldName,
          equipment: r.EquipmentName,
          nextPmDue: formatDate(r.NextPMDueDate),
          nextPmWarning: formatDate(r.NextPMWarningDate),
          pmStatus: r.MouldPMStatus === 3 ? "Alarm" : r.MouldPMStatus === 2 ? "Warning" : r.MouldPMStatus === 8 ? "Alert" : "Critical",
          productionDate: formatDate(r.PlanDate),
          shift: r.ShiftName?.trim() || "-",
          statusColor: r.MouldPMStatus === 1 ? "green" : r.MouldPMStatus === 2 ? "yellow" : r.MouldPMStatus === 3 ? "red" : "gray",
        }));
        setPmTableApi(formatted);
      } catch (err) {
        console.log("PM Table Error:", err);
        setPmTableApi([]);
      }
    };
    fetchPMData();
  }, [filter, rangeStart, rangeEnd, PM_API]);

  // ---------------- FETCH HC TABLE --------------------
  useEffect(() => {
    const fetchHCData = async () => {
      const type = filterTypeNumber(filter);
      if (type === 5 && (!rangeStart || !rangeEnd)) return;
      let url = `${HC_API}?caseType=${type}`;
      if (type === 5) url += `&startDate=${rangeStart}&endDate=${rangeEnd}`;
      try {
        const res = await axios.get(url);
        const rows = res.data?.data ?? [];
        const formatted = rows.map((r) => ({
          mouldName: r.MouldName,
          equipment: r.EquipmentName,
          nextDue: formatDate(r.NextHCDueDate),
          warning: formatDate(r.NextHCWarningDate),
          status: r.MouldHealthStatus === 3 ? "Alarm" : r.MouldHealthStatus === 2 ? "Warning" : r.MouldHealthStatus === 7 ? "Alert" : "Critical",
          productionDate: formatDate(r.PlanDate),
          shift: r.ShiftName?.trim() || "-",
          healthColor: r.MouldHealthStatus === 1 ? "#86efac" : r.MouldHealthStatus === 2 ? "#facc15" : "#ef4444",
        }));
        setHcTableApi(formatted);
      } catch (err) {
        console.log("HC Table Error:", err);
        setHcTableApi([]);
      }
    };
    fetchHCData();
  }, [filter, rangeStart, rangeEnd, HC_API]);

  // ---------------- FETCH BREAKDOWN (duration & occurrences) --------------------
  useEffect(() => {
    const fetchBreakdownData = async () => {
      const typeNum = filterTypeNumber(filter);
      if (typeNum === 5 && (!rangeStart || !rangeEnd)) return;
      let urlD = `${BREAKDOWN_API}?filterType=${typeNum}`;
      let urlO = `${BREAKDOWN_API_OCC}?filterType=${typeNum}`;
      if (typeNum === 5) {
        urlD += `&startDate=${rangeStart}&endDate=${rangeEnd}`;
        urlO += `&startDate=${rangeStart}&endDate=${rangeEnd}`;
      }
      try {
        const [resD, resO] = await Promise.all([axios.get(urlD), axios.get(urlO)]);
        const dataDuration = resD?.data?.data ?? [];
        const dataOccurrence = resO?.data?.data ?? [];
        const merged = (dataDuration || []).map((durationRow) => {
          const matchOcc = (dataOccurrence || []).find((o) => o.MouldName === durationRow.MouldName);
          return {
            cause: durationRow.MouldName || durationRow.Cause || durationRow.Label,
            duration: Number(durationRow.TotalDuration) || 0,
            occurrence: Number(matchOcc?.TotalOccurrences) || 0
          };
        });
        setBreakdownApiData(merged);
      } catch (error) {
        console.log("Breakdown API error:", error);
        console.log("Breakdown API occurence :", dataOccurrence);
        setBreakdownApiData([]);
      }
    };
    fetchBreakdownData();
  }, [filter, rangeStart, rangeEnd, BREAKDOWN_API, BREAKDOWN_API_OCC]);

  // ---------------- FETCH SPARE PARTS (NEW) --------------------
  useEffect(() => {
    const fetchSpareParts = async () => {
      const type = filterTypeNumber(filter);
      if (type === 5 && (!rangeStart || !rangeEnd)) return;
      setSpareLoading(true);
      setSpareError(null);

      try {
        // example: /home/SparePartMonitoring?caseType=1  or caseType=5&startDate=2025-11-11&endDate=2025-11-24
        let url = `${SPARE_API}?caseType=${type}`;
        if (type === 5) url += `&startDate=${rangeStart}&endDate=${rangeEnd}`;

        const res = await axios.get(url);
        // your API sample: {"success":true,"data":[{...}]}
        const rows = res?.data?.data ?? res?.data ?? [];
        // normalize for the Spare Part Consumption table
        const formatted = (Array.isArray(rows) ? rows : []).map((r) => ({
          mouldname: r.MouldName ?? "-",           // best-effort mapping
          category: r.SparePartCategoryName ?? r.Category ?? "-",
          partName: r.SparePartName ?? r.PartName ?? "-",
          availableQty: Number.isFinite(Number(r.CurrentQuantity)) ? Number(r.CurrentQuantity) : (r.AvailableQty ?? "-"),
          usedQty: r.UsedQty ?? r.UsedQuantity ?? "-", // if backend provides used qty use it, otherwise leave '-'
          location: r.SparePartLoc ?? r.Location ?? "-",
          lastUpdated: r.LastUpdatedTime ?? r.LastUpdatedDate ?? null,

          status:
            r.SparePartStatus === 1
              ? "Normal"
              : r.SparePartStatus === 2
                ? "Warning"
                : r.SparePartStatus === 3
                  ? "Alarm"
                  : "Unknown",

        }));
        setSpareParts(formatted);
      } catch (err) {
        console.error("SparePart API Error:", err);
        setSpareError("Failed to load spare part data");
        setSpareParts([]);
      } finally {
        setSpareLoading(false);
      }
    };

    fetchSpareParts();
  }, [filter, rangeStart, rangeEnd, SPARE_API]);

  // ----- displayed arrays for other sections (unchanged) -----
  const displayedPm = useMemo(() => [], []);
  const displayedHc = useMemo(() => displayedPm, [displayedPm]);

  // ----- Components used in JSX -----
  const PillButton = ({ children, active, onClick }) => (
    <button onClick={onClick} className={`px-4 py-2 rounded-md font-medium mr-2 text-white ${active ? "bg-red-600" : "bg-blue-600"}`}>
      {children}
    </button>
  );

  const StatusPill = ({ color }) => (
    <div className="w-8 h-8 rounded-sm" style={{ backgroundColor: color, border: "1px solid #333" }} />
  );

  // ----- Render -----
  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-9xl mx-auto">
          {/* ---- FILTERS ---- */}
          <div className="flex flex-wrap items-center justify-between bg-white p-4 rounded-xl shadow mb-6">
              <div className="flex gap-3 flex-wrap">
                <PillButton  active={filter === "shift"} onClick={() => { setFilter("shift"); setRangeStart(""); setRangeEnd(""); }}>Shift</PillButton>
            <PillButton active={filter === "day"} onClick={() => { setFilter("day"); setRangeStart(""); setRangeEnd(""); }}>Day</PillButton>
            <PillButton active={filter === "week"} onClick={() => { setFilter("week"); setRangeStart(""); setRangeEnd(""); }}>Week</PillButton>
            <PillButton active={filter === "month"} onClick={() => { setFilter("month"); setRangeStart(""); setRangeEnd(""); }}>Month</PillButton>
              </div>
            

            <div className="ml-6 flex items-center">
              <span className="mr-2">Start Date</span>
              <input type="date" className="border p-1 rounded mr-4" value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} />
              <span className="mr-2">End Date</span>
              <input type="date" className="border p-1 rounded mr-4" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} />
              <button className="bg-gray-800 text-white px-3 py-1 rounded" onClick={() => { if (!rangeStart || !rangeEnd) { alert("Please select both start and end date."); return; } setFilter("range"); }}>
                Apply
              </button>
            </div>
          </div>

          {/* ---------------- PM + HC + BREAKDOWN + SPARE PARTS ---------------- */}
          <div className="grid grid-cols-12 gap-6">
            {/* PM Chart */}
            <div className="col-span-12 bg-white shadow rounded-xl p-2 h-100">
              <h3 className="font-bold text-center mb-2  text-black">Plant PM Plan And Actual</h3>
              <div className="h-90">
                {pmLoading ? <div className="flex items-center justify-center h-full">Loading...</div> : pmError ? <div className="flex items-center justify-center h-full text-red-600">{pmError}</div> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pmChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" textAnchor="end"   interval={0}                 
  height={60}   tick={{ fontSize: 15 ,fill: "#000000ff",fontWeight: "bold"}}/>
                      <YAxis  height={60}   tick={{ fontSize: 15 ,fill: "#000000ff",fontWeight: "bold"}}/>
                      <Tooltip />
                   
                      <Bar dataKey="plan" fill="#2b6cb0"/>
                      <Bar dataKey="actual" fill="#dd6b20" />
                         <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* PM TABLE */}
  <div className="col-span-12 bg-white shadow rounded-xl p-0 h-100 flex flex-col">

  {/* Sticky Title */}
  <h3 className="font-bold text-center py-3 text-black 
                 sticky top-0 z-20 bg-white shadow-sm">
    Plant PM Status
  </h3>

  {/* Scrollable Table */}
  <div className="overflow-auto flex-1">
    <table className="w-full text-sm table-fixed">
      <thead>
        <tr className="bg-blue-700 text-white sticky top-0 z-10">
          <th className="p-2">Mould Name</th>
          <th className="p-2">Machine Name</th>
          <th className="p-2">Next PM</th>
          <th className="p-2">Warning</th>
          <th className="p-2">Mould PM Status</th>
          <th className="p-2">Prod Date</th>
          <th className="p-2">Shift</th>
        </tr>
      </thead>

      <tbody>
        {pmTableApi.map((r, i) => {
          
          // -----------------------------
          // Row Color Logic
          // -----------------------------
          let rowColor = "black";
          // if (r.pmStatus?.toLowerCase() === "warning") rowColor = "bg-yellow-500";
          // else if (r.pmStatus?.toLowerCase() === "alarm") rowColor = "bg-red-500";
          // else if (r.pmStatus?.toLowerCase() === "alert") rowColor = "bg-orange-300";

          return (
            <tr 
              key={i} 
              className={`border-b h-12 text-center font-bold text-black ${rowColor}`}
            >
              <td className="p-2">{r.mouldName}</td>
              <td className="p-2">{r.equipment}</td>
              <td className="p-2">{r.nextPmDue}</td>
              <td className="p-2">{r.nextPmWarning}</td>
               {/* --- PM STATUS COLOR CODE --- */}
      <td
        className={`p-2 font-bold text-black rounded 
          ${
            r.pmStatus?.toLowerCase() === "warning"
              ? "bg-yellow-500 text-black"
              : r.pmStatus?.toLowerCase() === "alarm"
              ? "bg-red-800 text-black"
              : r.pmStatus?.toLowerCase() === "alert"
              ? "bg-orange-500 text-black"
              : "bg-gray-200 text-black"
          }
        `}
      >
        {r.pmStatus}
      </td>
              <td className="p-2">{r.productionDate}</td>
              <td className="p-2">{r.shift}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>

</div>



            {/* HC Chart */}
            <div className="col-span-12 bg-white shadow rounded-xl p-2 h-100">
              <h3 className="font-semibold text-center mb-2 text-black">Plant Health Check</h3>
              <div className="h-90">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hcPlanActual}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 15 ,fill: "#000000ff",fontWeight: "bold"}} />
                    <YAxis tick={{ fontSize: 15 ,fill: "#000000ff",fontWeight: "bold"}} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="plan" fill="#2b6cb0" />
                    <Bar dataKey="actual" fill="#dd6b20" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* HC TABLE */}
<div className="col-span-12 bg-white shadow rounded-xl p-0 h-100 flex flex-col">

  {/* Sticky Title */}
  <h3 className="font-bold text-center py-3 text-black 
                 sticky top-0 z-20 bg-white shadow-sm">
    HC Table
  </h3>

  {/* Scrollable Table */}
  <div className="overflow-auto flex-1">
    <table className="w-full text-sm table-fixed">
      <thead>
        {/* Table header sticky BELOW the heading */}
        <tr className="bg-blue-700 text-white sticky top-0 z-10">
          <th className="p-2">Mould</th>
          <th className="p-2">Equip</th>
          <th className="p-2">Next Due</th>
          <th className="p-2">Warning</th>
          <th className="p-2">Status</th>
          <th className="p-2">Prod Date</th>
          <th className="p-2">Shift</th>
        </tr>
      </thead>

      <tbody>
        {hcTableApi.map((r, i) => (
          <tr key={i} className="border-b h-12 text-center font-bold text-blue-900">
            <td className="p-2">{r.mouldName}</td>
            <td className="p-2">{r.equipment}</td>
            <td className="p-2">{r.nextDue}</td>
            <td className="p-2">{r.warning}</td>
            <td className="p-2">{r.status}</td>
            <td className="p-2">{r.productionDate}</td>
            <td className="p-2">{r.shift}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

</div>


            {/* BREAKDOWN */}
<div className="col-span-12 bg-white shadow-lg rounded-xl p-4">
  <h3 className="font-semibold text-center mb-4 text-black">
    Breakdown Occurrence & Duration
  </h3>

  <div className="grid grid-cols-2 gap-4">
    {/* ---------- Duration Chart ---------- */}
    <div className="bg-white p-2 rounded-xl border shadow">
      <h4 className="text-center font-semibold mb-2 text-black">Duration</h4>
   <ResponsiveContainer width="100%" height={350}>
  <BarChart
    data={breakdownApiData}
    margin={{ top: 20, right: 20, left: 20, bottom: 80 }}
  >
    <CartesianGrid strokeDasharray="3 3" />

    {/* X-axis = Name */}
    <XAxis
      dataKey="cause"
      tick={{ fontSize: 10, fontWeight: "bold", fill: "#000" }}
       angle={-20}              // rotate to prevent overlap
      textAnchor="end"
      interval={0}             // show all labels
      height={30}              // give extra space
    />

    {/* Y-axis = Duration */}
    <YAxis
      type="number"
      tick={{ fontSize: 12, fontWeight: "bold", fill: "#000" }}
    />

    <Tooltip />
    {/* <Legend /> */}
    <Bar dataKey="duration" fill="#3182ce" name="Duration (min)" />
  </BarChart>
</ResponsiveContainer>

    </div>

    {/* ---------- Occurrence Chart ---------- */}
    <div className="bg-white p-2 rounded-xl border shadow">
      <h4 className="text-center font-semibold mb-2 text-black">Occurrence</h4>
   <ResponsiveContainer width="100%" height={350}>
  <BarChart
    data={breakdownApiData}
    margin={{ top: 20, right: 20, left: 20, bottom: 80 }}
  >
    <CartesianGrid strokeDasharray="3 3" />

    <XAxis
      dataKey="cause"
      tick={{ fontSize: 10, fontWeight: "bold", fill: "#000" }}
      angle={-20}
      textAnchor="end"
      interval={0}
      height={30}
    />

    <YAxis
      type="number"
      tick={{ fontSize: 12, fontWeight: "bold", fill: "#000" }}
    />

    <Tooltip />
    {/* <Legend /> */}
    <Bar dataKey="occurrence" fill="#3182ce" name="Occurrence" />
  </BarChart>
</ResponsiveContainer>

    </div>
  </div>
</div>


            {/* ---------- SPARE PART TABLE (INTEGRATED) ---------- */}
            <div className="col-span-12 bg-white shadow rounded-xl p-4 h-80 flex flex-col">

  <h3 className="font-semibold mb-2 text-black text-center">
    Spare Part Consumption
  </h3>

  {/* Wrapper for scrollable table */}
  <div className="flex-1 overflow-auto border rounded-lg">

    {/* show loading / error */}
    {spareLoading ? (
      <div className="p-4">Loading spare part data...</div>
    ) : spareError ? (
      <div className="p-4 text-red-600">{spareError}</div>
    ) : spareParts.length === 0 ? (
      <div className="p-4">No spare part data for selected range.</div>
    ) : (
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-blue-700 text-white sticky top-0 z-20">
            <th className="p-2">Mould Name</th>
            <th className="p-2">Category</th>
            <th className="p-2">Part Name</th>
            <th className="p-2">Available Qty</th>
            <th className="p-2">Used Qty</th>
            <th className="p-2">Location</th>
            <th className="p-2">Spare Part Status</th>
          </tr>
        </thead>

        <tbody>
          {spareParts.map((r, i) => (
            <tr key={i} className="border-b h-12 text-center font-medium text-blue-900">
              <td className="p-2">{r.mouldname}</td>
              <td className="p-2">{r.category}</td>
              <td className="p-2">{r.partName}</td>
              <td className="p-2">{r.availableQty}</td>
              <td className="p-2">{r.usedQty ?? "-"}</td>
              <td className="p-2">{r.location}</td>
              <td className="p-2">{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}

  </div>
</div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
