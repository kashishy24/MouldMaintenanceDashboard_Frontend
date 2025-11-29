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

export default function ParameterChart({
  parameterData = [],
  timeLabels = [],
  apiData = {},
}) {
  // No selected parameters
  if (!Array.isArray(parameterData) || parameterData.length === 0) {
    return (
      <p className="text-gray-500 text-sm text-center">
        No active parameters selected
      </p>
    );
  }

  // Extract only the parameters that exist in backend response
  const backendKeys = parameterData
    .map((p) => p.label)
    .filter((label) => apiData && apiData[label]);

  let chartData = [];
  let finalLabels = [];

  // -------------------------------
  // CASE 1: BACKEND TREND DATA EXISTS
  // -------------------------------
  if (backendKeys.length > 0) {
    const timeSet = new Set();

    backendKeys.forEach((label) => {
      const entry = apiData[label];

      if (entry && Array.isArray(entry.labels)) {
        entry.labels.forEach((t) => timeSet.add(t));
      }
    });

    finalLabels = Array.from(timeSet).sort();

    chartData = finalLabels.map((time) => {
      const row = { time };

      backendKeys.forEach((label) => {
        const entry = apiData[label];

        if (!entry || !Array.isArray(entry.labels)) {
          row[label] = null;
          return;
        }

        const index = entry.labels.indexOf(time);
        row[label] =
          index >= 0 && entry.values && entry.values[index] != null
            ? entry.values[index]
            : null;
      });

      return row;
    });
  }

  // -----------------------------------------------
  // CASE 2: NO BACKEND TREND DATA → FALLBACK TO LOCAL
  // -----------------------------------------------
  else {
    const labels =
      Array.isArray(timeLabels) && timeLabels.length > 0
        ? timeLabels.map((h) => `${String(h).padStart(2, "0")}:00:00`)
        : Array.from(
            {
              length:
                parameterData[0]?.values?.length > 0
                  ? parameterData[0].values.length
                  : 12,
            },
            (_, i) => `T${i + 1}`
          );

    chartData = labels.map((lbl, idx) => {
      const row = { time: lbl };

      parameterData.forEach((p) => {
        if (!p || !Array.isArray(p.values)) {
          row[p.label] = null;
        } else {
          row[p.label] =
            p.values[idx] !== undefined && p.values[idx] !== null
              ? p.values[idx]
              : null;
        }
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
          <Tooltip />
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
