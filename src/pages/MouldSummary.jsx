// src/pages/MouldSummary.jsx
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
  Cell,
  Legend,
} from "recharts";

// normalize BASE (remove trailing slash)
const BASE = (import.meta.env.VITE_BACKEND_BASE_URL || "").replace(/\/+$/, "");

const MouldSummary = () => {
  // ---------------- DROPDOWN + API STATE ----------------
  const [mouldList, setMouldList] = useState([]);
  const [selectedMould, setSelectedMould] = useState(""); // stores MouldName
  const [mouldInfo, setMouldInfo] = useState({ MouldID: "", MouldDesc: "" });

  // KPI data
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(false);

  // Breakdown charts data
  const [breakdownDuration, setBreakdownDuration] = useState([]); // {reason, duration}
  const [breakdownOccurrence, setBreakdownOccurrence] = useState([]); // {reason, count}
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);

  // Spare parts state (fetched from API)
  const [spareParts, setSpareParts] = useState([]); // { name, qty }
  const [loadingSpare, setLoadingSpare] = useState(false);
  const [spareError, setSpareError] = useState(null);

  // PM/HC OnTime vs Delayed data
  const [pmOnTimeData, setPmOnTimeData] = useState([]); // [{ month, OnTime, Delayed }]
  const [hcOnTimeData, setHcOnTimeData] = useState([]); // [{ month, OnTime, Delayed }]
  const [loadingOnTime, setLoadingOnTime] = useState(false);

  // ---------------- Fetch mould list on load ----------------
  useEffect(() => {
    const fetchMouldNames = async () => {
      try {
        const res = await axios.get(`${BASE}/MouldSummary/MouldName`);
        if (res.data?.success && Array.isArray(res.data.data)) {
          setMouldList(res.data.data);
        } else {
          console.error("Invalid MouldName response", res.data);
        }
      } catch (err) {
        console.error("Error fetching MouldName list:", err);
      }
    };
    fetchMouldNames();
  }, []);

  // Helper date formatter
  const formatDate = (value) => {
    if (!value) return "--";
    const d = new Date(value);
    if (isNaN(d.getTime())) return value; // return raw if not parseable
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Helper: group API rows into {month, OnTime, Delayed} array
  const groupOnTimeRows = (rows) => {
    // rows: expected objects containing MonthName or YearMonth and Remark ("OnTime"|"Delayed")
    const map = new Map();
    (Array.isArray(rows) ? rows : []).forEach((r) => {
      const monthKey = r.MonthName || r.YearMonth || r.month || "Unknown";
      const remark = (r.Remark || r.remark || "").toString().trim().toLowerCase();
      if (!map.has(monthKey)) map.set(monthKey, { month: monthKey, OnTime: 0, Delayed: 0 });
      const entry = map.get(monthKey);
      if (remark === "ontime" || remark === "on time") entry.OnTime += 1;
      else entry.Delayed += 1;
    });

    // Convert to array and sort by YearMonth if available (format 'YYYY/MM')
    const arr = Array.from(map.values());
    arr.sort((a, b) => {
      // try parse YearMonth
      const ay = (a.month || "").split("/").map(Number);
      const by = (b.month || "").split("/").map(Number);
      if (ay.length === 2 && by.length === 2 && !isNaN(ay[0]) && !isNaN(by[0])) {
        if (ay[0] !== by[0]) return ay[0] - by[0];
        return ay[1] - by[1];
      }
      // fallback alphabetical
      return (a.month || "").localeCompare(b.month || "");
    });
    return arr;
  };

  // ---------------- Handle mould change ----------------
  const handleMouldChange = async (e) => {
    const mouldName = e.target.value;
    setSelectedMould(mouldName);
    setMouldInfo({ MouldID: "", MouldDesc: "" });
    setOverview(null);
    setBreakdownDuration([]);
    setBreakdownOccurrence([]);
    setSpareParts([]);
    setSpareError(null);
    setPmOnTimeData([]);
    setHcOnTimeData([]);

    if (!mouldName) return;

    try {
      // 1) Get MouldID & MouldDesc
      const idDescRes = await axios.get(`${BASE}/MouldSummary/MouldIDDesc`, {
        params: { mouldName },
      });

      if (idDescRes.data?.success && Array.isArray(idDescRes.data.data)) {
        const info = idDescRes.data.data[0] || {};
        const mouldId = info.MouldID || info.MouldId || info.ID || "";

        setMouldInfo({
          MouldID: mouldId,
          MouldDesc:
            info.MouldDesc || info.MouldDescription || info.Description || "",
        });

        // If we have a mouldId, fetch overview, breakdowns, on-time APIs and spare parts in parallel
        if (mouldId) {
          // overview fetch
          const overviewPromise = (async () => {
            try {
              setLoadingOverview(true);
              const ovRes = await axios.get(
                `${BASE}/MouldSummary/mouldPMHCOverview`,
                { params: { mouldId } }
              );
              if (ovRes.data?.success) {
                setOverview(
                  Array.isArray(ovRes.data.data) ? ovRes.data.data[0] : ovRes.data.data
                );
              } else {
                console.error("Invalid overview response", ovRes.data);
                setOverview(null);
              }
            } catch (err) {
              console.error("Error fetching mouldPMHCOverview:", err);
              setOverview(null);
            } finally {
              setLoadingOverview(false);
            }
          })();

          // breakdowns, spare parts, on-time PM & HC in parallel
          const otherPromise = (async () => {
            try {
              setLoadingBreakdown(true);
              setLoadingSpare(true);
              setLoadingOnTime(true);
              setSpareError(null);

              const [durRes, occRes, spareRes, pmOnRes, hcOnRes] = await Promise.all([
                axios.get(`${BASE}/MouldSummary/DashboardGetTop5BreakDownsByDuration`, {
                  params: { mouldId },
                }),
                axios.get(
                  `${BASE}/MouldSummary/DashboardGetTop5BreakDownsByOccurrences`,
                  { params: { mouldId } }
                ),
                axios.get(
                  `${BASE}/MouldSummary/Dashboard_GetTop10SpareParts_ByMould`,
                  { params: { mouldId } }
                ),
                axios.get(`${BASE}/MouldSummary/Dashboard_PM_OnTimeVsDelayed`, {
                  params: { mouldId },
                }),
                axios.get(`${BASE}/MouldSummary/Dashboard_HC_OnTimeVsDelayed`, {
                  params: { mouldId },
                }),
              ]);

              // Parse Duration API
              let durRows = durRes.data?.data ?? [];
              const parsedDur = (Array.isArray(durRows) ? durRows : []).map((r) => {
                const reason = r.BDReason || r.Reason || r.Label || "Unknown";
                const numericKey = Object.keys(r).find(
                  (k) => k !== "BDReason" && r[k] != null && !isNaN(Number(r[k]))
                );
                const duration = numericKey ? Number(r[numericKey]) : Number(r.Duration ?? 0);
                return { reason, duration };
              });
              setBreakdownDuration(parsedDur);

              // Parse Occurrence API
              let occRows = occRes.data?.data ?? [];
              const parsedOcc = (Array.isArray(occRows) ? occRows : []).map((r) => {
                const reason = r.BDReason || r.Reason || r.Label || "Unknown";
                const count = Number(
                  r.OccurrenceCount ??
                    r.TotalOccurrences ??
                    r.Count ??
                    Object.values(r).find((v) => Number.isFinite(Number(v)) && Number(v) >= 0) ??
                    0
                );
                return { reason, count };
              });
              setBreakdownOccurrence(parsedOcc);

              // Parse SpareParts API
              // let spareRows = spareRes.data?.data ?? [];
              // const parsedSpare = (Array.isArray(spareRows) ? spareRows : []).map((s) => ({
              //   name: s.SparePartName || s.PartName || `Part-${s.SparePartID ?? "?"}`,
              //   qty: Number(s.TotalQuantityUsed ?? s.Quantity ?? s.TotalUsed ?? 0),
              // }));
              // setSpareParts(parsedSpare);
let spareRows = spareRes.data?.data ?? [];
              const parsedSpare = (Array.isArray(spareRows) ? spareRows : []).map((s) => ({
  id: s.SparePartID ?? null,
  name: s.SparePartName ?? `Part-${s.SparePartID ?? "?"}`,
  qty: Number(s.TotalQuantityUsed ?? 0),
}));
setSpareParts(parsedSpare);
              // Parse PM OnTime API
              const pmRows = pmOnRes.data?.data ?? [];
              const groupedPm = groupOnTimeRows(pmRows);
              setPmOnTimeData(groupedPm);

              // Parse HC OnTime API
              const hcRows = hcOnRes.data?.data ?? [];
              const groupedHc = groupOnTimeRows(hcRows);
              setHcOnTimeData(groupedHc);
            } catch (err) {
              console.error("Error fetching breakdown/spare/on-time APIs:", err);
              setBreakdownDuration([]);
              setBreakdownOccurrence([]);
              setSpareParts([]);
              setPmOnTimeData([]);
              setHcOnTimeData([]);
              setSpareError("Failed to load some data");
            } finally {
              setLoadingBreakdown(false);
              setLoadingSpare(false);
              setLoadingOnTime(false);
            }
          })();

          await Promise.all([overviewPromise, otherPromise]);
        } // end if mouldId
      } else {
        console.error("Invalid MouldIDDesc response", idDescRes.data);
      }
    } catch (err) {
      console.error("Error fetching MouldIDDesc:", err);
    }
  };

  // Build KPI cards using overview data (keeps old mapping)
  const kpis = [
    { title: "Mould Start Date", value: formatDate(overview?.MouldStartDate) },
    { title: "Mould Current Life", value: overview?.MouldCurrentLife ?? "--" },
    {
      title: "Mould Current Life in Days",
      value: overview ? (overview["Mould Current Life in Days"] ?? overview.MouldCurrentLifeInDays ?? "--") : "--",
    },
    { title: "Number of PM Done", value: overview?.NumberOfPMDone ?? "--" },
    { title: "PM Shot Count", value: overview?.LastPMShotcount ?? "--" },
    { title: "Last PM Date", value: formatDate(overview?.LastPMDate) },
    { title: "Next PM By Date", value: formatDate(overview?.NextPMDueDate) },
    { title: "Next PM By Shot Count", value: overview?.NextPMByShotCount ?? "--" },
    { title: "HC Start Date", value: formatDate(overview?.HCStartDate) },
    { title: "HC Start Count", value: overview?.HCStartCount ?? "--" },
    { title: "Number HC Done", value: overview?.NumberOfHCDone ?? "--" },
    { title: "Last HC Shot Count", value: overview?.LastHCShotcount ?? "--" },
    { title: "Last HC Date", value: formatDate(overview?.LastHCDate) },
    { title: "Next HC By Date", value: formatDate(overview?.NextHCDueDate) },
    { title: "Next HC By Shot Count", value: overview?.NextHCByShotCount ?? "--" },
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
              <label className="font-semibold text-gray-700 mb-1 block">Select Mould</label>
              <select
                className="w-full border border-gray-300 px-4 py-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none bg-gray-50 text-black"
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
              <label className="font-semibold text-gray-700 mb-1 block">Mould ID</label>
              <div className="bg-gray-100 px-4 py-3 rounded-lg shadow-sm font-semibold text-gray-800">
                {mouldInfo.MouldID || "--"}
              </div>
            </div>

            {/* --- Mould Description --- */}
            <div>
              <label className="font-semibold text-gray-700 mb-1 block">Mould Description</label>
              <div className="bg-gray-100 px-4 py-3 rounded-lg shadow-sm font-semibold text-gray-800">
                {mouldInfo.MouldDesc || "--"}
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- KPI BLUE CARDS ---------------- */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {loadingOverview && (
            <div className="col-span-5 text-center text-sm text-gray-600">Loading KPIs...</div>
          )}

          {kpis.map((item, idx) => (
            <div key={idx} className="bg-blue-100 border border-blue-500 p-3 rounded-xl shadow text-center">
              <p className="text-xs text-black font-semibold">{item.title}</p>
              <p className="text-lg font-bold text-black">{item.value ?? "--"}</p>
            </div>
          ))}
        </div>

        {/* ---------------- PM & HC OnTime vs Delayed Charts ---------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          {/* PM OnTime vs Delayed */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-black text-center">PM OnTime vs Delayed</h2>
            <div className="h-[320px]">
              {loadingOnTime ? (
                <div className="flex items-center justify-center h-full">Loading...</div>
              ) : pmOnTimeData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-gray-600">No PM on-time data for selected mould.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pmOnTimeData} margin={{ bottom: 20 }}>
                    <CartesianGrid strokeDasharray="4 4" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fontWeight: "bold" }} angle={-20} textAnchor="end" height={64} />
                    <YAxis tick={{ fontSize: 12, fontWeight: "bold" }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="OnTime" stackId="a" fill="#16a34a" />
                    <Bar dataKey="Delayed" stackId="a" fill="#dc2626" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* HC OnTime vs Delayed */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-black text-center">HC OnTime vs Delayed</h2>
            <div className="h-[320px]">
              {loadingOnTime ? (
                <div className="flex items-center justify-center h-full">Loading...</div>
              ) : hcOnTimeData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-gray-600">No HC on-time data for selected mould.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hcOnTimeData} margin={{ bottom: 20 }}>
                    <CartesianGrid strokeDasharray="4 4" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fontWeight: "bold" }} angle={-20} textAnchor="end" height={64} />
                    <YAxis tick={{ fontSize: 12, fontWeight: "bold" }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="OnTime" stackId="a" fill="#16a34a" />
                    <Bar dataKey="Delayed" stackId="a" fill="#dc2626" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* ---------------- Breakdown & Spare Part Charts ---------------- */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {/* Breakdown by Duration */}
          <div className="bg-white shadow-lg rounded-xl p-4">
            <h2 className="font-semibold mb-2 text-lg text-black text-center">Top 5 Breakdown by Duration</h2>

            {loadingBreakdown ? (
              <div className="p-6 text-center">Loading breakdown...</div>
            ) : breakdownDuration.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-600">No breakdown duration data.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={breakdownDuration} margin={{ bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="reason"
                    angle={-40}
                    textAnchor="end"
                    interval={0}
                    height={60}
                    tick={{ fontSize: 12, fill: "#181818ff", fontWeight: "bold" }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "#181818ff", fontWeight: "bold" }} />
                  <Tooltip />
                  <Bar dataKey="duration" fill="#5885E0" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Breakdown by Count */}
          <div className="bg-white shadow-lg rounded-xl p-4">
            <h2 className="font-semibold mb-2 text-lg text-black text-center">Top 5 Breakdown by Occurrence</h2>

            {loadingBreakdown ? (
              <div className="p-6 text-center">Loading breakdown...</div>
            ) : breakdownOccurrence.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-600">No breakdown occurrence data.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={breakdownOccurrence} margin={{ bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="reason"
                    angle={-40}
                    textAnchor="end"
                    interval={0}
                    height={60}
                    tick={{ fontSize: 12, fill: "#181818ff", fontWeight: "bold" }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "#181818ff", fontWeight: "bold" }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#FF8C42" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Spare Part Consumption */}
        <div className="bg-white rounded-2xl p-5 mt-10 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-black text-center">Top 10 Spare Part Consumption</h2>

          {loadingSpare ? (
            <div className="p-6 text-center">Loading spare-part data...</div>
          ) : spareError ? (
            <div className="p-6 text-center text-red-600">{spareError}</div>
          ) : spareParts.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-600">No spare part data for selected mould.</div>
          ) : (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spareParts}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fill: "#181818ff", fontSize: 12, fontWeight: "bold" }} angle={-8} textAnchor="end" interval={0} />
                  <YAxis tick={{ fill: "#181818ff", fontSize: 12, fontWeight: "bold" }} />
                  <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />
                  <Bar dataKey="qty" fill="#22A699" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MouldSummary;
