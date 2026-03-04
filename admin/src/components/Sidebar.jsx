import React from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";

const navItems = [
  {
    to: "/add",
    label: "Add Items",
    icon: assets.add_icon,
  },
  {
    to: "/list",
    label: "List Items",
    icon: assets.parcel_icon,
  },
  {
    to: "/orders",
    label: "Orders",
    icon: assets.order_icon,
  },
];

const Sidebar = () => {
  return (
    <aside className="w-16 sm:w-56 border-r border-gray-200 bg-white min-h-[calc(100vh-65px)]">
      <div className="flex flex-col gap-2 pt-6">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 border border-r-0 px-3 py-2.5 sm:pl-5 text-sm transition ${
                isActive
                  ? "bg-pink-50 border-pink-300 text-pink-700"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`
            }
          >
            <img src={item.icon} alt={item.label} className="w-5 h-5" />
            <p className="hidden sm:block">{item.label}</p>
          </NavLink>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
