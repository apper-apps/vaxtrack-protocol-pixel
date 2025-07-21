import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { vaccineService } from "@/services/api/vaccineService";
import { vaccineLossService } from "@/services/api/vaccineLossService";

const VaccineLoss = () => {
  const [vaccines, setVaccines] = useState([]);
  const [lossReports, setLossReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    vaccineId: "",
    lotNumber: "",
    quantity: "",
    reason: "",
    details: "",
    trainingCompleted: false
  });
  const [errors, setErrors] = useState({});

  const lossReasons = [
    "Expired",
    "Temperature Excursion",
    "Broken Vial",
    "Contamination",
    "Power Outage",
    "Equipment Failure",
    "Human Error",
    "Other"
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [vaccineData, lossData] = await Promise.all([
        vaccineService.getAll(),
        vaccineLossService.getAll()
      ]);
      setVaccines(vaccineData.filter(v => v.quantityOnHand > 0));
      setLossReports(lossData);
    } catch (err) {
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Auto-fill lot number when vaccine is selected
    if (name === "vaccineId" && value) {
      const selectedVaccine = vaccines.find(v => v.Id === parseInt(value));
      if (selectedVaccine) {
        setFormData(prev => ({
          ...prev,
          lotNumber: selectedVaccine.lotNumber
        }));
      }
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.vaccineId) {
      newErrors.vaccineId = "Please select a vaccine";
    }
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }
    if (!formData.reason) {
      newErrors.reason = "Please select a loss reason";
    }
    if (!formData.details.trim()) {
      newErrors.details = "Please provide details about the loss";
    }
    if (!formData.trainingCompleted) {
      newErrors.trainingCompleted = "Training completion confirmation is required";
    }

    // Validate quantity doesn't exceed available
    if (formData.vaccineId && formData.quantity) {
      const selectedVaccine = vaccines.find(v => v.Id === parseInt(formData.vaccineId));
      if (selectedVaccine && parseInt(formData.quantity) > selectedVaccine.quantityOnHand) {
        newErrors.quantity = `Cannot exceed available quantity (${selectedVaccine.quantityOnHand})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please correct the errors in the form");
      return;
    }

    setSubmitting(true);

    try {
      // Create loss report
      const lossData = {
        vaccineId: formData.vaccineId,
        lotNumber: formData.lotNumber,
        quantity: parseInt(formData.quantity),
        reason: formData.reason,
        details: formData.details.trim(),
        trainingCompleted: formData.trainingCompleted
      };

      await vaccineLossService.create(lossData);

      // Update vaccine quantity
      const selectedVaccine = vaccines.find(v => v.Id === parseInt(formData.vaccineId));
      const newQuantity = selectedVaccine.quantityOnHand - parseInt(formData.quantity);
      
      await vaccineService.update(selectedVaccine.Id, {
        quantityOnHand: Math.max(0, newQuantity)
      });

      toast.success(`Loss report submitted for ${formData.quantity} doses`);
      
      // Reset form
      setFormData({
        vaccineId: "",
        lotNumber: "",
        quantity: "",
        reason: "",
        details: "",
        trainingCompleted: false
      });
      
      // Reload data
      loadData();
      
    } catch (err) {
      toast.error("Failed to submit loss report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadData} type="data" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Vaccine Loss Reporting</h1>
          <p className="text-secondary-600 mt-1">
            Report vaccine wastage, expiration, or other losses
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loss Report Form */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-secondary-900 mb-4 flex items-center">
            <ApperIcon name="AlertTriangle" className="h-5 w-5 mr-2 text-red-600" />
            Report Vaccine Loss
          </h3>

          {vaccines.length === 0 ? (
            <Empty
              type="vaccines"
              title="No Vaccines Available"
              description="There are no vaccines in inventory to report losses for."
            />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                label="Select Vaccine"
                required
                name="vaccineId"
                value={formData.vaccineId}
                onChange={handleChange}
                error={errors.vaccineId}
              >
                <select
                  name="vaccineId"
                  value={formData.vaccineId}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-secondary-200 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select vaccine...</option>
                  {vaccines.map(vaccine => (
                    <option key={vaccine.Id} value={vaccine.Id}>
                      {vaccine.commercialName} ({vaccine.genericName}) - {vaccine.quantityOnHand} available
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Lot Number"
                name="lotNumber"
                value={formData.lotNumber}
                readOnly
                className="bg-secondary-50"
                placeholder="Auto-filled when vaccine selected"
              />

              <FormField
                label="Quantity Lost"
                required
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                error={errors.quantity}
                placeholder="Number of doses"
                min="1"
                max={formData.vaccineId ? vaccines.find(v => v.Id === parseInt(formData.vaccineId))?.quantityOnHand : ""}
              />

              <FormField
                label="Loss Reason"
                required
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                error={errors.reason}
              >
                <select
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-secondary-200 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select reason...</option>
                  {lossReasons.map(reason => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Details"
                required
                name="details"
                value={formData.details}
                onChange={handleChange}
                error={errors.details}
              >
                <textarea
                  name="details"
                  rows={3}
                  value={formData.details}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-secondary-200 rounded-md shadow-sm text-sm placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Provide detailed explanation of the loss..."
                />
              </FormField>

              <div className="border-t border-secondary-200 pt-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      name="trainingCompleted"
                      checked={formData.trainingCompleted}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                    />
                  </div>
                  <div className="ml-3">
                    <label className="text-sm font-medium text-secondary-700">
                      Training Completion Confirmation <span className="text-red-500">*</span>
                    </label>
                    <p className="text-sm text-secondary-600">
                      I confirm that I have completed the required training for loss prevention and understand the procedures for minimizing vaccine waste.
                    </p>
                    {errors.trainingCompleted && (
                      <p className="text-sm text-red-600 mt-1">{errors.trainingCompleted}</p>
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                loading={submitting}
                disabled={submitting}
                variant="danger"
                className="w-full"
              >
                {submitting ? (
                  <>
                    <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <ApperIcon name="AlertTriangle" className="h-4 w-4 mr-2" />
                    Submit Loss Report
                  </>
                )}
              </Button>
            </form>
          )}
        </Card>

        {/* Loss History */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-secondary-900 mb-4 flex items-center">
            <ApperIcon name="FileText" className="h-5 w-5 mr-2 text-secondary-600" />
            Loss History
          </h3>

          {lossReports.length === 0 ? (
            <Empty
              type="loss"
              title="No Loss Reports"
              description="No vaccine losses have been reported yet. This is good news!"
            />
          ) : (
            <div className="space-y-4">
              {lossReports.slice(0, 5).map((report) => {
                const vaccine = vaccines.find(v => v.Id === parseInt(report.vaccineId));
                return (
                  <div key={report.Id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-secondary-900">
                          {vaccine?.commercialName || "Unknown Vaccine"}
                        </p>
                        <p className="text-sm text-secondary-600">
                          Lot: {report.lotNumber} • {report.quantity} doses lost
                        </p>
                        <p className="text-sm text-red-600 mt-1">
                          Reason: {report.reason}
                        </p>
                        {report.details && (
                          <p className="text-sm text-secondary-600 mt-2">
                            {report.details}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-secondary-500">
                          {new Date(report.reportDate).toLocaleDateString()}
                        </p>
                        {report.trainingCompleted && (
                          <ApperIcon name="CheckCircle" className="h-4 w-4 text-green-500 mt-1" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {lossReports.length > 5 && (
                <p className="text-sm text-secondary-600 text-center">
                  Showing 5 most recent reports ({lossReports.length} total)
                </p>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default VaccineLoss;