"use client";
import React from "react";

const AuthButton = ({ children, onClick, ...props }) => {
  return (
    <button
      onClick={onClick}
      className="m-5 w-96 h-12 bg-blue-900 rounded-[5px] text-white text-base font-medium font-['Nunito'] flex items-center justify-center cursor-pointer hover:bg-blue-800 transition-colors"
      {...props}
    >
      {children}
    </button>
  );
};

export default AuthButton;
