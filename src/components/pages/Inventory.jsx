import VaccineTable from "@/components/organisms/VaccineTable";

const Inventory = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Vaccine Inventory</h1>
          <p className="text-secondary-600 mt-1">
            Comprehensive view of all vaccines with sorting and search capabilities
          </p>
        </div>
      </div>

      <VaccineTable />
    </div>
  );
};

export default Inventory;