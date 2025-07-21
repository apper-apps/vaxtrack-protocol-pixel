import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { useNavigate } from "react-router-dom";

const Empty = ({ 
  type = "general",
  title,
  description,
  actionText,
  actionPath,
  onAction
}) => {
  const navigate = useNavigate();

  const getEmptyConfig = () => {
    switch (type) {
      case "vaccines":
        return {
          icon: "Package",
          title: "No Vaccines Found",
          description: "Your vaccine inventory is empty. Start by receiving new vaccine shipments.",
          actionText: "Receive Vaccines",
          actionPath: "/receive-vaccines"
        };
      case "reports":
        return {
          icon: "FileText",
          title: "No Reports Available",
          description: "Generate your first inventory report to track vaccine usage and stock levels.",
          actionText: "Generate Report",
          actionPath: "/reports"
        };
      case "loss":
        return {
          icon: "AlertTriangle",
          title: "No Vaccine Loss Recorded",
          description: "This is good news! No vaccine wastage or losses have been reported.",
          actionText: "Report Loss",
          actionPath: "/vaccine-loss"
        };
      default:
        return {
          icon: "Search",
          title: title || "No Data Found",
          description: description || "There are no items to display at the moment.",
          actionText: actionText,
          actionPath: actionPath
        };
    }
  };

  const config = getEmptyConfig();

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (config.actionPath) {
      navigate(config.actionPath);
    }
  };

  return (
    <Card className="p-8 text-center bg-gradient-to-br from-white to-secondary-50">
      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-full flex items-center justify-center">
        <ApperIcon name={config.icon} className="h-10 w-10 text-primary-600" />
      </div>
      <h3 className="text-xl font-semibold text-secondary-900 mb-3">
        {config.title}
      </h3>
      <p className="text-secondary-600 mb-8 max-w-md mx-auto leading-relaxed">
        {config.description}
      </p>
      {(config.actionText || actionText) && (
        <Button 
          onClick={handleAction}
          variant="primary"
          size="lg"
          className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 transform hover:scale-105 transition-all duration-200"
        >
          <ApperIcon name="Plus" className="h-5 w-5 mr-2" />
          {config.actionText}
        </Button>
      )}
    </Card>
  );
};

export default Empty;