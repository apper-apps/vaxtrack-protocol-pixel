import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";
import { vaccineService } from "@/services/api/vaccineService";
import { qualityCheckService } from "@/services/api/qualityCheckService";

const ReceiveVaccines = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    commercialName: "",
    genericName: "",
    lotNumber: "",
    quantity: "",
    expirationDate: "",
    receivedDate: new Date().toISOString().split("T")[0],
    quantityOnHand: "",
    dosesPassed: "",
    dosesFailed: "",
    discrepancyReason: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-calculate quantities
    if (name === "quantity") {
      const qty = parseInt(value) || 0;
      setFormData(prev => ({
        ...prev,
        quantityOnHand: qty.toString(),
        dosesPassed: qty.toString(),
        dosesFailed: "0"
      }));
    }

    if (name === "dosesPassed" || name === "dosesFailed") {
      const passed = parseInt(name === "dosesPassed" ? value : formData.dosesPassed) || 0;
      const failed = parseInt(name === "dosesFailed" ? value : formData.dosesFailed) || 0;
      setFormData(prev => ({
        ...prev,
        quantityOnHand: (passed).toString()
      }));
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

    if (!formData.commercialName.trim()) {
      newErrors.commercialName = "Commercial name is required";
    }
    if (!formData.genericName.trim()) {
      newErrors.genericName = "Generic name is required";
    }
    if (!formData.lotNumber.trim()) {
      newErrors.lotNumber = "Lot number is required";
    }
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }
    if (!formData.expirationDate) {
      newErrors.expirationDate = "Expiration date is required";
    }
    if (!formData.receivedDate) {
      newErrors.receivedDate = "Received date is required";
    }

    // Validate expiration date is in the future
    if (formData.expirationDate) {
      const expDate = new Date(formData.expirationDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (expDate <= today) {
        newErrors.expirationDate = "Expiration date must be in the future";
      }
    }

    // Validate quality check numbers
    const quantity = parseInt(formData.quantity) || 0;
    const passed = parseInt(formData.dosesPassed) || 0;
    const failed = parseInt(formData.dosesFailed) || 0;

    if (passed + failed !== quantity) {
      newErrors.dosesPassed = "Passed + Failed doses must equal total quantity";
    }

    if (failed > 0 && !formData.discrepancyReason.trim()) {
      newErrors.discrepancyReason = "Discrepancy reason is required when doses failed";
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

    setLoading(true);

    try {
      // Create vaccine record
      const vaccineData = {
        commercialName: formData.commercialName.trim(),
        genericName: formData.genericName.trim(),
        lotNumber: formData.lotNumber.trim(),
        quantity: parseInt(formData.quantity),
        expirationDate: formData.expirationDate,
        receivedDate: formData.receivedDate,
        quantityOnHand: parseInt(formData.quantityOnHand),
        administeredDoses: 0
      };

      const createdVaccine = await vaccineService.create(vaccineData);

      // Create quality check record
      const qualityData = {
        vaccineId: createdVaccine.Id.toString(),
        dosesPassed: parseInt(formData.dosesPassed),
        dosesFailed: parseInt(formData.dosesFailed),
        discrepancyReason: formData.discrepancyReason.trim()
      };

      await qualityCheckService.create(qualityData);

      toast.success(`Successfully received ${formData.quantity} doses of ${formData.commercialName}`);
      
      // Reset form
      setFormData({
        commercialName: "",
        genericName: "",
        lotNumber: "",
        quantity: "",
        expirationDate: "",
        receivedDate: new Date().toISOString().split("T")[0],
        quantityOnHand: "",
        dosesPassed: "",
        dosesFailed: "",
        discrepancyReason: ""
      });
      
    } catch (err) {
      toast.error("Failed to receive vaccines. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Receive Vaccines</h1>
          <p className="text-secondary-600 mt-1">
            Record new vaccine shipments and perform quality checks
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => navigate("/inventory")}
        >
          <ApperIcon name="ArrowLeft" className="h-4 w-4 mr-2" />
          Back to Inventory
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Vaccine Information */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-secondary-900 mb-4 flex items-center">
            <ApperIcon name="Package" className="h-5 w-5 mr-2 text-primary-600" />
            Vaccine Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Commercial Name"
              required
              name="commercialName"
              value={formData.commercialName}
              onChange={handleChange}
              error={errors.commercialName}
              placeholder="e.g., Daptacel SDV"
            />
            
            <FormField
              label="Generic Name"
              required
              name="genericName"
              value={formData.genericName}
              onChange={handleChange}
              error={errors.genericName}
              placeholder="e.g., DTaP"
            />
            
            <FormField
              label="Lot Number"
              required
              name="lotNumber"
              value={formData.lotNumber}
              onChange={handleChange}
              error={errors.lotNumber}
              placeholder="e.g., 3CA03C3"
            />
            
            <FormField
              label="Quantity Sent"
              required
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              error={errors.quantity}
              placeholder="Number of doses"
              min="1"
            />
            
            <FormField
              label="Expiration Date"
              required
              type="date"
              name="expirationDate"
              value={formData.expirationDate}
              onChange={handleChange}
              error={errors.expirationDate}
            />
            
            <FormField
              label="Received Date"
              required
              type="date"
              name="receivedDate"
              value={formData.receivedDate}
              onChange={handleChange}
              error={errors.receivedDate}
            />
          </div>
        </Card>

        {/* Quality Check */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-secondary-900 mb-4 flex items-center">
            <ApperIcon name="CheckCircle" className="h-5 w-5 mr-2 text-accent-600" />
            Quality Inspection
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              label="Doses Passing Inspection"
              required
              type="number"
              name="dosesPassed"
              value={formData.dosesPassed}
              onChange={handleChange}
              error={errors.dosesPassed}
              placeholder="Number passed"
              min="0"
            />
            
            <FormField
              label="Doses Failed Inspection"
              required
              type="number"
              name="dosesFailed"
              value={formData.dosesFailed}
              onChange={handleChange}
              error={errors.dosesFailed}
              placeholder="Number failed"
              min="0"
            />
            
            <FormField
              label="Quantity on Hand"
              type="number"
              name="quantityOnHand"
              value={formData.quantityOnHand}
              readOnly
              className="bg-secondary-50"
              placeholder="Auto-calculated"
            />
          </div>

          {parseInt(formData.dosesFailed) > 0 && (
            <div className="mt-6">
              <FormField
                label="Discrepancy Reason"
                required
                name="discrepancyReason"
                value={formData.discrepancyReason}
                onChange={handleChange}
                error={errors.discrepancyReason}
                placeholder="Explain why doses failed inspection..."
              >
                <textarea
                  name="discrepancyReason"
                  rows={3}
                  value={formData.discrepancyReason}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-secondary-200 rounded-md shadow-sm text-sm placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Explain why doses failed inspection..."
                />
              </FormField>
            </div>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/inventory")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
          >
            {loading ? (
              <>
                <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                Receiving...
              </>
            ) : (
              <>
                <ApperIcon name="Check" className="h-4 w-4 mr-2" />
                Receive Vaccines
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReceiveVaccines;