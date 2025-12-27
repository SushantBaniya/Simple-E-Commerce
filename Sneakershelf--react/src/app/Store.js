import { configureStore } from "@reduxjs/toolkit";
import CartSlice from "./CartSlice";
import AuthSlice from "./AuthSlice";

const Store = configureStore({
  reducer: {
    cart: CartSlice,
    auth: AuthSlice,
  },
});

export default Store;