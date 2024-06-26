import { configureStore } from "@reduxjs/toolkit";
import entitiesReducer from "./entities";
import uireducers from "./uireducers";
import authreducers from "./authreducers";
import filereducer from "./filereducer";

export const store = configureStore({
  reducer: {
    entities: entitiesReducer,
    uielements: uireducers,
    user: authreducers,
    file: filereducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
