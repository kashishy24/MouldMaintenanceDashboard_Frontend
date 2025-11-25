import React from "react";
import DashboardLayout from "../partials/DashboardLayout";
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

const warningAlarmAlertData = [
  { mould: "M01", Status: 2, NextPMDueDate: "2025-12-10", NextPMShotCount: 25000 },
  { mould: "M02", Status: 3, NextPMDueDate: "2025-12-12", NextPMShotCount: 35000 },
  { mould: "M03", Status: 3, NextPMDueDate: "2025-12-12", NextPMShotCount: 35000 },
  { mould: "M04", Status: 2, NextPMDueDate: "2025-12-10", NextPMShotCount: 25000 },
  { mould: "M05", Status: 3, NextPMDueDate: "2025-12-12", NextPMShotCount: 35000 },
  { mould: "M06", Status: 3, NextPMDueDate: "2025-12-12", NextPMShotCount: 35000 },
  { mould: "M07", Status: 2, NextPMDueDate: "2025-12-10", NextPMShotCount: 25000 },
  { mould: "M08", Status: 3, NextPMDueDate: "2025-12-12", NextPMShotCount: 35000 },
  { mould: "M09", Status: 3, NextPMDueDate: "2025-12-12", NextPMShotCount: 35000 },
];

const weekWisePMPlan = [
  { week: "Week 1", plan: 8 },
  { week: "Week 2", plan: 12 },
  { week: "Week 3", plan: 6 },
  { week: "Week 4", plan: 10 },
];

const pmInPlanData = [
  { mould: "M01", planDate: "12-Nov-25" },
  { mould: "M02", planDate: "15-Nov-25" },
  { mould: "M03", planDate: "12-Nov-25" },
  { mould: "M04", planDate: "15-Nov-25" },
  { mould: "M05", planDate: "12-Nov-25" },
  { mould: "M06", planDate: "15-Nov-25" },
  { mould: "M07", planDate: "12-Nov-25" },
  { mould: "M08", planDate: "15-Nov-25" },
  { mould: "M09", planDate: "12-Nov-25" },
  { mould: "M010", planDate: "15-Nov-25" },
  { mould: "M011", planDate: "12-Nov-25" },
  { mould: "M012", planDate: "15-Nov-25" },
  { mould: "M013", planDate: "12-Nov-25" },
  { mould: "M014", planDate: "15-Nov-25" },
  { mould: "M015", planDate: "12-Nov-25" },
  { mould: "M016", planDate: "15-Nov-25" },
  { mould: "M017", planDate: "12-Nov-25" },
  { mould: "M018", planDate: "15-Nov-25" },
];

const pmByData = [
  { mould: "M01", NextPMDate: '2026-01-04' },
  { mould: "M03",  NextPMDate: '2026-01-04' },
  { mould: "M02", NextPMDate: '2026-01-04' },
];

const nextSixMonthData = [
  { month: "Dec", count: 12 },
  { month: "Jan", count: 9 },
  { month: "Feb", count: 10 },
  { month: "Mar", count: 7 },
  { month: "Apr", count: 11 },
  { month: "May", count: 8 },
];

const pmByShotCountData = [
  { mould: "M01", shotCount: 15000 },
  { mould: "M02", shotCount: 18000 },
  { mould: "M03", shotCount: 20000 },
];

const PMStatus = () => {
  return (
    <DashboardLayout>
      <div className="p-4">

        {/* 1️⃣ Warning / Alarm / Alert */}
        <div className="bg-blue-700 text-white p-3 rounded-lg mb-3 font-semibold">
          Table which will show the PM Warning / Alarm / Alert status
        </div>

        <div className="bg-white shadow-md p-4 rounded-lg mb-6"
             style={{ maxHeight: "250px", overflowY: "auto" }}>
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Mould</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Next PM Due</th>
                <th className="border p-2">Shot Count</th>
              </tr>
            </thead>
            <tbody>
              {warningAlarmAlertData.map((row, i) => (
                <tr key={i}>
                  <td className="border p-2">{row.mould}</td>
                  <td className="border p-2">{row.Status}</td>
                  <td className="border p-2">{row.NextPMDueDate}</td>
                  <td className="border p-2">{row.NextPMShotCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 2️⃣ Week Wise Histogram */}
        <div className="bg-blue-700 text-white p-3 rounded-lg mb-3 font-semibold">
          Week wise PM Plan Histogram
        </div>
        <div className="bg-white shadow-md p-4 rounded-lg mb-6" style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekWisePMPlan}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="plan" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 3️⃣ PM in Plan Table */}
        <div className="bg-blue-700 text-white p-3 rounded-lg mb-3 font-semibold">
          Table which will show the PM in Plan
        </div>
        <div className="bg-white shadow-md p-4 rounded-lg mb-6"
             style={{ maxHeight: "250px", overflowY: "auto" }}>
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Mould</th>
                <th className="border p-2">Plan Date</th>
              </tr>
            </thead>
            <tbody>
              {pmInPlanData.map((row, i) => (
                <tr key={i}>
                  <td className="border p-2">{row.mould}</td>
                  <td className="border p-2">{row.planDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 4️⃣ Duration Table ASC */}
        <div className="bg-blue-700 text-white p-3 rounded-lg mb-3 font-semibold">
          Table which will show the PM by Duration 
        </div>
        <div className="bg-white shadow-md p-4 rounded-lg mb-6"
             style={{ maxHeight: "250px", overflowY: "auto" }}>
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Mould</th>
                <th className="border p-2">Duration</th>
              </tr>
            </thead>
            <tbody>
              {pmByData
                .sort((a, b) => a.NextPMDate - b.NextPMDate)
                .map((row, i) => (
                  <tr key={i}>
                    <td className="border p-2">{row.mould}</td>
                    <td className="border p-2">{row.NextPMDate}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* 5️⃣ Next 6 months chart */}
        <div className="bg-blue-700 text-white p-3 rounded-lg mb-3 font-semibold">
          Chart for showing next 6 months how many mould will come in PM
        </div>
        <div className="bg-white shadow-md p-4 rounded-lg mb-6" style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={nextSixMonthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 6️⃣ Shot Count ASC */}
        <div className="bg-blue-700 text-white p-3 rounded-lg mb-3 font-semibold">
          Table which will show the PM by Shot Count 
        </div>
        <div className="bg-white shadow-md p-4 rounded-lg mb-6"
             style={{ maxHeight: "250px", overflowY: "auto" }}>
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Mould</th>
                <th className="border p-2">Shot Count</th>
              </tr>
            </thead>
            <tbody>
              {pmByShotCountData
                .sort((a, b) => a.shotCount - b.shotCount)
                .map((row, i) => (
                  <tr key={i}>
                    <td className="border p-2">{row.mould}</td>
                    <td className="border p-2">{row.shotCount}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default PMStatus;
