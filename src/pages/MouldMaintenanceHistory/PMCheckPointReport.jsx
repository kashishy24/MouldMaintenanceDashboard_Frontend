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
  // const REPORT_API = `${BASE}/MouldMaintenanceHistoryPM/PmCheckPointReportDetails`;
  const HEADER_API = `${BASE}/MouldMaintenanceHistoryPM/PMCheckpointDetails/PmHeaderDetails`;
  const CHECKPOINT_API =
    `${BASE}/MouldMaintenanceHistoryPM/PMCheckpointDetails/PmCheckpointDetails`;

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
            checkArea: item.CheckArea,
            checkpointItem: item.CheckPointItems,
            checkPointArea: item.CheckPointArea,
            checkingMethod: item.CheckingMethod,
            judgementCriteria: item.JudgementCriteria,
            checkListType: item["Check List Type"],
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
  // const handlePrint = () => {
  //   window.print();
  // };

  // ================= PRINT =================
  const handlePrint = () => {
  const printContents = printRef.current.innerHTML;
  const originalContents = document.body.innerHTML;

  document.body.innerHTML = printContents;
  window.print();
  document.body.innerHTML = originalContents;

  window.location.reload(); // reload to restore React state
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
  const doc = new jsPDF("l", "mm", "a4"); // Landscape

  // ===== TITLE =====
  doc.setFontSize(16);
  doc.text("PM Checkpoint Report", 14, 15);

  doc.setFontSize(10);

  // ===== INFO CARD DATA =====
  const infoData = [
    ["Mould Name", mouldName],
    ["Part Name", headerData.PartName],
    ["Material Name", materialName],
    ["Model Code", headerData.ModelCode],
    ["Machine Tonnage", headerData.MCTonnage],
    ["User Name", userName],
    ["Gate Type", headerData.GateType],
    ["PM Instance", instance],
    ["Mould Life", mouldLife],
    ["PM Frequency", headerData.PMFreqCount],
    ["PM Due Shots", headerData.PMDueShots],
    ["PM Done Shots", "223423"],
    ["Approval Name", headerData.ApproverName],
    ["Customer Name", headerData.CustomerName],
  ];

  autoTable(doc, {
    startY: 22,
    head: [["Field", "Value"]],
    body: infoData,
    styles: {
      fontSize: 8,
    },
    theme: "grid",
  });

  // ===== TABLE DATA =====
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
    item.timeStamp
      ? new Date(item.timeStamp).toLocaleString()
      : "-",
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: doc.lastAutoTable.finalY + 10, // Start after info table
    styles: {
      fontSize: 6,
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
  // useEffect(() => {
  //   if (!loading && reportData.length === 0) {
  //     const dummyData = Array.from({ length: 200 }, (_, index) => ({
  //       instance: `INS-${index + 1}`,
  //       mouldName: mouldName || "Mould-X",
  //       checklistName: `Checklist ${index + 1}`,
  //       checkpointName: `Checkpoint ${index + 1}`,
  //       checkArea: `Area ${index % 5 + 1}`,
  //       checkpointItem: `Item ${index + 1}`,
  //       checkPointArea: `Zone ${index % 3 + 1}`,
  //       checkingMethod: "Visual",
  //       judgementCriteria: "Within Limit",
  //       checkListType: "PM",
  //       upperLimit: 100,
  //       lowerLimit: 10,
  //       standard: 50,
  //       value: Math.floor(Math.random() * 100),
  //       status:
  //         index % 3 === 0
  //           ? "OK"
  //           : index % 3 === 1
  //             ? "Warning"
  //             : "NOK",
  //       remark: "Dummy Remark",
  //       timeStamp: new Date().toLocaleString(),
  //     }));

  //     setReportData(dummyData);
  //   }
  // }, [loading]);

  return (
    <DashboardLayout>
      <div className="px-4 py-4 bg-gray-100 min-h-screen">
        <div className="w-full mx-auto space-y-4" ref={printRef}>
          {/* ===== MODERN INFO GRID ===== */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">

            <InfoCard label="Mould Name" value={mouldName} />
            <InfoCard label="Part Name" value={headerData.PartName} />
            <InfoCard label="Material Name" value={materialName} />
            <InfoCard label="Model Code" value={headerData.ModelCode} />
            <InfoCard label="Machine Tonnage" value={headerData.MCTonnage} />
            <InfoCard label="User Name" value={userName} />
            <InfoCard label="Gate Type" value={headerData.GateType} />
            <InfoCard label="PM Instance" value={instance} />
            <InfoCard label="Mould Life" value={mouldLife} />
            <InfoCard label="PM Frequency" value={headerData.PMFreqCount} />
            <InfoCard label="PM Due Shots" value={headerData.PMDueShots} />
            <InfoCard label="PM Done Shots" value="223423" />
            <InfoCard label="Approval Name" value={headerData.ApproverName} />
            <InfoCard label="Customer Name" value={headerData.CustomerName} />

          </div>

          {/* ===== ACTION BAR ===== */}
          <div className="sticky top-4 z-20 bg-white/80 backdrop-blur-md 
                border rounded-2xl shadow-md p-2 flex flex-wrap 
                justify-between items-center gap-3">

            <h2 className="text-lg font-bold text-black">
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
                    <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-700 z-10">MouldName</th>
                    <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-700 z-10">Checklist Name</th>
                    <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-700 z-10">Checkpoint Name</th>
                    <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-700 z-10">Check Area</th>
                    <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-700 z-10">Checkpoint Item</th>
                    <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-700 z-10">CheckPoint Area</th>
                    <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-700 z-10">Checking Method</th>
                    <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-700 z-10">Judgement Criteria</th>
                    <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-700 z-10">CheckList Type</th>
                    <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-700 z-10">Upper Limit</th>
                    <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-700 z-10">Lower Limit</th>
                    <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-700 z-10">Standard</th>
                    <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-700 z-10">CheckPoint Value</th>
                    <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-700 z-10">OK/NOK</th>
                    <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-700 z-10">Observation</th>
                    <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-700 z-10">TimeStamp</th>
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
                        <td className="p-3 border whitespace-nowrap text-center  font-medium text-black">{item.checkArea}</td>
                        <td className="p-3 border whitespace-nowrap text-center  font-medium text-black">{item.checkpointItem}</td>
                        <td className="p-3 border whitespace-nowrap text-center  font-medium text-black">{item.checkPointArea}</td>
                        <td className="p-3 border whitespace-nowrap text-center  font-medium text-black">{item.checkingMethod}</td>
                        <td className="p-3 border whitespace-nowrap text-center  font-medium text-black">{item.judgementCriteria}</td>
                        <td className="p-3 border whitespace-nowrap text-center  font-medium text-black">{item.checkListType}</td>
                        <td className="p-3 border whitespace-nowrap text-center  font-medium text-black">{item.upperLimit}</td>
                        <td className="p-3 border whitespace-nowrap text-center  font-medium text-black">{item.lowerLimit}</td>
                        <td className="p-3 border whitespace-nowrap text-center  font-medium text-black">{item.standard}</td>
                        <td className="p-3 border whitespace-nowrap text-center  font-medium text-black">{item.value}</td>
                        <td className="p-3 border whitespace-nowrap text-center  font-medium text-black">
                          <span
                            className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${item.status === "OK"
                                ? "bg-green-500"
                                : "bg-red-500"
                              }`}
                          >
                            {item.status || "-"}
                          </span>
                        </td>
                        <td className="p-3 border whitespace-nowrap text-center  font-medium text-black">{item.remark}</td>
                        <td className="p-3 border whitespace-nowrap text-center  font-medium text-black">{item.timeStamp}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={17} className="p-2 text-center text-gray-500">
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
