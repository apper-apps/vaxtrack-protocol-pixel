import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Layout from "@/components/organisms/Layout";
import Dashboard from "@/components/pages/Dashboard";
import Inventory from "@/components/pages/Inventory";
import ReceiveVaccines from "@/components/pages/ReceiveVaccines";
import RecordAdministration from "@/components/pages/RecordAdministration";
import Reports from "@/components/pages/Reports";
import VaccineLoss from "@/components/pages/VaccineLoss";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="receive-vaccines" element={<ReceiveVaccines />} />
          <Route path="record-administration" element={<RecordAdministration />} />
          <Route path="reports" element={<Reports />} />
          <Route path="vaccine-loss" element={<VaccineLoss />} />
        </Route>
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;