import {
  createAction,
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import {
  closeCircularProgress,
  openCircularProgress,
} from "../uireducers/progress";
import { SecurePost } from "../../service/axios.call";
import apis from "../../service/Apis";
import { FileType } from "../../types/FileType";

interface FileUploadType {
  loading: boolean;
  error: string | null;
  success: boolean;
  file: FileType | null;
}

export const saveFormFile = createAsyncThunk<FileType, FormData>(
  "formFile/saveFile",

  async (file: FormData, { rejectWithValue }) => {
    try {
      const { data } = await SecurePost<{ data: FileType }>({
        url: `${apis.BASE}/api/v1/multimedia/upload`,
        data: file,
        headers: {
          "content-type": "multipart/form-data",
        },
      });

      return data?.data || ({} as FileType);
    } catch (error: any) {
      if (error.response && error.response.data.message)
        return rejectWithValue(error.response.data.message);
      else return rejectWithValue(error.message);
    }
  }
);

export const setFormFile = createAsyncThunk<FileType | null, FileType | null>(
  "formFile/setFile",

  async (file) => {
    return file;
  }
);

export const resetFormFile = createAsyncThunk<FileType, FileType>(
  "formFile/resetFile",

  async (file) => {
    return file;
  }
);

const initialState: FileUploadType = {
  loading: false,
  error: null,
  success: false,
  file: null,
};

const slice = createSlice({
  name: "formFile",
  initialState,
  reducers: {
    setFileNull: (state) => {
      state.file = null;
    },
  },
  extraReducers: {
    [`${saveFormFile.pending}`]: (state) => {
      state.loading = true;
      state.error = null;
    },

    [`${saveFormFile.fulfilled}`]: (state, { payload }) => {
      state.loading = false;
      state.file = payload;
    },

    [`${saveFormFile.rejected}`]: (state, { payload }) => {
      state.loading = false;
      state.error = payload;
    },

    [`${setFormFile.fulfilled}`]: (state, { payload }) => {
      state.file = payload;
    },

    [`${resetFormFile.fulfilled}`]: (state, { payload }) => {
      state.file = null;
    },
  },
});

export const { setFileNull } = slice.actions;
export default slice.reducer;
