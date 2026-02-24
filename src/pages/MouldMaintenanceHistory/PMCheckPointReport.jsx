import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../partials/DashboardLayout";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function PMCheckPointReport() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const printRef = useRef();

  // Only take mouldName & instance
  const mouldName = searchParams.get("mouldName") || "";
  const instance = searchParams.get("instance") || "";

  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASE = (import.meta.env.VITE_BACKEND_BASE_URL || "").replace(
    /\/+$/,
    "",
  );
  const REPORT_API = `${BASE}/MouldMaintenanceHistoryPM/PmCheckPointReportDetails`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        if (mouldName) params.append("mouldName", mouldName);
        if (instance) params.append("instance", instance);

        const res = await axios.get(`${REPORT_API}?${params.toString()}`);
        setReportData(res?.data?.data || res?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mouldName, instance]);

  // ================= PRINT =================
  const handlePrint = () => {
    window.print();
  };

  // ================= EXCEL =================
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "PM Report");
    XLSX.writeFile(workbook, `PM_Report_${mouldName}_${instance}.xlsx`);
  };

  // ================= PDF =================
  // ================= FULL PDF =================
const exportToPDF = () => {
  const doc = new jsPDF("l", "mm", "a4"); // Landscape mode

  doc.setFontSize(14);
  doc.text("PM Checkpoint Report", 14, 15);

  doc.setFontSize(10);
  doc.text(`Mould: ${mouldName}`, 14, 22);
  doc.text(`Instance: ${instance}`, 14, 28);

  const tableColumn = [
    "Instance",
    "MouldName",
    "Checklist Name",
    "Checkpoint Name",
    "Check Area",
    "Checkpoint Item",
    "CheckPoint Area",
    "Checking Method",
    "Judgement Criteria",
    "CheckList Type",
    "Upper Limit",
    "Lower Limit",
    "Standard",
    "Value",
    "OK/NOK",
    "Observation",
    "TimeStamp",
  ];

  const tableRows = reportData.map((item) => [
    item.instance || "-",
    item.mouldName || "-",
    item.checklistName || "-",
    item.checkpointName || "-",
    item.checkArea || "-",
    item.checkpointItem || "-",
    item.checkPointArea || "-",
    item.checkingMethod || "-",
    item.judgementCriteria || "-",
    item.checkListType || "-",
    item.upperLimit || "-",
    item.lowerLimit || "-",
    item.standard || "-",
    item.value || "-",
    item.status || "-",
    item.remark || "-",
    item.timeStamp || "-",
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 35,
    styles: {
      fontSize: 6, // small font for many columns
    },
    headStyles: {
      fillColor: [41, 128, 185],
    },
    theme: "grid",
  });

  doc.save(`PM_Full_Report_${mouldName}_${instance}.pdf`);
};

  const InfoCard = ({ label, value }) => (
  <div className="bg-white border border-gray-200 
                  rounded-xl p-3 shadow-sm 
                  hover:shadow-md transition-all duration-200">
    <p className="text-xs text-gray-500 font-medium uppercase">
      {label}
    </p>

    <p className="text-base font-semibold text-black mt-1">
      {value || "-"}
    </p>

  </div>
);

