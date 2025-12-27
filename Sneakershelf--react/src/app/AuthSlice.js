import { createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

const initialState = {
    user: null,
    isAuthenticated: false,
    isAdmin: false,
};

const AuthSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setLogin: (state, action) => {
            const { email, password, isAdmin } = action.payload;

            // Demo credentials (in production, this would be API-based)
            const adminCredentials = {
                email: "admin@sneakershelf.com",
                password: "admin123",
            };

            const demoUserCredentials = {
                email: "user@sneakershelf.com",
                password: "user123",
            };

            if (isAdmin) {
                // Admin login
                if (
                    email === adminCredentials.email &&
                    password === adminCredentials.password
                ) {
                    state.user = {
                        email: email,
                        name: "Admin User",
                        role: "admin",
                    };
                    state.isAuthenticated = true;
                    state.isAdmin = true;
                    toast.success("Admin login successful!");
                } else {
                    toast.error("Invalid admin credentials!");
                    return;
                }
            } else {
                // User login
                if (
                    email === demoUserCredentials.email &&
                    password === demoUserCredentials.password
                ) {
                    state.user = {
                        email: email,
                        name: "John Doe",
                        role: "user",
                    };
                    state.isAuthenticated = true;
                    state.isAdmin = false;
                    toast.success(`Welcome back, ${state.user.name}!`);
                } else {
                    toast.error("Invalid credentials!");
                    return;
                }
            }
        },
        setAuth: (state, action) => {
            const { user, isAdmin } = action.payload;
            state.user = user || null;
            state.isAuthenticated = Boolean(user);
            state.isAdmin = Boolean(isAdmin);
            if (user) {
                toast.success(`Welcome back, ${user.username || user.name || 'user'}!`);
            }
        },
        setLogout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isAdmin = false;
            toast.success("Logged out successfully!");
        },
    },
});

export const { setLogin, setAuth, setLogout } = AuthSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsAdmin = (state) => state.auth.isAdmin;

export default AuthSlice.reducer;