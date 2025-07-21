import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import ExpirationBadge from "@/components/molecules/ExpirationBadge";
import SearchBar from "@/components/molecules/SearchBar";
import ApperIcon from "@/components/ApperIcon";

const VaccineTable = ({ showAdministration = false }) => {
  const [vaccines, setVaccines] = useState([]);
  const [filteredVaccines, setFilteredVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortField, setSortField] = useState("commercial_name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [administrationValues, setAdministrationValues] = useState({});

  useEffect(() => {
    loadVaccines();
  }, []);

  const loadVaccines = async () => {
    try {
      setLoading(true);
      setError("");
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "commercial_name" } },
          { field: { Name: "generic_name" } },
          { field: { Name: "lot_number" } },
          { field: { Name: "quantity" } },
          { field: { Name: "expiration_date" } },
          { field: { Name: "received_date" } },
          { field: { Name: "quantity_on_hand" } },
          { field: { Name: "administered_doses" } }
        ],
        orderBy: [
          {
            fieldName: "commercial_name",
            sorttype: "ASC"
          }
        ]
      };
      
      const response = await apperClient.fetchRecords("vaccine", params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        setVaccines([]);
        setFilteredVaccines([]);
        return;
      }
      
      const data = response.data || [];
      setVaccines(data);
      setFilteredVaccines(data);
    } catch (err) {
      if (err?.response?.data?.message) {
        console.error("Error fetching vaccines:", err?.response?.data?.message);
      } else {
        console.error(err.message);
      }
      setError("Failed to load vaccines. Please try again.");
      toast.error("Failed to load vaccines");
      setVaccines([]);
      setFilteredVaccines([]);
    } finally {
      setLoading(false);
    }
  };

const handleSearch = (searchTerm) => {
    const filtered = vaccines.filter(vaccine => 
      vaccine.commercial_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vaccine.generic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vaccine.lot_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVaccines(filtered);
  };

  const handleSort = (field) => {
    const direction = sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(direction);

    const sorted = [...filteredVaccines].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];

if (field === "expiration_date" || field === "received_date") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (direction === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredVaccines(sorted);
  };

  const handleAdministrationChange = (vaccineId, value) => {
    setAdministrationValues(prev => ({
      ...prev,
      [vaccineId]: parseInt(value) || 0
    }));
  };

const handleRecordAdministration = async (vaccine) => {
    const dosesToAdminister = administrationValues[vaccine.Id] || 0;
    
    if (dosesToAdminister <= 0) {
      toast.error("Please enter a valid number of doses");
      return;
    }

    if (dosesToAdminister > vaccine.quantity_on_hand) {
      toast.error("Cannot administer more doses than available");
      return;
    }

    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const newAdministeredDoses = (vaccine.administered_doses || 0) + dosesToAdminister;
      const newQuantityOnHand = Math.max(0, vaccine.quantity_on_hand - dosesToAdminister);
      
      const params = {
        records: [{
          Id: vaccine.Id,
          administered_doses: newAdministeredDoses,
          quantity_on_hand: newQuantityOnHand
        }]
      };
      
      const response = await apperClient.updateRecord("vaccine", params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return;
      }
      
      toast.success(`Recorded ${dosesToAdminister} doses for ${vaccine.commercial_name}`);
      setAdministrationValues(prev => ({
        ...prev,
        [vaccine.Id]: 0
      }));
      loadVaccines();
    } catch (err) {
      if (err?.response?.data?.message) {
        console.error("Error recording administration:", err?.response?.data?.message);
      } else {
        console.error(err.message);
      }
      toast.error("Failed to record administration");
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return "ArrowUpDown";
    return sortDirection === "asc" ? "ArrowUp" : "ArrowDown";
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-secondary-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-8 gap-4">
                {[...Array(8)].map((_, j) => (
                  <div key={j} className="h-4 bg-secondary-200 rounded"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <ApperIcon name="AlertCircle" className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-secondary-900 mb-2">Error Loading Vaccines</h3>
        <p className="text-secondary-600 mb-4">{error}</p>
        <Button onClick={loadVaccines}>
          <ApperIcon name="RefreshCw" className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </Card>
    );
  }

  if (filteredVaccines.length === 0) {
    return (
      <Card className="p-8 text-center">
        <ApperIcon name="Package" className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-secondary-900 mb-2">No Vaccines Found</h3>
        <p className="text-secondary-600 mb-4">
          There are no vaccines in your inventory matching the current criteria.
        </p>
        <Button onClick={loadVaccines}>
          <ApperIcon name="RefreshCw" className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-6 border-b border-secondary-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-medium text-secondary-900">
            Vaccine Inventory ({filteredVaccines.length} items)
          </h3>
          <div className="w-full sm:w-80">
            <SearchBar onSearch={handleSearch} placeholder="Search vaccines..." />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-secondary-200">
          <thead className="bg-secondary-50">
            <tr>
{[
                { key: "commercial_name", label: "Commercial Name" },
                { key: "generic_name", label: "Generic Name" },
                { key: "lot_number", label: "Lot Number" },
                { key: "expiration_date", label: "Expiration" },
                { key: "quantity_on_hand", label: "On Hand" },
                { key: "administered_doses", label: "Administered" }
              ].map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider cursor-pointer hover:bg-secondary-100"
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    <ApperIcon 
                      name={getSortIcon(column.key)} 
                      className="h-3 w-3 text-secondary-400" 
                    />
                  </div>
                </th>
              ))}
              {showAdministration && (
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Record Doses
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-200">
            {filteredVaccines.map((vaccine) => (
              <tr key={vaccine.Id} className="hover:bg-secondary-50">
<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                  {vaccine.commercial_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                  {vaccine.generic_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                  {vaccine.lot_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <ExpirationBadge expirationDate={vaccine.expiration_date} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                  <span className={`font-medium ${vaccine.quantity_on_hand <= 5 ? "text-red-600" : ""}`}>
                    {vaccine.quantity_on_hand}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                  {vaccine.administered_doses || 0}
                </td>
                {showAdministration && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        min="0"
max={vaccine.quantity_on_hand}
                        value={administrationValues[vaccine.Id] || ""}
                        onChange={(e) => handleAdministrationChange(vaccine.Id, e.target.value)}
                        className="w-20"
                        placeholder="0"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleRecordAdministration(vaccine)}
                        disabled={!administrationValues[vaccine.Id] || administrationValues[vaccine.Id] <= 0}
                      >
                        Record
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default VaccineTable;