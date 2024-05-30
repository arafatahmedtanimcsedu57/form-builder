import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  closeCircularProgress,
  openCircularProgress,
} from "../uireducers/progress";

import apis from "../../service/Apis";
import { Post } from "../../service/axios.call";

interface LoginRequest {
  username: string;
  password: string;
}
interface Login {
  loading: boolean;
  userToken: string | null;
  error: string | null;
  success: boolean;
}

export const getLogin = createAsyncThunk(
  "auth/getLogedIn",

  async (
    { username, password }: LoginRequest,
    { rejectWithValue, dispatch },
  ) => {
    dispatch(openCircularProgress());

    try {
      const { data } = await Post({
        url: `${apis.BASE}/api/authentication/authenticate`,
        data: { username, password },
      });

      dispatch(closeCircularProgress());
      return data;
    } catch (error: any) {
      dispatch(closeCircularProgress());
      if (error.response && error.response.data.message)
        return rejectWithValue(error.response.data.message);
      else return rejectWithValue(error.message);
    }
  },
);

const initialState: Login = {
  loading: false,
  userToken: null,
  error: null,
  success: false,
};

const slice = createSlice({
  name: "login",
  initialState,
  reducers: {},
  extraReducers: {
    [`${getLogin.pending}`]: (state) => {
      state.loading = true;
      state.error = null;
    },

    [`${getLogin.fulfilled}`]: (state, { payload }) => {
      state.loading = false;
      state.userToken = payload;
    },

    [`${getLogin.rejected}`]: (state, { payload }) => {
      state.loading = false;
      state.error = payload;
    },
  },
});

export default slice.reducer;
