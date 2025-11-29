// src/partials/parameters/SubParameterBlock.jsx
import CustomToggle from "./CustomToggle";
import ParameterChart from "../charts/parameters/ParameterChart";

export default function SubParameterBlock({ subParam, groupIdx, subIdx, onToggle, onSelectAll, timeLabels, apiData }) {
  const activeSteps = subParam.steps.filter((step) => step.active);
  const allActive = subParam.steps.every((step) => step.active);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
      <div className="grid md:grid-cols-2 gap-3">
        {subParam.steps.map((step, stepIdx) => (
          <CustomToggle
            key={step.label}
            label={step.label}
            active={step.active}
            onClick={() => onToggle(groupIdx, subIdx, stepIdx)}
          />
        ))}
      </div>

      {activeSteps.length > 0 && (
        <div className="mt-4">
          {/* pass apiData so chart can use backend values if available */}
          <ParameterChart parameterData={activeSteps} timeLabels={timeLabels} apiData={apiData} />
        </div>
      )}
    </div>
  );
}
