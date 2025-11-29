// src/pages/Parameters.jsx
import DashboardLayout from "../partials/DashboardLayout";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import MachineSelector from "../partials/parameters/MachineParametersCard";
import ParameterGroup from "../partials/parameters/ParameterGroup";

const generateTimeSlots = (start, end) => {
  const slots = [];
  let current = new Date(`1970-01-01T${start}:00`);
  const endTime = new Date(`1970-01-01T${end}:00`);

  while (current <= endTime) {
    const hh = current.getHours().toString().padStart(2, "0");
    const mm = current.getMinutes().toString().padStart(2, "0");
    slots.push(`${hh}:${mm}`);
    current = new Date(current.getTime() + 30 * 60000); // +30 minutes
  }
  return slots;
};

const shiftHoursConst = {
  A: generateTimeSlots("07:00", "15:30"),
  B: generateTimeSlots("15:30", "00:00"),
  C: generateTimeSlots("00:00", "07:00"), // next day logic also works
};

const defaultData = [
  {
    group: "Pressure",
    subParameters: [
      {
        name: "Injection Pressure",
        steps: [
          { label: "Injection Pressure Step 1", active: false },
          { label: "Injection Pressure Step 2", active: false },
          { label: "Injection Pressure Step 3", active: false },
          { label: "Injection Pressure Step 4",  active: false },
        ],
      },
      {
        name: "Holding Pressure",
        steps: [
          { label: "Holding Pressure Step 1", active: false },
          { label: "Holding Pressure Step 2",  active: false },
          { label: "Holding Pressure Step 3", active: false },
          { label: "Holding Pressure Step 4", active: false },
        ],
      },
      {
        name: "Dosing Pressure",
        steps: [
          { label: "Dosing Back Pressure Step 1", active: false },
          { label: "Dosing Back Pressure Step 2",active: false },
          { label: "Dosing Back Pressure Step 3",  active: false },
        ],
      },
    ],
  },
  {
    group: "Speed",
    subParameters: [
      {
        name: "Injection Speed",
        steps: [
          { label: "Injection Speed Step 1", active: false },
          { label: "Injection Speed Step 2", active: false },
          { label: "Injection Speed Step 3",  active: false },
          { label: "Injection Speed Step 4",  active: false },
        ],
      },
      {
        name: "Dosing Speed",
        steps: [
          { label: "Dosing Speed Step 1",  active: false },
          { label: "Dosing Speed Step 2", active: false },
          { label: "Dosing Speed Step 3", active: false },
          { label: "Dosing Speed Actual",  active: false },
        ],
      },
    ],
  },
  {
    group: "Temperature",
    subParameters: [
      {
        name: "Barrel Temperature",
        steps: [
          { label: "Barrel Temperature Actual Nozzle",active: false },
          { label: "Barrel Temperature Actual Zone 1", active: false },
          { label: "Barrel Temperature Actual Zone 2",active: false },
          { label: "Barrel Temperature Actual Zone 3",  active: false },
          { label: "Barrel Temperature Actual Zone 4", active: false },
          { label: "Barrel Temperature Actual Zone 5",  active: false },
        ],
      },
      {
        name: "Oil Temperature",
        steps: [{ label: "Oil Temperature Actual", value: 45, active: false }],
      },
      {
        name: "Hot Runner Temperature",
        steps: [
          { label: "Hot Runner Zone 1",  active: false },
          { label: "Hot Runner Zone 2", active: false },
          { label: "Hot Runner Zone 3",  active: false },
          { label: "Hot Runner Zone 4", active: false },
          { label: "Hot Runner Zone 5",  active: false },
          { label: "Hot Runner Zone 6",  active: false },
          { label: "Hot Runner Zone 7",  active: false },
          { label: "Hot Runner Zone 8", active: false },
          { label: "Hot Runner Zone 9",active: false },
          { label: "Hot Runner Zone 10", active: false },
          { label: "Hot Runner Zone 11",  active: false },
          { label: "Hot Runner Zone 12",  active: false },
        ],
      },
    ],
  },
  {
    group: "Timing",
    subParameters: [
      {
        name: "Cascade Injection Delay Time",
        steps: [
          { label: "Delay Time 1", active: false },
          { label: "Delay Time 2",  active: false },
          { label: "Delay Time 3",  active: false },
          { label: "Delay Time 4",  active: false },
          { label: "Delay Time 5",  active: false },
          { label: "Delay Time 6",  active: false },
          { label: "Delay Time 7", active: false },
          { label: "Delay Time 8",  active: false },
        ],
      },
      {
        name: "Holding Time",
        steps: [
          { label: "Holding Time Step 1", active: false },
          { label: "Holding Time Step 2",  active: false },
          { label: "Holding Time Step 3",  active: false },
        ],
      },
      {
        name: "Injection Time",
        steps: [{ label: "Injection Time", active: false }],
      },
      {
        name: "Cooling Time",
        steps: [{ label: "Cooling Time",  active: false }],
      },
      {
        name: "Dosing Time",
        steps: [{ label: "Dosing Time",  active: false }],
      },
    ],
  },
  {
    group: "Position",
    subParameters: [
      {
        name: "Injection Position",
        steps: [
          { label: "Injection Position for Speed 1", active: false },
          { label: "Injection Position for Speed 2",  active: false },
          { label: "Injection Position for Speed 3",  active: false },
          { label: "Injection Position for Speed 4",  active: false },
        ],
      },
    ],
  },
];

