import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const MetricCard = ({ 
  title, 
  value, 
  icon, 
  color = "primary", 
  description,
  trend 
}) => {
  const colorClasses = {
    primary: "text-primary-600 bg-primary-50",
    accent: "text-accent-600 bg-accent-50",
    warning: "text-yellow-600 bg-yellow-50",
    danger: "text-red-600 bg-red-50"
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-secondary-600 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-secondary-900 mb-2">
            {value}
          </p>
          {description && (
            <p className="text-sm text-secondary-500">
              {description}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <ApperIcon name={icon} size={24} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <ApperIcon 
            name={trend.direction === "up" ? "TrendingUp" : "TrendingDown"} 
            size={16}
            className={trend.direction === "up" ? "text-green-500" : "text-red-500"}
          />
          <span className={`ml-1 ${trend.direction === "up" ? "text-green-600" : "text-red-600"}`}>
            {trend.value}
          </span>
          <span className="text-secondary-600 ml-1">vs last month</span>
        </div>
      )}
    </Card>
  );
};

export default MetricCard;