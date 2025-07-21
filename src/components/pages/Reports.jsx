import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Inventory from "@/components/pages/Inventory";
import FormField from "@/components/molecules/FormField";
import ExpirationBadge from "@/components/molecules/ExpirationBadge";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
const Reports = () => {
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reportType, setReportType] = useState("current");
  const [generatedReport, setGeneratedReport] = useState(null);
  const [filters, setFilters] = useState({
    startDate: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    genericName: "",
    status: "all"
  });

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
          { field: { Name: "quantity_on_hand" } },
          { field: { Name: "administered_doses" } },
          { field: { Name: "expiration_date" } }
        ]
      };
      
      const response = await apperClient.fetchRecords("vaccine", params);
      
      if (!response.success) {
        console.error(response.message);
        setError(response.message);
        setVaccines([]);
        return;
      }
      
      const data = response.data || [];
      setVaccines(data);
    } catch (err) {
      if (err?.response?.data?.message) {
        console.error("Error loading vaccine data:", err?.response?.data?.message);
      } else {
        console.error(err.message);
      }
      setError("Failed to load vaccine data. Please try again.");
      setVaccines([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

const generateReport = () => {
    let filteredData = [...vaccines];

    // Apply filters
    if (filters.genericName) {
      filteredData = filteredData.filter(vaccine => 
        vaccine.generic_name?.toLowerCase().includes(filters.genericName.toLowerCase())
      );
    }

    if (filters.status !== "all") {
      const now = new Date();
      filteredData = filteredData.filter(vaccine => {
        const expDate = new Date(vaccine.expiration_date);
        const daysUntilExpiry = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
        
        switch (filters.status) {
          case "expiring":
            return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
          case "expired":
            return daysUntilExpiry < 0;
          case "good":
            return daysUntilExpiry > 30;
          case "low-stock":
            return (vaccine.quantity_on_hand || 0) <= 5 && (vaccine.quantity_on_hand || 0) > 0;
          default:
            return true;
        }
      });
    }

    const reportData = {
      type: reportType,
      generatedAt: new Date().toISOString(),
      filters: filters,
      data: filteredData,
      summary: {
        totalDoses: filteredData.reduce((sum, v) => sum + (v.quantity_on_hand || 0), 0),
        totalAdministered: filteredData.reduce((sum, v) => sum + (v.administered_doses || 0), 0),
        expiringCount: filteredData.filter(v => {
          const daysUntilExpiry = Math.ceil((new Date(v.expiration_date) - new Date()) / (1000 * 60 * 60 * 24));
          return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
        }).length,
        expiredCount: filteredData.filter(v => {
          const daysUntilExpiry = Math.ceil((new Date(v.expiration_date) - new Date()) / (1000 * 60 * 60 * 24));
          return daysUntilExpiry < 0;
        }).length,
        lowStockCount: filteredData.filter(v => (v.quantity_on_hand || 0) <= 5 && (v.quantity_on_hand || 0) > 0).length
      }
    };
    setGeneratedReport(reportData);
  };

  const exportReport = () => {
    if (!generatedReport) return;

    const csvContent = [
      ["Commercial Name", "Generic Name", "Lot Number", "Quantity On Hand", "Administered", "Expiration Date", "Status"].join(","),
...generatedReport.data.map(vaccine => {
        const daysUntilExpiry = Math.ceil((new Date(vaccine.expiration_date) - new Date()) / (1000 * 60 * 60 * 24));
        let status = "Good";
        if (daysUntilExpiry < 0) status = "Expired";
        else if (daysUntilExpiry <= 30) status = "Expiring Soon";
        
        return [
          vaccine.commercial_name,
          vaccine.generic_name,
          vaccine.lot_number,
          vaccine.quantity_on_hand,
          vaccine.administered_doses || 0,
          vaccine.expiration_date,
          status
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vaccine-inventory-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const clearReport = () => {
    setGeneratedReport(null);
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadVaccines} type="data" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Reports</h1>
          <p className="text-secondary-600 mt-1">
            Generate and view vaccine inventory reports
          </p>
        </div>
      </div>

      {/* Report Configuration */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-secondary-900 mb-4 flex items-center">
          <ApperIcon name="Settings" className="h-5 w-5 mr-2 text-primary-600" />
          Report Configuration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField
            label="Report Type"
            name="reportType"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <select
              name="reportType"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="block w-full px-3 py-2 border border-secondary-200 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="current">Current Inventory</option>
              <option value="monthly">Monthly Summary</option>
            </select>
          </FormField>

          <FormField
            label="Generic Name Filter"
            name="genericName"
            value={filters.genericName}
            onChange={handleFilterChange}
            placeholder="Filter by vaccine type"
          />

          <FormField
            label="Status Filter"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-secondary-200 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Vaccines</option>
              <option value="good">Good Condition</option>
              <option value="expiring">Expiring Soon</option>
              <option value="expired">Expired</option>
              <option value="low-stock">Low Stock</option>
            </select>
          </FormField>

          <div className="flex items-end">
            <Button
              onClick={generateReport}
              className="w-full"
            >
              <ApperIcon name="FileText" className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>
      </Card>

      {/* Generated Report */}
      {generatedReport ? (
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-secondary-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium text-secondary-900">
                  {reportType === "current" ? "Current Inventory Report" : "Monthly Summary Report"}
                </h3>
                <p className="text-sm text-secondary-600">
                  Generated on {format(new Date(generatedReport.generatedAt), "MMM dd, yyyy 'at' h:mm a")}
                </p>
              </div>
              <div className="flex space-x-3">
                <Button variant="secondary" onClick={exportReport}>
                  <ApperIcon name="Download" className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="ghost" onClick={clearReport}>
                  <ApperIcon name="X" className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="p-6 bg-secondary-50 border-b border-secondary-200">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-secondary-900">
{generatedReport.summary.totalVaccines || generatedReport.data.length}
                </p>
                <p className="text-sm text-secondary-600">Total Vaccines</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-secondary-900">
                  {generatedReport.summary.totalDoses.toLocaleString()}
                </p>
                <p className="text-sm text-secondary-600">Total Doses</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent-600">
                  {generatedReport.summary.totalAdministered.toLocaleString()}
                </p>
                <p className="text-sm text-secondary-600">Administered</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {generatedReport.summary.expiringCount}
                </p>
                <p className="text-sm text-secondary-600">Expiring</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {generatedReport.summary.expiredCount}
                </p>
                <p className="text-sm text-secondary-600">Expired</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {generatedReport.summary.lowStockCount}
                </p>
                <p className="text-sm text-secondary-600">Low Stock</p>
              </div>
            </div>
          </div>

          {/* Report Data */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Commercial Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Generic Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Lot Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    On Hand
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Administered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Expiration
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {generatedReport.data.map((vaccine) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                      <span className={`font-medium ${(vaccine.quantity_on_hand || 0) <= 5 ? "text-red-600" : ""}`}>
                        {vaccine.quantity_on_hand}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                      {vaccine.administered_doses || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ExpirationBadge expirationDate={vaccine.expiration_date} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Empty
          type="reports"
          title="No Report Generated"
          description="Configure your report settings above and click 'Generate Report' to view inventory data."
          actionText="Generate Report"
          onAction={generateReport}
        />
      )}
    </div>
  );
};

export default Reports;