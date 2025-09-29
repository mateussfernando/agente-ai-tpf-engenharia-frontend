"use client";
import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Input = ({
  name,
  placeholder,
  type = "text",
  icon,
  showPasswordToggle = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputType = showPasswordToggle
    ? showPassword
      ? "text"
      : "password"
    : type;

  return (
    <div className="flex flex-col w-full">
      {/* Label */}
      {name && (
        <label htmlFor={name} className="mb-1 text-sm font-medium">
          {name}
        </label>
      )}

      <div className="relative w-full">
        {/* Ícone posicionado dentro do input */}
        {icon && (
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}

        {/* Input */}
        <input
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          className="w-96 h-12 rounded-[5px] border border-black/25 px-10 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300 pr-12"
          {...props}
        />

        {/* Toggle password visibility */}
        {showPasswordToggle && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-3 flex items-center text-black/25 cursor-pointer hover:text-black/50"
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;