// ===== TEMP DUMMY DATA =====
useEffect(() => {
  if (!loading && reportData.length === 0) {
    const dummyData = Array.from({ length: 200 }, (_, index) => ({
      instance: `INS-${index + 1}`,
      mouldName: mouldName || "Mould-X",
      checklistName: `Checklist ${index + 1}`,
      checkpointName: `Checkpoint ${index + 1}`,
      checkArea: `Area ${index % 5 + 1}`,
      checkpointItem: `Item ${index + 1}`,
      checkPointArea: `Zone ${index % 3 + 1}`,
      checkingMethod: "Visual",
      judgementCriteria: "Within Limit",
      checkListType: "PM",
      upperLimit: 100,
      lowerLimit: 10,
      standard: 50,
      value: Math.floor(Math.random() * 100),
      status:
        index % 3 === 0
          ? "OK"
          : index % 3 === 1
          ? "Warning"
          : "NOK",
      remark: "Dummy Remark",
      timeStamp: new Date().toLocaleString(),
    }));

    setReportData(dummyData);
  }
}, [loading]);

  return (
    <DashboardLayout>
      <div className="px-4 py-4 bg-gray-100 min-h-screen">
        <div className="w-full mx-auto space-y-4">
          {/* ===== MODERN INFO GRID ===== */}
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">

  <InfoCard label="Mould Name" value={mouldName} />
  <InfoCard label="Part Name" value="ABC" />
  <InfoCard label="Material Name" value="ABC" />
  <InfoCard label="Model Code" value="ABC" />
  <InfoCard label="Machine Tonnage" value="CADD" />
  <InfoCard label="User Name" value="SDFDSF" />
  <InfoCard label="Gate Type" value="SDFDSF" />
  <InfoCard label="PM Instance" value={instance} />
  <InfoCard label="Mould Life" value="23423" />
  <InfoCard label="PM Frequency" value="124234545" />
  <InfoCard label="PM Due Shots" value="223423" />
  <InfoCard label="PM Done Shots" value="223423" />
  <InfoCard label="Approval Name" value="223423" />
  <InfoCard label="Customer Name" value="223423" />

</div>

          {/* ===== ACTION BAR ===== */}
<div className="sticky top-4 z-20 bg-white/80 backdrop-blur-md 
                border rounded-2xl shadow-md p-4 flex flex-wrap 
                justify-between items-center gap-3">

  <h2 className="text-lg font-bold text-black  ">
    Check Point Details 
  </h2>

  <div className="flex gap-3 flex-wrap">
    <button
      onClick={handlePrint}
      className="px-4 py-2 bg-blue-600 text-white rounded-xl 
                 hover:bg-blue-700 transition shadow-md"
    >
      🖨 Print
    </button>

    <button
      onClick={exportToExcel}
      className="px-4 py-2 bg-green-600 text-white rounded-xl 
                 hover:bg-green-700 transition shadow-md"
    >
      📊 Excel
    </button>

    <button
      onClick={exportToPDF}
      className="px-4 py-2 bg-red-600 text-white rounded-xl 
                 hover:bg-red-700 transition shadow-md"
    >
      📄 PDF
    </button>

    <button
      onClick={() => navigate(-1)}
      className="px-4 py-2 bg-gray-600 text-white rounded-xl 
                 hover:bg-gray-700 transition shadow-md"
    >
      ⬅ Back
    </button>
  </div>
</div>


          {/* ===== CHECKPOINT TABLE ===== */}
          <div className="bg-white rounded-2xl shadow-lg border">
  {/* <div className="bg-blue-700 text-white px-6 py-4">
  </div> */}

  <div className="max-h-[500px] overflow-auto">
    <table className="min-w-[1500px] w-full text-sm">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 text-left">Instance</th>
                    <th className="p-3 text-left">MouldName</th>
                    <th className="p-3 text-left">Checklist Name</th>
                    <th className="p-3 text-left">Checkpoint Name</th>
                    <th className="p-3 text-left">Check Area</th>
                    <th className="p-3 text-left">Checkpoint Item</th>
                    <th className="p-3 text-left">CheckPoint Area</th>
                    <th className="p-3 text-left">Checking Method</th>
                    <th className="p-3 text-left">Judgement Criteria</th>
                    <th className="p-3 text-left">CheckList Type</th>
                    <th className="p-3 text-left">Upper Limit</th>
                    <th className="p-3 text-left">Lower Limit</th>
                    <th className="p-3 text-left">Standard</th>
                    <th className="p-3 text-left">CheckPoint Value</th>
                    <th className="p-3 text-left">OK/NOK</th>
                    <th className="p-3 text-left">Observation</th>
                    <th className="p-3 text-left">TimeStamp</th>
                  </tr>
                </thead>

               <tbody>
  {loading ? (
    <tr>
      <td colSpan={17} className="p-6 text-center">
        Loading...
      </td>
    </tr>
  ) : reportData.length > 0 ? (
    reportData.map((item, index) => (
      <tr
        key={index}
        className="border-b hover:bg-gray-50 transition"
      >
        <td className="p-3">{item.instance}</td>
        <td className="p-3">{item.mouldName}</td>
        <td className="p-3">{item.checklistName}</td>
        <td className="p-3">{item.checkpointName}</td>
        <td className="p-3">{item.checkArea}</td>
        <td className="p-3">{item.checkpointItem}</td>
        <td className="p-3">{item.checkPointArea}</td>
        <td className="p-3">{item.checkingMethod}</td>
        <td className="p-3">{item.judgementCriteria}</td>
        <td className="p-3">{item.checkListType}</td>
        <td className="p-3">{item.upperLimit}</td>
        <td className="p-3">{item.lowerLimit}</td>
        <td className="p-3">{item.standard}</td>
        <td className="p-3">{item.value}</td>
        <td className="p-3">
          <span
            className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${
              item.status === "OK"
                ? "bg-green-500"
                : item.status === "Warning"
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
          >
            {item.status}
          </span>
        </td>
        <td className="p-3">{item.remark}</td>
        <td className="p-3">{item.timeStamp}</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={17} className="p-6 text-center text-gray-500">
        No checkpoint data found.
      </td>
    </tr>
  )}
</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
