import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import {
  closeCircularProgress,
  openCircularProgress,
} from "../uireducers/progress";

import { SecureGet } from "../../service/axios.call";
import apis from "../../service/Apis";

import { ClientType } from "../../types/ClientType";

interface ClientWithImageUrl extends Partial<Omit<ClientType, "file">> {
  imageUrl: string;
}

export const getAllClients = createAsyncThunk<ClientWithImageUrl[], string>(
  "clientsEntity/getAllClients",

  async (_: string, { rejectWithValue, dispatch }) => {
    dispatch(openCircularProgress());

    try {
      const { data }: { data: ClientType[] } = await SecureGet<ClientType[]>({
        url: `${apis.BASE}/api/provider`,
      });

      const providersWithImages = await Promise.all(
        data.map(async (client) => {
          const { data: link }: { data: string } = await SecureGet({
            url: `https://stg-digireg-b.allevia.md/api/multimedia/preview-file-with-id/${client.file.id}`,
          });

          return {
            ...client,
            imageUrl: link,
          };
        }),
      );

      return [...providersWithImages] as ClientWithImageUrl[];
    } catch (error: any) {
      dispatch(closeCircularProgress());

      if (error.response && error.response.data.message)
        return rejectWithValue(error.response.data.message);
      else return rejectWithValue(error.message);
    }
  },
);

const slice = createSlice({
  name: "clientEntity",
  initialState: {
    allClients: [] as ClientWithImageUrl[],
  },
  reducers: {},
  extraReducers: {
    [`${getAllClients.fulfilled}`]: (state, { payload }) => {
      state.allClients = payload;
    },
  },
});

export default slice.reducer;
