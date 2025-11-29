// src/partials/parameters/ParameterGroup.jsx
import SubParameterBlock from "./SubParameterBlock";

export default function ParameterGroup({ group, groupIdx, onToggle, onSelectAll, timeLabels, apiData }) {
  return (
    <div className="rounded mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="col-span-2 bg-blue-900 text-white text-center py-2 px-4 rounded-md font-semibold mb-0 w-full">
          {group.group}
        </h2>
      </div>

      <div className="grid gap-10">
        {group.subParameters.map((subParam, subIdx) => (
          <SubParameterBlock
            key={subParam.name}
            subParam={subParam}
            groupIdx={groupIdx}
            subIdx={subIdx}
            onToggle={onToggle}
            onSelectAll={onSelectAll}
            timeLabels={timeLabels}
            apiData={apiData}   // forward apiData
          />
        ))}
      </div>
    </div>
  );
}
