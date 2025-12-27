import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectIsAdmin } from "./app/AuthSlice";
import {
	Cart,
	Highlights,
	Footer,
	Hero,
	Navbar,
	PopularSales,
	Stories,
	Checkout,
	Login,
	Signup,
	AdminDashboard,
} from "./components";

import {
	heroapi,
	newArrivals,
	topratedsales,
	highlight,
	featured,
	featured2,
	story,
	footerAPI,
} from "./data/data.js";

// Protected Route Component for Admin
const ProtectedAdminRoute = ({ children }) => {
	const isAdmin = useSelector(selectIsAdmin);
	return isAdmin ? children : <Navigate to="/admin/login" replace />;
};

// Layout wrapper to conditionally show Navbar and Footer
const Layout = ({ children }) => {
	const location = useLocation();

	// Pages where we don't want Navbar and Footer
	const noLayoutPages = ['/login', '/admin/login', '/admin/dashboard', '/checkout'];
	const hideLayout = noLayoutPages.includes(location.pathname);

	// Show Cart only on pages with Navbar
	const showCart = !hideLayout;

	return (
		<>
			{!hideLayout && <Navbar />}
			{showCart && <Cart />}
			{children}
			{!hideLayout && <Footer footerAPI={footerAPI} />}
		</>
	);
};

const App = () => {
	return (
		<Router>
			<Layout>
				<Routes>
					{/* Home Page Route */}
					<Route
						path="/"
						element={
							<main className="relative flex flex-col gap-16">
								<Hero heroapi={heroapi} />
								<PopularSales dataAPI={newArrivals} ifTrue />
								<PopularSales dataAPI={topratedsales} />
								<Highlights dataAPI={highlight} ifTrue />
								<Highlights dataAPI={featured} />
								<Highlights dataAPI={featured2} ifTrue />
								<Stories story={story} />
							</main>
						}
					/>

					{/* User Login Route */}
					<Route path="/login" element={<Login />} />

					{/* Admin Login Route */}
					<Route path="/admin/login" element={<Login />} />

					{/* User Signup Route */}
					<Route path="/signup" element={<Signup />} />

					{/* Admin Dashboard Route (Protected) */}
					<Route
						path="/admin/dashboard"
						element={
							<ProtectedAdminRoute>
								<AdminDashboard />
							</ProtectedAdminRoute>
						}
					/>

					{/* Checkout Page Route */}
					<Route path="/checkout" element={<Checkout />} />
				</Routes>
			</Layout>
		</Router>
	);
};

export default App;