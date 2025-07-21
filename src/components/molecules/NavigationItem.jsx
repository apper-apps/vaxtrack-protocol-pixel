import { NavLink } from "react-router-dom";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const NavigationItem = ({ to, icon, children, ...props }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
          isActive
            ? "bg-primary-50 text-primary-700 border-r-2 border-primary-500"
            : "text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50"
        )
      }
      {...props}
    >
      <ApperIcon name={icon} className="mr-3 h-5 w-5" />
      {children}
    </NavLink>
  );
};

export default NavigationItem;