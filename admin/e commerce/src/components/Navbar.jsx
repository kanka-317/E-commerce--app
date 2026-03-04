import React from "react";
import { assets } from "../assets/assets";

const Navbar = ({ setToken }) => {
  return (
    <div className="flex items-center justify-between py-3 px-6 border-b bg-white">
      <img className="w-[120px]" src={assets.logo} alt="logo" />

      <button
        onClick={() => setToken("")}
        className="bg-gray-700 text-white px-5 py-2 rounded-full hover:bg-gray-800 transition"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
