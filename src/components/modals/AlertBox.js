import React from "react";

const AlertBox = ({ children, type = "success" }) => {
  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-200 text-green-800";
      case "error":
        return "bg-red-200 text-red-800";
      case "warning":
        return "bg-yellow-200 text-yellow-800";
      case "info":
        return "bg-blue-200 text-blue-800";
      default:
        return "bg-green-200 text-green-800";
    }
  };

  return (
    <div
      className={`w-full p-3 rounded-lg text-center mb-4 ${getTypeStyles()}`}
    >
      {children}
    </div>
  );
};

export default AlertBox;
