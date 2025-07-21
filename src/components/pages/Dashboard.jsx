import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { differenceInDays } from "date-fns";
import MetricCard from "@/components/molecules/MetricCard";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import { vaccineService } from "@/services/api/vaccineService";

const Dashboard = () => {
  const navigate = useNavigate();
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await vaccineService.getAll();
      setVaccines(data);
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading type="dashboard" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadDashboardData} type="data" />;
  }

  // Calculate metrics
  const totalDoses = vaccines.reduce((sum, vaccine) => sum + vaccine.quantityOnHand, 0);
  const administeredDoses = vaccines.reduce((sum, vaccine) => sum + (vaccine.administeredDoses || 0), 0);
  
  const expiringVaccines = vaccines.filter(vaccine => {
    const daysUntilExpiry = differenceInDays(new Date(vaccine.expirationDate), new Date());
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0 && vaccine.quantityOnHand > 0;
  });
  
  const expiredVaccines = vaccines.filter(vaccine => {
    const daysUntilExpiry = differenceInDays(new Date(vaccine.expirationDate), new Date());
    return daysUntilExpiry < 0 && vaccine.quantityOnHand > 0;
  });

  const lowStockVaccines = vaccines.filter(vaccine => 
    vaccine.quantityOnHand <= 5 && vaccine.quantityOnHand > 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
          <p className="text-secondary-600 mt-1">
            Overview of your vaccine inventory and administration status
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Button onClick={() => navigate("/receive-vaccines")}>
            <ApperIcon name="Truck" className="h-4 w-4 mr-2" />
            Receive Vaccines
          </Button>
          <Button 
            variant="accent" 
            onClick={() => navigate("/record-administration")}
          >
            <ApperIcon name="Syringe" className="h-4 w-4 mr-2" />
            Record Administration
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Doses Available"
          value={totalDoses.toLocaleString()}
          icon="Package"
          color="primary"
          description="Current inventory count"
        />
        <MetricCard
          title="Administered Doses"
          value={administeredDoses.toLocaleString()}
          icon="Syringe"
          color="accent"
          description="Total doses given"
        />
        <MetricCard
          title="Expiring Soon"
          value={expiringVaccines.reduce((sum, v) => sum + v.quantityOnHand, 0)}
          icon="Clock"
          color="warning"
          description="Within 30 days"
        />
        <MetricCard
          title="Expired Doses"
          value={expiredVaccines.reduce((sum, v) => sum + v.quantityOnHand, 0)}
          icon="AlertTriangle"
          color="danger"
          description="Requires attention"
        />
      </div>

      {/* Alerts and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiring Vaccines Alert */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-secondary-900">
              Expiring Vaccines
            </h3>
            <Badge variant={expiringVaccines.length > 0 ? "warning" : "success"}>
              {expiringVaccines.length} items
            </Badge>
          </div>
          
          {expiringVaccines.length > 0 ? (
            <div className="space-y-3">
              {expiringVaccines.slice(0, 3).map((vaccine) => {
                const daysLeft = differenceInDays(new Date(vaccine.expirationDate), new Date());
                return (
                  <div key={vaccine.Id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div>
                      <p className="font-medium text-secondary-900">
                        {vaccine.commercialName}
                      </p>
                      <p className="text-sm text-secondary-600">
                        Lot: {vaccine.lotNumber} • {vaccine.quantityOnHand} doses
                      </p>
                    </div>
                    <Badge variant="warning">
                      {daysLeft}d left
                    </Badge>
                  </div>
                );
              })}
              {expiringVaccines.length > 3 && (
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => navigate("/inventory")}
                >
                  View all expiring vaccines
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <ApperIcon name="CheckCircle" className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-secondary-600">No vaccines expiring in the next 30 days</p>
            </div>
          )}
        </Card>

        {/* Low Stock Alert */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-secondary-900">
              Low Stock Alert
            </h3>
            <Badge variant={lowStockVaccines.length > 0 ? "danger" : "success"}>
              {lowStockVaccines.length} items
            </Badge>
          </div>
          
          {lowStockVaccines.length > 0 ? (
            <div className="space-y-3">
              {lowStockVaccines.slice(0, 3).map((vaccine) => (
                <div key={vaccine.Id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <p className="font-medium text-secondary-900">
                      {vaccine.commercialName}
                    </p>
                    <p className="text-sm text-secondary-600">
                      {vaccine.genericName} • Lot: {vaccine.lotNumber}
                    </p>
                  </div>
                  <Badge variant="danger">
                    {vaccine.quantityOnHand} left
                  </Badge>
                </div>
              ))}
              {lowStockVaccines.length > 3 && (
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => navigate("/inventory")}
                >
                  View all low stock items
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <ApperIcon name="CheckCircle" className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-secondary-600">All vaccines are well stocked</p>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-secondary-900 mb-4">
          Inventory Summary
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-primary-50 rounded-lg">
            <p className="text-2xl font-bold text-primary-600">
              {vaccines.length}
            </p>
            <p className="text-sm text-secondary-600">Vaccine Types</p>
          </div>
          <div className="text-center p-4 bg-accent-50 rounded-lg">
            <p className="text-2xl font-bold text-accent-600">
              {vaccines.filter(v => v.quantityOnHand > 0).length}
            </p>
            <p className="text-sm text-secondary-600">In Stock</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">
              {expiringVaccines.length}
            </p>
            <p className="text-sm text-secondary-600">Expiring Soon</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">
              {lowStockVaccines.length}
            </p>
            <p className="text-sm text-secondary-600">Low Stock</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;