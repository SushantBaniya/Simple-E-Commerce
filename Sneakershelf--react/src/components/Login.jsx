import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { setAuth, selectIsAuthenticated } from "../app/AuthSlice";
import toast from "react-hot-toast";
import {
    UserIcon,
    LockClosedIcon,
    EyeIcon,
    EyeSlashIcon,
    ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import logo from "../assets/logo.png";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const isAuthenticated = useSelector(selectIsAuthenticated);

    // Check if this is admin login route
    const isAdminLogin = location.pathname === "/admin/login";

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Redirect if already authenticated
    React.useEffect(() => {
        if (isAuthenticated) {
            if (isAdminLogin) {
                navigate("/admin/dashboard");
            } else {
                navigate("/");
            }
        }
    }, [isAuthenticated, isAdminLogin, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }

        if (!formData.password.trim()) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/login/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();
            console.log("Login response:", { status: response.status, data });

            if (!response.ok) {
                toast.error(data.error || "Login failed. Please try again.");
                setErrors({ password: data.error || "Invalid credentials" });
                return;
            }

            // Success
            toast.success("Login successful!");

            dispatch(
                setAuth({
                    user: data,
                    isAdmin: isAdminLogin,
                })
            );

            // redirect after successful login
            if (isAdminLogin) navigate("/admin/dashboard");
            else navigate("/");
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Network error. Please check if the server is running.");
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = () => {
        if (isAdminLogin) {
            setFormData({
                email: "admin@sneakershelf.com",
                password: "admin123",
            });
        } else {
            setFormData({
                email: "user@sneakershelf.com",
                password: "user123",
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="flex justify-center items-center mb-4">
                        <img src={logo} alt="logo" className="w-20 h-auto" />
                    </div>
                    <h1 className="text-[#7f1d1d] font-bold text-2xl tracking-wider italic">
                        SNEAKERSHELF
                    </h1>
                    <div className="mt-6 flex items-center justify-center gap-2">
                        {isAdminLogin ? (
                            <ShieldCheckIcon className="w-8 h-8 text-orange-600" />
                        ) : (
                            <UserIcon className="w-8 h-8 text-orange-600" />
                        )}
                        <h2 className="text-3xl font-bold text-gray-900">
                            {isAdminLogin ? "Admin Login" : "Welcome Back"}
                        </h2>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                        {isAdminLogin
                            ? "Sign in to access the admin dashboard"
                            : "Sign in to your account to continue shopping"}
                    </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-800 mb-2">
                        Demo Credentials:
                    </p>
                    <div className="text-xs text-blue-700 space-y-1">
                        {isAdminLogin ? (
                            <>
                                <p>Email: admin@sneakershelf.com</p>
                                <p>Password: admin123</p>
                            </>
                        ) : (
                            <>
                                <p>Email: user@sneakershelf.com</p>
                                <p>Password: user123</p>
                            </>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={handleDemoLogin}
                        className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 underline"
                    >
                        Click to auto-fill
                    </button>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`appearance-none block w-full pl-10 pr-3 py-3 border ${errors.email ? "border-red-500" : "border-gray-300"
                                        } rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-150`}
                                    placeholder="Enter your email"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`appearance-none block w-full pl-10 pr-10 py-3 border ${errors.password ? "border-red-500" : "border-gray-300"
                                        } rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-150`}
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Signing in..." : (isAdminLogin ? "Sign in as Admin" : "Sign in")}
                        </button>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        {!isAdminLogin && (
                            <button
                                type="button"
                                onClick={() => navigate("/signup")}
                                className="font-medium text-orange-600 hover:text-orange-500"
                            >
                                Create Account
                            </button>
                        )}
                        {!isAdminLogin && (
                            <button
                                type="button"
                                onClick={() => navigate("/admin/login")}
                                className="font-medium text-orange-600 hover:text-orange-500"
                            >
                                Admin Login
                            </button>
                        )}
                        {isAdminLogin && (
                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                                className="font-medium text-orange-600 hover:text-orange-500"
                            >
                                User Login
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="font-medium text-gray-600 hover:text-gray-500"
                        >
                            Back to Home
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;