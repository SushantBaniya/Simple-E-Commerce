import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import {
    UserIcon,
    LockClosedIcon,
    EnvelopeIcon,
    EyeIcon,
    EyeSlashIcon,
} from "@heroicons/react/24/outline";
import logo from "../assets/logo.png";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const Signup = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        user_name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

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

        if (!formData.user_name.trim()) {
            newErrors.user_name = "Name is required";
        } else if (formData.user_name.length < 2) {
            newErrors.user_name = "Name must be at least 2 characters";
        }

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

        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
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
            const response = await fetch(`${API_BASE_URL}/signup/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_name: formData.user_name,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();
            console.log("Signup response:", { status: response.status, data });

            if (!response.ok) {
                // Handle validation errors from API
                if (data.email) {
                    setErrors({ email: Array.isArray(data.email) ? data.email[0] : data.email });
                    toast.error(Array.isArray(data.email) ? data.email[0] : data.email);
                } else if (data.user_name) {
                    setErrors({ user_name: Array.isArray(data.user_name) ? data.user_name[0] : data.user_name });
                    toast.error(Array.isArray(data.user_name) ? data.user_name[0] : data.user_name);
                } else if (data.error) {
                    toast.error(data.error);
                } else if (data.detail) {
                    toast.error(data.detail);
                } else {
                    toast.error("Signup failed. Please try again.");
                }
                return;
            }

            // Success - log the user in
            toast.success("Account created successfully!");

            navigate("/login");
        } catch (error) {
            console.error("Signup error:", error);
            toast.error("Network error. Please check if the server is running.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
                <div className="flex justify-center mb-8">
                    <img src={logo} alt="Sneakershelf Logo" className="h-12 w-auto" />
                </div>
                <h2 className="text-center text-2xl font-bold text-gray-900 mb-2">
                    Create Account
                </h2>
                <p className="text-center text-gray-600 mb-8">
                    Join us and start your sneaker journey
                </p>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Name Field */}
                        <div>
                            <label
                                htmlFor="user_name"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="user_name"
                                    name="user_name"
                                    type="text"
                                    value={formData.user_name}
                                    onChange={handleInputChange}
                                    className={`appearance-none block w-full pl-10 pr-3 py-3 border ${errors.user_name ? "border-red-500" : "border-gray-300"
                                        } rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-150`}
                                    placeholder="Enter your full name"
                                />
                            </div>
                            {errors.user_name && (
                                <p className="mt-1 text-sm text-red-600">{errors.user_name}</p>
                            )}
                        </div>

                        {/* Email Field */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
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

                        {/* Password Field */}
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

                        {/* Confirm Password Field */}
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className={`appearance-none block w-full pl-10 pr-10 py-3 border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"
                                        } rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-150`}
                                    placeholder="Confirm your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showConfirmPassword ? (
                                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Already have an account?</span>
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="font-medium text-orange-600 hover:text-orange-500"
                        >
                            Sign In
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="w-full text-sm font-medium text-gray-600 hover:text-gray-500"
                    >
                        Back to Home
                    </button>
                </form>
            </div >
        </div >
    );
};

export default Signup;
