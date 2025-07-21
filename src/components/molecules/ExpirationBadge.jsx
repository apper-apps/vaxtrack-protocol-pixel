import Badge from "@/components/atoms/Badge";
import { format, differenceInDays } from "date-fns";

const ExpirationBadge = ({ expirationDate }) => {
  const expDate = new Date(expirationDate);
  const daysUntilExpiry = differenceInDays(expDate, new Date());
  
  let variant = "success";
  let text = "Good";
  
  if (daysUntilExpiry < 0) {
    variant = "danger";
    text = "Expired";
  } else if (daysUntilExpiry <= 30) {
    variant = "warning";
    text = `${daysUntilExpiry}d left`;
  } else if (daysUntilExpiry <= 90) {
    variant = "warning";
    text = `${Math.floor(daysUntilExpiry / 30)}m left`;
  }

  return (
    <div className="flex flex-col items-center">
      <Badge variant={variant}>{text}</Badge>
      <span className="text-xs text-secondary-500 mt-1">
        {format(expDate, "MM/dd/yyyy")}
      </span>
    </div>
  );
};

export default ExpirationBadge;