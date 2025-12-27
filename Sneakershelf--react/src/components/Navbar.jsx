import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectTotalQTY, setOpenCart } from "../app/CartSlice";
import {
  selectIsAuthenticated,
  selectUser,
  selectIsAdmin,
  setLogout,
} from "../app/AuthSlice";

import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import logo from "../assets/logo.png";

const Navbar = () => {
  const [navState, setNavState] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const totalQty = useSelector(selectTotalQTY);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const isAdmin = useSelector(selectIsAdmin);

  const onCartToggle = () => {
    dispatch(
      setOpenCart({
        cartState: true,
      })
    );
  };

  const onNavScroll = () => {
    if (window.scrollY > 30) {
      setNavState(true);
    } else {
      setNavState(false);
    }
  };

  const handleLogout = () => {
    dispatch(setLogout());
    setShowUserMenu(false);
    navigate("/");
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleDashboardClick = () => {
    if (isAdmin) {
      navigate("/admin/dashboard");
    }
    setShowUserMenu(false);
  };

  useEffect(() => {
    window.addEventListener("scroll", onNavScroll);

    return () => {
      window.removeEventListener("scroll", onNavScroll);
    };
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest(".user-menu-container")) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <>
      <header
        className={
          !navState
            ? "absolute top-7 left-0 right-0 opacity-100 z-50"
            : "fixed top-0 left-0 right-0 h-[9vh] flex items-center justify-center opacity-100 z-[200] blur-effect-theme"
        }
      >
        <nav className="flex items-center justify-between app-container">
          <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
            <img
              src={logo}
              alt="logo/img"
              className={`w-16 h-auto ${navState && "filter brightness-0"}`}
            />
            <h1 className="text-[#7f1d1d] font-bold font-sans tracking-wider italic leading-tight">
              SNEAKERSHELF
            </h1>
          </div>
          <ul className="flex items-center justify-center gap-2">
            <li className="grid items-center">
              <MagnifyingGlassIcon
                className={`icon-style ${
                  navState && "text-slate-900 transition-all duration-300"
                }`}
              />
            </li>

            {/* User Menu or Login Button */}
            <li className="grid items-center relative user-menu-container">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-300"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        navState
                          ? "bg-slate-900 text-white"
                          : "bg-white text-slate-900"
                      }`}
                    >
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-sm font-medium hidden sm:inline ${
                        navState ? "text-slate-900" : "text-white"
                      }`}
                    >
                      {user?.name?.split(" ")[0]}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </p>
                        {isAdmin && (
                          <span className="inline-block mt-1 text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                            Admin
                          </span>
                        )}
                      </div>
                      {isAdmin && (
                        <button
                          onClick={handleDashboardClick}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <MagnifyingGlassIcon className="w-4 h-4" />
                          Dashboard
                        </button>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleLoginClick}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                    navState
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "bg-white text-slate-900 hover:bg-gray-100"
                  }`}
                >
                  <UserIcon className="w-5 h-5" />
                  <span className="text-sm hidden sm:inline">Login</span>
                </button>
              )}
            </li>

            <li className="grid items-center">
              <button
                type="button"
                onClick={onCartToggle}
                className="border-none active:scale-110 transition-all duration-300 relative"
              >
                <ShoppingBagIcon
                  className={`icon-style ${
                    navState && "text-slate-900 transition-all duration-300"
                  }`}
                />
                <div
                  className={`absolute top-4 right-0  shadow w-4 h-4 text-[0.65rem] leading-tight font-medium rounded-full flex items-center justify-center cursor-pointer hover:scale-110 translate-all duration-300 ${
                    navState
                      ? "bg-slate-900 text-slate-100 shadow-slate-900"
                      : "bg-slate-100 text-slate-900 shadow-slate-100"
                  }`}
                >
                  {totalQty}
                </div>
              </button>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
};
export default Navbar;