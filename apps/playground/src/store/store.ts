import { configureStore } from "@reduxjs/toolkit";
import playgroundReducer from "./playgroundSlice";
import { persistMiddleware } from "./persistMiddleware";

export const store = configureStore({
  reducer: {
    playground: playgroundReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(persistMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