export default function Parameters() {
  const [machines, setMachines] = useState([]); // fetched from API
  const [selectedMachine, setSelectedMachine] = useState(0); // index in machines array
  const [parameters, setParameters] = useState(defaultData);
  const [filters, setFilters] = useState({
    date: "", // YYYY-MM-DD
    shift: "A",
    startTime: "",
    endTime: "",
  });

  // new states for API integration
  const [selectedLabels, setSelectedLabels] = useState([]); // array of labels currently selected (strings)
  const [apiData, setApiData] = useState({}); // { "Injection Speed Step 3": [v1, v2, ...], ... }

  const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || ""; // ensure this is set in env

  // Fetch machine list
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/MachineParameter/GetShibauraMachine`);
        if (response.data.success) {
          const machineNames = response.data.data.map((m) => ({
            id: m.EquipmentID,
            name: m.EquipmentName,
          }));
          setMachines(machineNames);
        } else {
          console.error("Failed to fetch machine data");
        }
      } catch (error) {
        console.error("Error fetching machines:", error);
      }
    };

    fetchMachines();
  }, [BASE_URL]);

  // compute time labels (hours) used by chart
  const timeLabels = useMemo(() => {
    if (filters.startTime && filters.endTime) {
  return generateTimeSlots(filters.startTime, filters.endTime);
}
    return shiftHoursConst[filters.shift] || [];
  }, [filters.startTime, filters.endTime, filters.shift]);

  // Helper: build time-based values array for each parameter from API rows
  // rows: [{ParamName, ParameterValue, Timestamp}, ...]
 const buildApiSeries = (rows = []) => {
  const grouped = {};

  rows.forEach((r) => {
    if (!grouped[r.ParamName]) grouped[r.ParamName] = [];


    const ts = new Date(r.Timestamp);
const label =
  ts.getUTCHours().toString().padStart(2, "0") + ":" +
  ts.getUTCMinutes().toString().padStart(2, "0") + ":" +
  ts.getUTCSeconds().toString().padStart(2, "0");

    grouped[r.ParamName].push({
      timeLabel: label,
      value: Number(r.ParameterValue),
    });
  });

  const out = {};

  Object.keys(grouped).forEach((param) => {
    // sorted by timestamp
    const sorted = grouped[param].sort(
  (a, b) =>
    new Date(`1970-01-01T${a.timeLabel}Z`) -
    new Date(`1970-01-01T${b.timeLabel}Z`)
);

    out[param] = {
      labels: sorted.map((x) => x.timeLabel),
      values: sorted.map((x) => x.value),
    };
  });

  return out;
};

  // Fetch parameter trend from backend
  const fetchParameterTrend = async (paramLabels = []) => {
  if (!filters.date) {
    console.warn("ProdDate is required to fetch parameter trend");
    return;
  }
  if (!machines || machines.length === 0 || machines[selectedMachine] == null) {
    console.warn("Machine not selected yet");
    return;
  }
  if (!paramLabels || paramLabels.length === 0) {
    setApiData({});
    return;
  }

  try {
    const params = {
      MachineID: machines[selectedMachine].id,
      ProdDate: filters.date,
      ShiftName: filters.shift || "",
      ParameterList: paramLabels.join(","),
    };

    // ⛔ DO NOT include null. Add only if selected.
    if (filters.startTime) params.StartTime = filters.startTime;
    if (filters.endTime) params.EndTime = filters.endTime;

    const query = new URLSearchParams(params).toString();
    const url = `${BASE_URL}/MachineParameter/GetMachineParameterTrendByTime?${query}`;

    const response = await axios.get(url);

    if (response.data && response.data.success) {
      const rows = response.data.data || [];
      const series = buildApiSeries(rows);
      setApiData(series);
    } else {
      console.error("API responded with error or no data", response.data);
      setApiData({});
    }
  } catch (err) {
    console.error("Error fetching parameter trend:", err);
    setApiData({});
  }
};

  // Toggle handler
  const handleToggle = async (groupIdx, subIdx, stepIdx) => {
    // avoid mutating state directly
    const updated = parameters.map((g, gi) => {
      if (gi !== groupIdx) return g;
      return {
        ...g,
        subParameters: g.subParameters.map((sub, si) => {
          if (si !== subIdx) return sub;
          return {
            ...sub,
            steps: sub.steps.map((s, sj) => {
              if (sj !== stepIdx) return s;
              return { ...s, active: !s.active };
            }),
          };
        }),
      };
    });

    setParameters(updated);

    // determine label toggled
    const toggled = updated[groupIdx].subParameters[subIdx].steps[stepIdx];
    const label = toggled.label;

    // update selectedLabels
    let newSelection = [...selectedLabels];
    if (toggled.active) {
      if (!newSelection.includes(label)) newSelection.push(label);
    } else {
      newSelection = newSelection.filter((l) => l !== label);
    }
    setSelectedLabels(newSelection);

    // fetch API data for currently selected labels
    if (newSelection.length > 0) {
      await fetchParameterTrend(newSelection);
    } else {
      setApiData({});
    }
  };

  const handleSelectAll = (groupIdx, subIdx = null) => {
    const updated = [...parameters];
    if (subIdx === null) {
      const allSteps = updated[groupIdx].subParameters.flatMap((p) => p.steps);
      const allActive = allSteps.every((step) => step.active);
      updated[groupIdx].subParameters = updated[groupIdx].subParameters.map((sub) => ({
        ...sub,
        steps: sub.steps.map((s) => ({ ...s, active: !allActive })),
      }));
    } else {
      const sub = updated[groupIdx].subParameters[subIdx];
      const allActive = sub.steps.every((s) => s.active);
      sub.steps = sub.steps.map((s) => ({ ...s, active: !allActive }));
    }
    setParameters(updated);

    // rebuild selectedLabels from updated data
    const newSelection = [];
    updated.forEach((g) => {
      g.subParameters.forEach((sub) => {
        sub.steps.forEach((s) => {
          if (s.active) newSelection.push(s.label);
        });
      });
    });
    setSelectedLabels(newSelection);

    if (newSelection.length > 0) {
      fetchParameterTrend(newSelection);
    } else {
      setApiData({});
    }
  };

  return (
    <DashboardLayout>
      <div className="px-8">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-5 bg-white p-4 rounded-lg shadow-sm">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Shift</label>
            <select
              value={filters.shift}
              onChange={(e) => setFilters({ ...filters, shift: e.target.value, startTime: "", endTime: "" })}
              className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Start Time</label>
            <input
              type="time"
              value={filters.startTime}
              onChange={(e) => setFilters({ ...filters, startTime: e.target.value })}
              className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">End Time</label>
            <input
              type="time"
              value={filters.endTime}
              onChange={(e) => setFilters({ ...filters, endTime: e.target.value })}
              className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div className="text-sm text-gray-700 mb-4">
          <strong>Showing Hours:</strong> {timeLabels.join(", ")}
        </div>

        {/* Machine selector */}
        <MachineSelector
          machines={machines.map((m) => m.name)}
          selected={selectedMachine}
          onSelect={setSelectedMachine}
        />

        {/* Parameter Groups: pass apiData and timeLabels down */}
        {parameters.map((group, groupIdx) => (
          <ParameterGroup
            key={group.group}
            group={group}
            groupIdx={groupIdx}
            onToggle={handleToggle}
            onSelectAll={handleSelectAll}
            timeLabels={timeLabels}
            apiData={apiData}
          />
        ))}
      </div>
    </DashboardLayout>
  );
}
