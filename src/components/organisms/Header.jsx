import { useState, useContext } from "react";
import { useSelector } from 'react-redux';
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { AuthContext } from '../../App';

const Header = ({ onMenuToggle }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user } = useSelector((state) => state.user);
  const { logout } = useContext(AuthContext);

  // Update time every minute
  useState(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-white border-b border-secondary-200 h-16">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden mr-2"
          >
            <ApperIcon name="Menu" className="h-5 w-5" />
          </Button>
          <div className="hidden sm:block">
            <h2 className="text-lg font-semibold text-secondary-900">
              Vaccine Inventory Management
            </h2>
            <p className="text-sm text-secondary-600">
              {currentTime.toLocaleDateString("en-US", { 
                weekday: "long", 
                year: "numeric", 
                month: "long", 
                day: "numeric" 
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 text-sm text-secondary-600">
            <ApperIcon name="Clock" className="h-4 w-4" />
            <span>
              {currentTime.toLocaleTimeString("en-US", { 
                hour: "2-digit", 
                minute: "2-digit" 
              })}
            </span>
          </div>
          
<div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-secondary-600">System Online</span>
            </div>
            
            {user && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-secondary-600">
                  {user.firstName} {user.lastName}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-secondary-600 hover:text-secondary-900"
                >
                  <ApperIcon name="LogOut" className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;