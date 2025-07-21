import { motion } from "framer-motion";
import NavigationItem from "@/components/molecules/NavigationItem";
import ApperIcon from "@/components/ApperIcon";

const Sidebar = ({ isOpen, onClose }) => {
  const navigationItems = [
    { to: "/", icon: "LayoutDashboard", label: "Dashboard" },
    { to: "/inventory", icon: "Package", label: "Inventory" },
    { to: "/receive-vaccines", icon: "Truck", label: "Receive Vaccines" },
    { to: "/record-administration", icon: "Syringe", label: "Record Administration" },
    { to: "/reports", icon: "FileText", label: "Reports" },
    { to: "/vaccine-loss", icon: "AlertTriangle", label: "Vaccine Loss" }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-white border-r border-secondary-200 h-full">
        <div className="flex flex-col h-full">
          <div className="flex items-center h-16 px-6 border-b border-secondary-200">
            <ApperIcon name="Shield" className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <h1 className="text-lg font-bold text-secondary-900">VaxTrack Pro</h1>
              <p className="text-xs text-secondary-600">Healthcare Inventory</p>
            </div>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigationItems.map((item) => (
              <NavigationItem
                key={item.to}
                to={item.to}
                icon={item.icon}
              >
                {item.label}
              </NavigationItem>
            ))}
          </nav>
          <div className="p-4 border-t border-secondary-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <ApperIcon name="User" className="h-4 w-4 text-primary-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-secondary-900">Healthcare Admin</p>
                <p className="text-xs text-secondary-500">administrator@clinic.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div className={`lg:hidden fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: isOpen ? 0 : "-100%" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl"
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between h-16 px-6 border-b border-secondary-200">
              <div className="flex items-center">
                <ApperIcon name="Shield" className="h-8 w-8 text-primary-600 mr-3" />
                <div>
                  <h1 className="text-lg font-bold text-secondary-900">VaxTrack Pro</h1>
                  <p className="text-xs text-secondary-600">Healthcare Inventory</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-md hover:bg-secondary-100"
              >
                <ApperIcon name="X" className="h-5 w-5 text-secondary-600" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1">
              {navigationItems.map((item) => (
                <NavigationItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  onClick={onClose}
                >
                  {item.label}
                </NavigationItem>
              ))}
            </nav>
            <div className="p-4 border-t border-secondary-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <ApperIcon name="User" className="h-4 w-4 text-primary-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-secondary-900">Healthcare Admin</p>
                  <p className="text-xs text-secondary-500">administrator@clinic.com</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Sidebar;