import React from "react";
import DashboardLayout from "../../components/DashboardLayout";
import FacultyAvailabilityView from "../../components/shared/FacultyAvailabilityView";

export default function SuperAdminFacultyAvailability() {
  return (
    <DashboardLayout title="Faculty Availability (Super Admin)">
      <FacultyAvailabilityView title="Faculty Availability" />
    </DashboardLayout>
  );
}
