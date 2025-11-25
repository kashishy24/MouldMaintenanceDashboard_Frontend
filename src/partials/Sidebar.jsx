import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";

import {
  MdHome,
  MdBuild,
  MdSpeed,
  MdCheckCircle,
  MdTune,
  MdAvTimer,
  MdEngineering,
} from "react-icons/md";


import SidebarLinkGroup from "./SidebarLinkGroup";
import logo from "../assets/logos/Dalisoft Logo.jpg"

function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  variant = 'default',
}) {
  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef(null);
  const sidebar = useRef(null);

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(storedSidebarExpanded === null ? false : storedSidebarExpanded === "true");

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded);
    if (sidebarExpanded) {
      document.querySelector("body").classList.add("sidebar-expanded");
    } else {
      document.querySelector("body").classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded]);

  return (
    <div className="min-w-fit">
      {/* Sidebar backdrop (mobile only) */}
      <div
        className={`fixed inset-0 bg-gray-900/30 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <div
        id="sidebar"
        ref={sidebar}
        className={`flex lg:flex! flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-[100dvh] overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 lg:w-20 lg:sidebar-expanded:!w-64 2xl:w-64! shrink-0 bg-white dark:bg-gray-800 p-4 transition-all duration-200 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-64"} ${variant === 'v2' ? 'border-r border-gray-200 dark:border-gray-700/60' : 'rounded-r-2xl shadow-xs'}`}
      >
        {/* Sidebar header */}
        <div className="flex justify-between mb-10 pr-3 sm:px-2">
          {/* Close button */}
          <button
            ref={trigger}
            className="lg:hidden text-gray-500 hover:text-gray-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
            </svg>
          </button>
          {/* Logo */}
          <NavLink end to="/home" className="block">
            {sidebarExpanded && (
              <img 
                src={logo}  
                alt="Logo"                    
                className="w-28 h-8"       
              />
            )}
          </NavLink>
        </div>

        {/* Links */}
        <div className="space-y-8">
          {/* Pages group */}
          <div>
            <ul className="mt-3">
                                            {/* Dashboard */}
{/*Home */}                              
              <SidebarLinkGroup activecondition={pathname === "/Home"}>
                  {(handleClick, open) => (
                    <NavLink
                      end
                      to="/Home"
                      className={({ isActive }) =>
                        `block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                          isActive
                            ? "text-violet-500"
                            : "hover:text-gray-900 dark:hover:text-white"
                        }`
                      }
                      onClick={() => {
                        handleClick();
                        setSidebarExpanded(true);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                           <MdHome size={20} />
                          <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                            Home
                          </span>
                        </div>
                      </div>
                    </NavLink>
                  )}
              </SidebarLinkGroup>


              {/* Mould Maintenance History */}                              
              <SidebarLinkGroup activecondition={pathname === "/MouldMaintenanceHistory"}>
                  {(handleClick, open) => (
                    <NavLink
                      end
                      to="/MouldMaintenanceHistory"
                      className={({ isActive }) =>
                        `block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                          isActive
                            ? "text-violet-500"
                            : "hover:text-gray-900 dark:hover:text-white"
                        }`
                      }
                      onClick={() => {
                        handleClick();
                        setSidebarExpanded(true);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <MdBuild size={20} />
                          <span className="
  text-sm font-medium ml-4 
  lg:opacity-0 lg:sidebar-expanded:opacity-100 
  2xl:opacity-100 duration-200
  whitespace-normal break-words
">
  Mould Maintenance History
</span>
                        </div>
                      </div>
                    </NavLink>
                  )}
              </SidebarLinkGroup>

              {/* PM Status  */}
              <SidebarLinkGroup activecondition={pathname.includes("PMStatus")}>

                {(handleClick, open) => (
                    <NavLink
                      end
                      to="/PMStatus"
                      className={({ isActive }) =>
                        `block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                          isActive
                            ? "text-violet-500"
                            : "hover:text-gray-900 dark:hover:text-white"
                        }`
                      }
                      onClick={() => {
                        handleClick();
                        setSidebarExpanded(true);
                      }}
                    >
                      <div className="flex items-center justify-between">
                          <div className="flex items-center">
                           <MdEngineering size={20} />
                            <span
  className="
    text-sm font-medium ml-4 
    lg:opacity-0 lg:sidebar-expanded:opacity-100 
    2xl:opacity-100 duration-200
    whitespace-normal break-words leading-tight block max-w-[150px]
  "
>
  Preventive Maintenance Status
</span>

                          </div>
                        </div>
                    </NavLink>
                )}
               
              </SidebarLinkGroup>

              {/* HC Status */}
              <SidebarLinkGroup activecondition={pathname.includes("HCStatus")}>
                {(handleClick, open) => (
                    <NavLink
                      end
                      to="/HCStatus"
                      className={({ isActive }) =>
                        `block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                          isActive
                            ? "text-violet-500"
                            : "hover:text-gray-900 dark:hover:text-white"
                        }`
                      }
                      onClick={() => {
                        handleClick();
                        setSidebarExpanded(true);
                      }}
                    >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                           <MdCheckCircle size={20} />
                            <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                              Health Check Status 
                            </span>
                          </div>
                        </div>
                    </NavLink>
                )}
                
              </SidebarLinkGroup>

              {/* spare Part   */}
              {/* <SidebarLinkGroup activecondition={pathname.includes("SparePart")}>
                {(handleClick, open) => (
                    <NavLink
                      end
                      to="/SparePart"
                      className={({ isActive }) =>
                        `block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                          isActive
                            ? "text-violet-500"
                            : "hover:text-gray-900 dark:hover:text-white"
                        }`
                      }
                      onClick={() => {
                        handleClick();
                        setSidebarExpanded(true);
                      }}
                    >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                           <MdTune size={20} />
                            <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                              Spare Part 
                            </span>
                          </div>
                        </div>
                    </NavLink>
                )}
                
              </SidebarLinkGroup> */}

              {/* Mould  Summary  */}
              <SidebarLinkGroup activecondition={pathname.includes("MouldSummary")}>
                {(handleClick, open) => (
                    <NavLink
                      end
                      to="/MouldSummary"
                      className={({ isActive }) =>
                        `block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                          isActive
                            ? "text-violet-500"
                            : "hover:text-gray-900 dark:hover:text-white"
                        }`
                      }
                      onClick={() => {
                        handleClick();
                        setSidebarExpanded(true);
                      }}
                    >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                           <MdSpeed size={20} />
                            <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                              Mould Summary
                            </span>
                          </div>
                        </div>
                    </NavLink>
                )}
              </SidebarLinkGroup>


            </ul>
          </div>
        </div>

        {/* Expand / collapse button */}
        <div className="pt-3 hidden lg:inline-flex 2xl:hidden justify-end mt-auto">
          <div className="w-12 pl-4 pr-3 py-2">
            <button className="text-gray-400 hover:text-gray-500 dark:text-gray-500 cursor-pointer dark:hover:text-gray-400" onClick={() => setSidebarExpanded(!sidebarExpanded)}>
              <span className="sr-only">Expand / collapse sidebar</span>
              <svg className="shrink-0 fill-current text-gray-400 dark:text-gray-500 sidebar-expanded:rotate-180" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                <path d="M15 16a1 1 0 0 1-1-1V1a1 1 0 1 1 2 0v14a1 1 0 0 1-1 1ZM8.586 7H1a1 1 0 1 0 0 2h7.586l-2.793 2.793a1 1 0 1 0 1.414 1.414l4.5-4.5A.997.997 0 0 0 12 8.01M11.924 7.617a.997.997 0 0 0-.217-.324l-4.5-4.5a1 1 0 0 0-1.414 1.414L8.586 7M12 7.99a.996.996 0 0 0-.076-.373Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
