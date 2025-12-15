// src/partials/charts/parameters/ParameterChart.jsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = [
  "#6366F1",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#3B82F6",
  "#F97316",
  "#8B5CF6",
  "#06B6D4",
];

/* ===============================
   ✅ CUSTOM TOOLTIP WITH UNIT
================================ */
const CustomTooltip = ({ active, payload, label, apiData }) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white p-2 border rounded shadow text-sm">
      <div className="font-semibold mb-1">{label}</div>

      {payload.map((item, idx) => {
        const unit = apiData[item.name]?.unit || "";
        return (
          <div key={idx} style={{ color: item.stroke }}>
            {item.name} : {item.value}
            {unit && ` ${unit}`}
          </div>
        );
      })}
    </div>
  );
};

export default function ParameterChart({
  parameterData = [],
  timeLabels = [],
  apiData = {},
}) {
  if (!Array.isArray(parameterData) || parameterData.length === 0) {
    return (
      <p className="text-gray-500 text-sm text-center">
        No active parameters selected
      </p>
    );
  }

  const backendKeys = parameterData
    .map((p) => p.label)
    .filter((label) => apiData && apiData[label]);

  let chartData = [];
  let finalLabels = [];

  // ===============================
  // CASE 1: BACKEND DATA EXISTS
  // ===============================
  if (backendKeys.length > 0) {
    const timeSet = new Set();

    backendKeys.forEach((label) => {
      apiData[label]?.labels?.forEach((t) => timeSet.add(t));
    });

    finalLabels = Array.from(timeSet).sort();

    chartData = finalLabels.map((time) => {
      const row = { time };

      backendKeys.forEach((label) => {
        const entry = apiData[label];
        const idx = entry?.labels?.indexOf(time);
        row[label] =
          idx >= 0 && entry?.values?.[idx] != null
            ? entry.values[idx]
            : null;
      });

      return row;
    });
  }

  // ===============================
  // CASE 2: FALLBACK
  // ===============================
  else {
    const labels =
      Array.isArray(timeLabels) && timeLabels.length > 0
        ? timeLabels.map((h) => `${String(h).padStart(2, "0")}:00:00`)
        : Array.from({ length: 12 }, (_, i) => `T${i + 1}`);

    chartData = labels.map((lbl, idx) => {
      const row = { time: lbl };
      parameterData.forEach((p) => {
        row[p.label] = p.values?.[idx] ?? null;
      });
      return row;
    });
  }

  const seriesLabels = parameterData.map((p) => p.label);

  return (
    <div className="w-full h-64 bg-white rounded p-2 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fontSize: 11 }} />
          <YAxis />

          {/* ✅ TOOLTIP WITH UNIT */}
          <Tooltip content={<CustomTooltip apiData={apiData} />} />

          <Legend />

          {seriesLabels.map((lbl, idx) => (
            <Line
              key={lbl}
              type="monotone"
              dataKey={lbl}
              stroke={COLORS[idx % COLORS.length]}
              dot={{ r: 0 }}
              strokeWidth={2}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
