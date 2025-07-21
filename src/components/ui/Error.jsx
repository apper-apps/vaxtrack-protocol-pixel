import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Error = ({ 
  message = "Something went wrong", 
  onRetry, 
  type = "general" 
}) => {
  const getErrorConfig = () => {
    switch (type) {
      case "network":
        return {
          icon: "Wifi",
          title: "Connection Error",
          description: "Unable to connect to the server. Please check your internet connection."
        };
      case "data":
        return {
          icon: "Database",
          title: "Data Error",
          description: "There was a problem loading the data. Please try again."
        };
      default:
        return {
          icon: "AlertCircle",
          title: "Error",
          description: message
        };
    }
  };

  const config = getErrorConfig();

  return (
    <Card className="p-8 text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
        <ApperIcon name={config.icon} className="h-8 w-8 text-red-600" />
      </div>
      <h3 className="text-lg font-medium text-secondary-900 mb-2">
        {config.title}
      </h3>
      <p className="text-secondary-600 mb-6 max-w-md mx-auto">
        {config.description}
      </p>
      <div className="flex justify-center space-x-3">
        {onRetry && (
          <Button onClick={onRetry} variant="primary">
            <ApperIcon name="RefreshCw" className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
        <Button 
          variant="secondary" 
          onClick={() => window.location.reload()}
        >
          <ApperIcon name="RotateCcw" className="h-4 w-4 mr-2" />
          Reload Page
        </Button>
      </div>
    </Card>
  );
};

export default Error;