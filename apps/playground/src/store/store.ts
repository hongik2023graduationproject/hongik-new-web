import { configureStore } from "@reduxjs/toolkit";
import playgroundReducer from "./playgroundSlice";

export const store = configureStore({
  reducer: {
    playground: playgroundReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
