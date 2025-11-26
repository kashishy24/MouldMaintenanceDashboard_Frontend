import React, { useEffect, useMemo, useState } from "react";
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
  Legend,
  LineChart,
  Line,
} from "recharts";

// Image URL (kept as reference - not required for logic)
const REF_IMAGE = "/mnt/data/d1680102-2ecb-458b-8a22-747b7d01337e.png";
const todayISO = new Date().toISOString().slice(0, 10);

export default function SparePartUI() {
  const navigate = useNavigate();

  // -------------------------
  // Dummy master data
  // -------------------------
  const masterDummyData = useMemo(
    () => [
      { date: "2025-11-10", shift: "A", category: "Common", spare: "Thermo couple", mould: "M-A1", quantity: 18, stock: 80 },
      { date: "2025-11-10", shift: "B", category: "Common", spare: "Thermo couple", mould: "M-A1", quantity: 14, stock: 78 },
      { date: "2025-11-10", shift: "C", category: "Common", spare: "Coil Heater", mould: "M-B1", quantity: 22, stock: 55 },
      { date: "2025-11-11", category: "Common", spare: "Coil Heater", mould: "M-B1", quantity: 14, stock: 41 },
      { date: "2025-11-12", category: "Common", spare: "Heater", mould: "M-B2", quantity: 6, stock: 60 },
        { date: "2025-11-13", category: "Common", spare: "Coil Heater", mould: "M-B1", quantity: 14, stock: 41 },
      { date: "2025-11-14", category: "Common", spare: "Heater", mould: "M-B2", quantity: 6, stock: 60 },
        { date: "2025-11-15", category: "Common", spare: "Coil Heater", mould: "M-B1", quantity: 14, stock: 41 },
      { date: "2025-11-16", category: "Common", spare: "Heater", mould: "M-B2", quantity: 6, stock: 60 },
        { date: "2025-11-17", category: "Common", spare: "Coil Heater", mould: "M-B1", quantity: 14, stock: 41 },
      { date: "2025-11-18", category: "Common", spare: "Heater", mould: "M-B2", quantity: 6, stock: 60 },

        { date: "2025-11-19", category: "Common", spare: "Coil Heater", mould: "M-B1", quantity: 14, stock: 41 },
      { date: "2025-11-20", category: "Common", spare: "Heater", mould: "M-B2", quantity: 6, stock: 60 },
        { date: "2025-11-21", category: "Common", spare: "Coil Heater", mould: "M-B1", quantity: 14, stock: 41 },
      { date: "2025-11-12", category: "Common", spare: "Heater", mould: "M-B2", quantity: 6, stock: 60 },
        { date: "2025-11-11", category: "Common", spare: "Coil Heater", mould: "M-B1", quantity: 14, stock: 41 },
      { date: "2025-11-12", category: "Common", spare: "Heater", mould: "M-B2", quantity: 6, stock: 60 },
        { date: "2025-11-11", category: "Common", spare: "Coil Heater", mould: "M-B1", quantity: 14, stock: 41 },
      { date: "2025-11-12", category: "Common", spare: "Heater", mould: "M-B2", quantity: 6, stock: 60 },
        { date: "2025-11-11", category: "Common", spare: "Coil Heater", mould: "M-B1", quantity: 14, stock: 41 },
      { date: "2025-11-12", category: "Common", spare: "Heater", mould: "M-B2", quantity: 6, stock: 60 },
        { date: "2025-11-11", category: "Common", spare: "Coil Heater", mould: "M-B1", quantity: 14, stock: 41 },
      { date: "2025-11-12", category: "Common", spare: "Heater", mould: "M-B2", quantity: 6, stock: 60 },

      { date: "2025-11-13", category: "Common", spare: "Ejector Rod", mould: "M-C1", quantity: 7, stock: 44 },
      { date: "2025-11-14", category: "Consumable", spare: "Ejector Pin", mould: "M-C1", quantity: 3, stock: 34 },
      { date: "2025-11-15", category: "Common", spare: "Thermo couple", mould: "M-A1", quantity: 21, stock: 57 },
      { date: "2025-11-16", category: "Common", spare: "Coil Heater", mould: "M-B1", quantity: 32, stock: 50 },
      { date: "2025-11-17", category: "Uncommon", spare: "Seal Kit", mould: "M-D1", quantity: 11, stock: 20 },
      { date: "2025-12-01", category: "Consumable", spare: "Coolant", mould: "M-X1", quantity: 5, stock: 120 },
      { date: "2025-12-05", category: "Common", spare: "Thermo couple", mould: "M-A1", quantity: 9, stock: 48 },
      { date: "2026-01-05", category: "Common", spare: "Heater", mould: "M-B2", quantity: 7, stock: 39 },
      { date: "2026-01-15", category: "Uncommon", spare: "Sensor", mould: "M-E1", quantity: 5, stock: 16 },
      { date: "2026-02-01", category: "Consumable", spare: "Lubricant", mould: "M-F1", quantity: 12, stock: 70 },
      { date: "2025-11-11", category: "Common", spare: "Ejector Rod", mould: "M-C1", quantity: 20, stock: 40 },
      { date: "2025-11-12", category: "Common", spare: "Coil Heater", mould: "M-B1", quantity: 7, stock: 45 },
      { date: "2025-11-14", category: "Consumable", spare: "Filter", mould: "M-Y1", quantity: 8, stock: 32 },
      { date: "2025-11-16", category: "Common", spare: "Thermo couple", mould: "M-A1", quantity: 10, stock: 38 },
    ],
    []
  );
const topBarChart = [
  { name: "Item 1", value: 12 },
  { name: "Item 2", value: 18 },
  { name: "Item 3", value: 9 },
  { name: "Item 4", value: 22 },
  { name: "Item 5", value: 15 },
  { name: "Item 6", value: 27 },
  { name: "Item 7", value: 14 },
  { name: "Item 8", value: 30 },
  { name: "Item 9", value: 8 },
  { name: "Item 10", value: 25 },
  { name: "Item 11", value: 19 },
  { name: "Item 12", value: 16 },
  { name: "Item 13", value: 21 },
  { name: "Item 14", value: 11 },
  { name: "Item 15", value: 7 },
  { name: "Item 16", value: 13 },
  { name: "Item 17", value: 28 },
  { name: "Item 18", value: 10 },
  { name: "Item 19", value: 17 },
  { name: "Item 20", value: 26 },
  { name: "Item 21", value: 29 },
  { name: "Item 22", value: 24 },
  { name: "Item 23", value: 6 },
  { name: "Item 24", value: 20 },
  { name: "Item 25", value: 12 },
  { name: "Item 26", value: 23 },
  { name: "Item 27", value: 14 },
  { name: "Item 28", value: 9 },
  { name: "Item 29", value: 18 },
  { name: "Item 30", value: 27 },
  { name: "Item 31", value: 16 },
  { name: "Item 32", value: 22 },
  { name: "Item 33", value: 5 },
  { name: "Item 34", value: 11 },
  { name: "Item 35", value: 8 },
  { name: "Item 36", value: 15 },
  { name: "Item 37", value: 19 },
  { name: "Item 38", value: 13 },
  { name: "Item 39", value: 28 },
  { name: "Item 40", value: 17 },
  { name: "Item 41", value: 21 },
  { name: "Item 42", value: 10 },
  { name: "Item 43", value: 24 },
  { name: "Item 44", value: 26 },
  { name: "Item 45", value: 7 },
  { name: "Item 46", value: 23 },
  { name: "Item 47", value: 29 },
  { name: "Item 48", value: 6 },
  { name: "Item 49", value: 30 },
  { name: "Item 50", value: 12 },
];

  // -------------------------
  // Table aggregated stocks (latest record per spare)
  // -------------------------
  const tableMaster = useMemo(() => {
    const latest = {};
    masterDummyData.forEach((r) => {
      if (!latest[r.spare] || new Date(latest[r.spare].date) < new Date(r.date)) {
        latest[r.spare] = { ...r };
      }
    });
    return Object.keys(latest).map((k, i) => ({
      id: i + 1,
      name: k,
      category: latest[k].category,
      stock: latest[k].stock,
      location: latest[k].mould,
      minQty: 10,
      maxQty: 200,
      reorderLevel: 20,
    }));
  }, [masterDummyData]);

  // -------------------------
  // UI state
  // -------------------------
  const [rangeStart, setRangeStart] = useState(todayISO);
  const [rangeEnd, setRangeEnd] = useState(todayISO);
  const [category, setCategory] = useState("Common");
  const [spareName, setSpareName] = useState("");
  const [mouldName, setMouldName] = useState("");
  const [topParts, setTopParts] = useState([]);
  const [trend, setTrend] = useState([]);
  const [tableData, setTableData] = useState(tableMaster);
  const [sortAlpha, setSortAlpha] = useState(false);
  const [filterLowStock, setFilterLowStock] = useState(false);

  const categories = useMemo(() => Array.from(new Set(masterDummyData.map((d) => d.category))), [masterDummyData]);
  const spareNames = useMemo(() => Array.from(new Set(masterDummyData.filter((d) => d.category === category).map((d) => d.spare))), [category, masterDummyData]);
  const mouldNames = useMemo(() => {
    if (!spareName) return Array.from(new Set(masterDummyData.map((d) => d.mould)));
    return Array.from(new Set(masterDummyData.filter((d) => d.spare === spareName).map((d) => d.mould)));
  }, [spareName, masterDummyData]);

  // helper for month key (used only internally)
  const monthKey = (d) => {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM
  };

  // -------------------------
  // Apply filter logic
  // -------------------------
  const applyFilter = () => {
    if (!rangeStart) return;
    const start = new Date(rangeStart);
    const end = rangeEnd ? new Date(rangeEnd) : start;
    if (end < start) {
      alert("End date must be same or after start date");
      return;
    }

    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const filtered = masterDummyData.filter((r) => {
      const d = new Date(r.date);
      return d >= start && d <= end && r.category === category;
    });

    // Top 50 spare aggregation by quantity
    const agg = {};
    filtered.forEach((r) => {
      agg[r.spare] = (agg[r.spare] || 0) + (r.quantity || 0);
    });
    const top = Object.keys(agg)
      .map((k) => ({ name: k, value: agg[k] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 50);
    setTopParts(top.length ? top : [{ name: "No data", value: 0 }]);

    // Trend: depends on spareName selection
    if (spareName) {
      const trendFiltered = masterDummyData.filter((r) => {
        const d = new Date(r.date);
        if (d < start || d > end) return false;
        if (r.spare !== spareName) return false;
        if (mouldName && r.mould !== mouldName) return false;
        return true;
      });

      // if single day selected -> shift-wise
      if (rangeStart === rangeEnd) {
        const sAgg = {};
        trendFiltered.forEach((r) => {
          if (r.shift) sAgg[r.shift] = (sAgg[r.shift] || 0) + (r.quantity || 0);
        });
        setTrend(Object.keys(sAgg).map((s) => ({ label: `Shift ${s}`, value: sAgg[s] })));
      } else if (diffDays <= 30) {
        // date-wise
        const dAgg = {};
        trendFiltered.forEach((r) => {
          dAgg[r.date] = (dAgg[r.date] || 0) + (r.quantity || 0);
        });
        const sortedDates = Object.keys(dAgg).sort((a, b) => new Date(a) - new Date(b));
        setTrend(sortedDates.map((d) => ({ label: new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }), value: dAgg[d] })));
      } else {
        // month-wise, keep sortable key as YYYY-MM
        const mAgg = {};
        trendFiltered.forEach((r) => {
          const k = monthKey(r.date);
          mAgg[k] = (mAgg[k] || 0) + (r.quantity || 0);
        });
        const sortedMonths = Object.keys(mAgg).sort((a, b) => {
          const [ay, am] = a.split("-").map(Number);
          const [by, bm] = b.split("-").map(Number);
          return new Date(ay, am - 1) - new Date(by, bm - 1);
        });
        setTrend(sortedMonths.map((m) => {
          const [y, mo] = m.split("-");
          const dt = new Date(Number(y), Number(mo) - 1);
          const label = dt.toLocaleString("default", { month: "short", year: "numeric" });
          return { label, value: mAgg[m] };
        }));
      }
    } else {
      setTrend([]);
    }

    // Table filter + sort
    let t = tableMaster.filter((r) => r.category === category);
    if (filterLowStock) t = t.filter((r) => r.stock <= r.reorderLevel + 5);
    if (sortAlpha) t = [...t].sort((a, b) => a.name.localeCompare(b.name));
    setTableData(t);
  };

  // defaults on load
  useEffect(() => {
    if (!spareName && spareNames.length) setSpareName(spareNames[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);
  useEffect(() => {
    if (!mouldName && mouldNames.length) setMouldName(mouldNames[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spareName, mouldNames]);

  // run applyFilter when deps change
  useEffect(() => {
    applyFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, spareName, mouldName, filterLowStock, sortAlpha, rangeStart, rangeEnd]);

  // chart-ready data
  // const topBarChart = topParts.map((d) => ({ name: d.name, value: d.value }));
  const trendChart = trend.map((d) => ({ name: d.label, value: d.value }));

  // small helpers for visual parity with image
  const topTitle = "Spare Part Consumption";
  const midTitle = "Top 50 Spare Parts";

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Top filter row visually matching the image */}
        <div className="flex flex-wrap items-center justify-between bg-white p-4 rounded-xl shadow mb-6">
          <div className="flex gap-3 flex-wrap">
            <button className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow" onClick={() => navigate("/MouldMaintenanceHistory")}>
              PM
            </button>
            <button className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow" onClick={() => navigate("/HCHistory")}>
              HC
            </button>
            <button className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow" onClick={() => navigate("/MouldBreakdownHistory")}>
              Breakdown
            </button>
            <button className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 shadow" onClick={() => navigate("/SparePartHistory")}>
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
  <div className="flex items-center gap-3 
                  px-5 py-3 rounded-2xl shadow-lg 
                  backdrop-blur-md bg-white/40 border border-white/30">

    <label className="font-semibold text-gray-800">Category</label>

    <select
      value={category}
      onChange={(e) => setCategory(e.target.value)}
      className="px-4 py-2 rounded-xl bg-white/70 text-gray-800 
                 focus:ring-2 focus:ring-blue-500 focus:outline-none 
                 font-medium w-60 shadow-sm"
    >
      {categories.map((c) => (
        <option key={c} value={c}>{c}</option>
      ))}
    </select>

  </div>
</div>


        {/* Top line chart */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <h3 className="text-center font-semibold text-black mb-2">{topTitle}</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendChart.length ? trendChart : [{ name: "No data", value: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#000000ff", fontWeight: "bold" }}label={{  fill: "#181818ff", fontSize: 12 ,value: "Date ", position: "insideBottom", dy: 10}}/>
                <YAxis tick={{ fontSize: 12, fill: "#000000ff", fontWeight: "bold" }}label={{ fill: "#181818ff", fontSize: 12 , value: "Count", angle: -90, dx: -12 }}/>
                <Tooltip />
                {/* <Legend /> */}
                <Line type="monotone" dataKey="value" stroke="#1E3A8A" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

       {/* Middle: horizontal bar (Top 50) */}
{/* Middle: horizontal bar (Top 50) */}
<div className="bg-white rounded-xl shadow p-6 mb-6">
  <h4 className="text-center font-semibold text-gray-800 text-lg mb-4">
    {midTitle}
  </h4>

  {/* Scrollable container for 50 rows */}
  <div style={{ height: 600, overflowY: "auto", paddingRight: 10 }}>
    <ResponsiveContainer width="100%" height={1600}>
      <BarChart
        data={topBarChart}
        layout="vertical"
        barCategoryGap={2}       // spacing between bars
        margin={{ top: 20, right: 40, left: 80, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.4} />

        <XAxis
          type="number"
          tick={{ fontSize: 12, fill: "#000", fontWeight: "600" }}
          label={{
            value: "Count",
            position: "insideBottom",
            dy: 10,
            fill: "#333",
            fontWeight: "600",
          }}
        />

        <YAxis
          dataKey="name"
          type="category"
          width={100}
          tick={{ fontSize: 12, fill: "#000", fontWeight: "600" }}
          interval={0} // show all 50 labels cleanly
          label={{
            value: "Name",
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
          name="Quantity"
          fill="#1E3A8A"
          barSize={12}        // thicker bar
          radius={[6, 6, 6, 6]} // rounded bar edges
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>


        {/* <div className="flex items-center gap-3 mb-3">
          <select value={spareName} onChange={(e) => setSpareName(e.target.value)} className="border px-3 py-2 rounded w-56">
            <option value="">Spare Part Name</option>
            {spareNames.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={mouldName} onChange={(e) => setMouldName(e.target.value)} className="border px-3 py-2 rounded w-44">
            <option value="">Mould Name</option>
            {mouldNames.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div> */}

        {/* Spare part trend small chart */}
        {/* <div className="bg-white rounded-xl shadow p-4 mb-6">
          <h4 className="text-center font-semibold text-gray-700 mb-2">{spareName || "YHB RPG Extension"}</h4>
          <div style={{ height: 120 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendChart.length ? trendChart : [{ name: "No data", value: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#F97316" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div> */}

        {/* Filters above table */}
        <div className="flex items-center gap-3 mb-3">
          {/* <select className="border px-3 py-2 rounded w-56">
            <option>Category</option>
          </select> */}
          {/* <div className="ml-auto flex items-center gap-3">
            <label className="text-sm">
              <input type="checkbox" checked={sortAlpha} onChange={(e) => setSortAlpha(e.target.checked)} /> Sort A-Z
            </label>
            <label className="text-sm">
              <input type="checkbox" checked={filterLowStock} onChange={(e) => setFilterLowStock(e.target.checked)} /> Low stock only
            </label>
          </div> */}
        </div>

        {/* Table */}
        {/* <div className="bg-white rounded-xl shadow p-4">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-blue-900 text-white text-xs">
              <tr>
                <th className="p-2 border ">Spare Part Name</th>
                <th className="p-2 border">Spare Part Category</th>
                <th className="p-2 border">Spare Part Status</th>
                <th className="p-2 border">Spare Part Stock Quantity</th>
                <th className="p-2 border">Spare Part Location</th>
                <th className="p-2 border">Minimum Quantity</th>
                <th className="p-2 border">Maximum Quantity</th>
                <th className="p-2 border">Reorder Level</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((r) => (
                <tr key={r.id} className={`text-center ${r.stock <= r.reorderLevel ? "bg-red-50" : ""}`}>
                  <td className="p-2 border text-left text-center font-bold text-blue-900">{r.name}</td>
                  <td className="p-2 border text-center font-bold text-blue-900">{r.category}</td>
                  <td className="p-2 border text-center font-bold text-blue-900">{r.stock > r.reorderLevel ? "OK" : "Low"}</td>
                  <td className="p-2 border text-center font-bold text-blue-900">{r.stock}</td>
                  <td className="p-2 border text-center font-bold text-blue-900">{r.location}</td>
                  <td className="p-2 border text-center font-bold text-blue-900">{r.minQty}</td>
                  <td className="p-2 border text-center font-bold text-blue-900">{r.maxQty}</td>
                  <td className="p-2 border text-center font-bold text-blue-900">{r.reorderLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div> */}
      </div>
    </DashboardLayout>
  );
}
