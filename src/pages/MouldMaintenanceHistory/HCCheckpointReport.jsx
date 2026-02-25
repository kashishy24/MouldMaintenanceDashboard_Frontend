import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../partials/DashboardLayout";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function HCCheckPointReport() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const printRef = useRef();

  // Only take mouldName & instance
  const checkListID = searchParams.get("checkListID") || "";
  const mouldName = searchParams.get("mouldName") || "";
  const materialName = searchParams.get("materialName") || "";
  const mouldLife = searchParams.get("atMouldLife") || "";
  const userName = searchParams.get("userName") || "";
  const instance = searchParams.get("instance") || "";
  const [headerData, setHeaderData] = useState({});
  const [loadingHeader, setLoadingHeader] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASE = (import.meta.env.VITE_BACKEND_BASE_URL || "").replace(
    /\/+$/,
    "",
  );
  const HEADER_API = `${BASE}/MouldMaintenanceHistoryHC/HCCheckpointDetails/HCHeaderDetails`;
  const CHECKPOINT_API =
    `${BASE}/MouldMaintenanceHistoryHC/HCCheckpointDetails/HCCheckpointDetails`;

  //-----to show the header data
  useEffect(() => {
    const fetchHeader = async () => {
      try {
        setLoadingHeader(true);

        const res = await axios.get(HEADER_API, {
          params: {
            checkListID,
            instance,
          },
        });

        if (res.data.success) {
          setHeaderData(res.data.data[0] || {});
        }
      } catch (err) {
        console.error("Header fetch error:", err);
      } finally {
        setLoadingHeader(false);
      }
    };

    if (checkListID && instance) {
      fetchHeader();
    }
  }, [checkListID, instance]);
  //-------------to show table data
  useEffect(() => {
    const fetchCheckpointDetails = async () => {
      try {
        setLoading(true);

        const res = await axios.get(CHECKPOINT_API, {
          params: {
            checkListID,
            instance,
          },
        });

        if (res.data.success) {
          const mappedData = res.data.data.map((item) => ({
          instance: item.Instance,
          mouldName: item.MouldName,
          checklistName: item.CheckListName,
          checkpointName: item.CheckPointName,
          category: item.CheckPointCategory,
          standardCondition: item.StandardCondition,
          uom: item.UOM,
          checkingMethod: item.CheckingMethod,
          checkPointType: item["Check Point Type"],
          upperLimit: item.UpperLimit,
          lowerLimit: item.LowerLimit,
          standard: item.Standard,
          value: item.CheckPointValue,
          status: item.OKNOK,
          remark: item.Observation,
          timeStamp: item.Timestamp,
          }));

          setReportData(mappedData);
        }
      } catch (error) {
        console.error("Checkpoint fetch error:", error);
        setReportData([]);
      } finally {
        setLoading(false);
      }
    };

    if (checkListID && instance) {
      fetchCheckpointDetails();
    }
  }, [checkListID, instance]);


  // ================= PRINT =================
 const handlePrint = () => {
  const printContent = printRef.current.innerHTML;
 
  const WinPrint = window.open("", "", "width=1200,height=800");
 
  WinPrint.document.write(`
    <html>
      <head>
        <title>HC Report</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 8mm;
          }
 
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
 
          /* ===== INFO CARD GRID ===== */
          .grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 10px;
            margin-bottom: 20px;
          }
 
          .grid > div {
            border: 1px solid #ccc;
            padding: 8px;
            border-radius: 6px;
            page-break-inside: avoid;
          }
 
          .grid p:first-child {
            font-size: 10px;
            color: #555;
            text-transform: uppercase;
            margin: 0;
          }
 
          .grid p:last-child {
            font-size: 12px;
            font-weight: bold;
            margin: 4px 0 0 0;
          }
 
          /* ===== HIDE BUTTONS ===== */
          button {
            display: none !important;
          }
 
          /* ===== TABLE ===== */
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8px;
          }
 
          th, td {
            border: 1px solid #000;
            padding: 6px;
            text-align: center;
          }
 
          th {
            background: #1f2937;
            color: white;
          }
 
          thead {
            display: table-header-group;
          }
 
          tr {
            page-break-inside: avoid;
          }
 
        </style>
      </head>
      <body>
        ${printContent}
      </body>
    </html>
  `);
 
  WinPrint.document.close();
  WinPrint.focus();
  WinPrint.print();
  WinPrint.close();
};
 

  // ================= EXCEL =================
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "HC Report");
    XLSX.writeFile(workbook, `HC_Report_${mouldName}_${instance}.xlsx`);
  };


  // ================= PDF =================
  // ================= FULL PDF =================
  // ================= PDF =================
  const exportToPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");

    doc.setFontSize(16);
    doc.text("HC Checkpoint Report", 14, 15);

    // ===== INFO CARD DATA =====
    const infoData = [
      ["Mould Name", mouldName],
      ["HC Instance", instance],
      ["Part Name", headerData.PartName],
      ["Material Name", materialName],
      ["Model Code", headerData.ModelCode],
      ["Machine Tonnage", headerData.MCTonnage],
      ["User Name", userName],
      ["Gate Type", headerData.GateType],
      ["Mould Life", mouldLife],
      ["HC Frequency", headerData.HCFreqCount],
      ["HC Due Shots", headerData.HCDueShots],
      ["HC Done Shots", "223423"],
      ["Approval Name", headerData.ApproverName],
      ["Customer Name", headerData.CustomerName],
    ];

    autoTable(doc, {
      startY: 22,
      head: [["Field", "Value"]],
      body: infoData,
      theme: "grid",
      styles: { fontSize: 9 },
    });

    const tableColumn = [
      "Instance",
      "MouldName",
      "Checklist Name",
      "Checkpoint Name",
      "CheckPointCategory",
      "StandardCondition",
      "UOM",
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
      item.CheckPointCategory || "-",
      item.StandardCondition || "-",
      item.UOM || "-",
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
      startY: doc.lastAutoTable.finalY + 10,
      styles: { fontSize: 6 },
      theme: "grid",
    });

    doc.save(`HC_Full_Report_${mouldName}_${instance}.pdf`);
  };

  const InfoCard = ({ label, value }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-2 shadow-sm hover:shadow-md transition-all duration-200">
      <p className="text-xs text-gray-500 font-medium uppercase">{label}</p>
      <p className="text-base font-semibold text-black mt-1">
        {value || "-"}
      </p>
    </div>
  );


  return (
    <DashboardLayout>
      <div className="px-4 py-4 bg-gray-100 min-h-screen">
        <div ref={printRef} className="w-full mx-auto space-y-4">
          {/* ===== MODERN INFO GRID ===== */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">

            <InfoCard label="Mould Name" value={mouldName} />
            <InfoCard label="Part Name" value={headerData.PartName} />
            <InfoCard label="Material Name" value={materialName} />
            <InfoCard label="Model Code" value={headerData.ModelCode} />
            <InfoCard label="Machine Tonnage" value={headerData.MCTonnage} />
            <InfoCard label="User Name" value={userName} />
            <InfoCard label="Gate Type" value={headerData.GateType} />
            <InfoCard label="HC Instance" value={instance} />
            <InfoCard label="Mould Life" value={mouldLife} />
            <InfoCard label="HC Frequency" value={headerData.HCFreqCount} />
            <InfoCard label="HC Due Shots" value={headerData.HCDueShots} />
            <InfoCard label="HC Done Shots" value="223423" />
            <InfoCard label="Approval Name" value={headerData.ApproverName} />
            <InfoCard label="Customer Name" value={headerData.CustomerName} />

          </div>

          {/* ===== ACTION BAR ===== */}
          <div className="sticky top-4 z-20 bg-white/80 backdrop-blur-md 
                border rounded-2xl shadow-md p-2 flex flex-wrap 
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
                <thead className="bg-gray-900 text-white text-xs">
                  <tr>
                    <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-700 z-10">Instance</th>
                    <th className="p-3 text-left border whitespace-nowrap sticky top-0 bg-blue-700">MouldName</th>
                    <th className="p-3 text-left border whitespace-nowrap sticky top-0 bg-blue-700 ">Checklist Name</th>
                    <th className="p-3 text-left border whitespace-nowrap sticky top-0 bg-blue-700">Checkpoint Name</th>
                    <th className="p-3 text-left border whitespace-nowrap sticky top-0 bg-blue-700">CheckPoint Category</th>
                    <th className="p-3 text-left border whitespace-nowrap sticky top-0 bg-blue-700"> Standard Condition</th>
                    <th className="p-3 text-left border whitespace-nowrap sticky top-0 bg-blue-700">UOM</th>
                    <th className="p-3 text-left border whitespace-nowrap sticky top-0 bg-blue-700">Checking Method</th>
                   
                    <th className="p-3 text-left border whitespace-nowrap sticky top-0 bg-blue-700">checkPoint Type</th>
                    <th className="p-3 text-left border whitespace-nowrap sticky top-0 bg-blue-700">Upper Limit</th>
                    <th className="p-3 text-left border whitespace-nowrap sticky top-0 bg-blue-700">Lower Limit</th>
                    <th className="p-3 text-left border whitespace-nowrap sticky top-0 bg-blue-700">Standard</th>
                    <th className="p-3 text-left border whitespace-nowrap sticky top-0 bg-blue-700">CheckPoint Value</th>
                    <th className="p-3 text-left border whitespace-nowrap sticky top-0 bg-blue-700">OK/NOK</th>
                    <th className="p-3 text-left border whitespace-nowrap sticky top-0 bg-blue-700">Observation</th>
                    <th className="p-3 text-left border whitespace-nowrap sticky top-0 bg-blue-700">TimeStamp</th>
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
                        <td className="p-3 border whitespace-nowrap text-center  font-medium text-black">{item.instance}</td>
                        <td className="p-3 border whitespace-nowrap text-center  font-medium text-black">{item.mouldName}</td>
                        <td className="p-3 border whitespace-nowrap text-center  font-medium text-black">{item.checklistName}</td>
                        <td className="p-3 border whitespace-nowrap text-center  font-medium text-black">{item.checkpointName}</td>
                        <td className="p-3 border whitespace-nowrap text-center  font-medium text-black">{item.category}</td>
                        <td className="p-3 border whitespace-nowrap text-center  font-medium text-black">{item.standardCondition}</td>
                        <td className="p-3 border whitespace-nowrap text-center  font-medium text-black">{item.uom}</td>
                        <td className="p-3 border whitespace-nowrap text-center  font-medium text-black">{item.checkingMethod}</td>
                        <td className="p-3 border whitespace-nowrap text-center  font-medium text-black">{item.checkPointType}</td>
                        <td className="p-3 border whitespace-nowrap text-center  font-medium text-black">{item.upperLimit}</td>
                        <td className="p-3 border whitespace-nowrap text-center  font-medium text-black">{item.lowerLimit}</td>
                        <td className="p-3 border whitespace-nowrap text-center  font-medium text-black">{item.standard}</td>
                        <td className="p-3 border whitespace-nowrap text-center  font-medium text-black">{item.value}</td>
                        <td className="p-3">
                          <span
                            className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${item.status === "OK"
                              ? "bg-green-500"
                              : item.status === "Warning"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                              }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3 border whitespace-nowrap text-center  font-medium text-black">{item.remark}</td>
                        <td className="p-3 border whitespace-nowrap text-center  font-medium text-black">{item.timeStamp}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={17} className="p-3 text-center text-gray-500">
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
