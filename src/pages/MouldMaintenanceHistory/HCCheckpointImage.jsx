import React from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "../../partials/DashboardLayout";

export default function HCCheckpointImages() {

  const [searchParams] = useSearchParams();

  const checkListID = searchParams.get("checkListID");
  const instance = searchParams.get("instance");

  return (
    <DashboardLayout>
      <div className="p-6">

        <h1 className="text-xl font-bold mb-4">
          HC Checkpoint Images
        </h1>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <p><b>CheckList ID:</b> {checkListID}</p>
          <p className="mt-2"><b>Instance:</b> {instance}</p>
        </div>

      </div>
    </DashboardLayout>
  );
}