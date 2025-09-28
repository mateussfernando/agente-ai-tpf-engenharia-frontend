"use client";
import React from "react";
import Image from "next/image";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-500 to-indigo-800 flex items-center justify-center">
      <div className="w-[480px] min-h-[300px] h-auto bg-white rounded-lg shadow-lg p-6 flex flex-col">
        {/* Logo */}
        <div className="mb-4 flex justify-center">
          <Image
            src="/TPF-AI.png"
            alt="TPF AI Logo"
            width={90}
            height={15}
            className="rounded"
          />
        </div>
        <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
