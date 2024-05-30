import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import moment from "moment";
import _ from "lodash";

import { getFromLocalStorage, saveToLocalStorage } from "../common";
import {
  closeCircularProgress,
  openCircularProgress,
} from "../uireducers/progress";

import { TemplateType } from "../../types/FormTemplateTypes";
import { generateID } from "../../utils/common";
import convertForm from "../../utils/convertResponseToFormStruct";

import apis from "../../service/Apis";
import { SecureGet } from "../../service/axios.call";

interface AddTemplateType {
  formName: string;
}

export const getAllTemplates = createAsyncThunk(
  "formBuilderEntity/getAllTemplates",

  async (data: string, { rejectWithValue, dispatch }) => {
    dispatch(openCircularProgress());

    try {
      const { data }: { data: unknown[] } = await SecureGet({
        url: `${apis.BASE}/api/formStructure/`,
      });

      dispatch(closeCircularProgress());
      const _data: TemplateType[] = data.map((item: any) => convertForm(item));
      saveToLocalStorage("templates", JSON.stringify(_data));
      return _data;
    } catch (error: any) {
      dispatch(closeCircularProgress());

      if (error.response && error.response.data.message)
        return rejectWithValue(error.response.data.message);
      else return rejectWithValue(error.message);
    }
  },
);

export const getSingleTemplate = createAsyncThunk(
  "formBuilderEntity/getSingleTemplate",

  async (data: string, { dispatch }) => {
    dispatch(openCircularProgress());
    return await new Promise<TemplateType>((resolve) => {
      const allTemplates: TemplateType[] = JSON.parse(
        getFromLocalStorage("templates"),
      );

      const singleTemplate = allTemplates.filter((t) => t.id === data)[0];

      setTimeout(() => {
        dispatch(closeCircularProgress());
        resolve(singleTemplate);
      }, 1000);
    });
  },
);

export const addTemplate = createAsyncThunk(
  "formBuilderEntity/addTemplate",

  async ({ formName }: AddTemplateType) => {
    return await new Promise<TemplateType>((resolve) => {
      const currentDateTime = moment().unix() * 1000;

      const allTemplates: TemplateType[] = JSON.parse(
        getFromLocalStorage("templates"),
      );

      const template: TemplateType = {
        id: generateID(),
        formName: formName,
        createdAt: "",
        creator: "Test User",
        formLayoutComponents: [],
        lastPublishedAt: "",
        publishHistory: [],
        publishStatus: "draft",
        updatedAt: "",
      };

      allTemplates.push(template);

      setTimeout(() => {
        saveToLocalStorage("templates", JSON.stringify(allTemplates));
        resolve(template);
      }, 1000);
    });
  },
);

export const deleteTemplate = createAsyncThunk(
  "formBuilderEntity/deleteTemplate",

  async (data: string, { dispatch }) => {
    dispatch(openCircularProgress());

    return await new Promise<number>((resolve) => {
      const allTemplates: TemplateType[] = JSON.parse(
        getFromLocalStorage("templates"),
      );

      const deleteIndex = allTemplates.findIndex((t) => t.id === data);

      allTemplates.splice(deleteIndex, 1);

      setTimeout(() => {
        dispatch(closeCircularProgress());
        saveToLocalStorage("templates", JSON.stringify(allTemplates));
        resolve(deleteIndex);
      }, 600);
    });
  },
);

export const saveTemplate = createAsyncThunk(
  "formBuilderEntity/saveTemplate",
  async (data: TemplateType, { dispatch }) => {
    dispatch(openCircularProgress());
    return await new Promise<TemplateType>((resolve) => {
      const allTemplates: TemplateType[] = JSON.parse(
        getFromLocalStorage("templates"),
      );

      let templateIndex = allTemplates.findIndex((t) => t.id === data.id);

      allTemplates[templateIndex] = data;

      setTimeout(() => {
        dispatch(closeCircularProgress());
        saveToLocalStorage("templates", JSON.stringify(allTemplates));
        resolve(data);
      }, 1000);
    });
  },
);

const slice = createSlice({
  name: "formBuilderEntity",
  initialState: {
    allTemplates: [] as TemplateType[],
    selectedTemplate: null as TemplateType | null,
  },
  reducers: {
    setSelectedTemplateNull: (state) => {
      state.selectedTemplate = null;
    },
  },
  extraReducers: {
    [`${getAllTemplates.fulfilled}`]: (state, { payload }) => {
      state.allTemplates = payload;
    },

    [`${getSingleTemplate.fulfilled}`]: (state, { payload }) => {
      state.selectedTemplate = payload;
    },

    [`${addTemplate.fulfilled}`]: (
      state,
      { payload }: PayloadAction<TemplateType>,
    ) => {
      const updatedState = _.cloneDeep(state.allTemplates);
      updatedState.push(payload);

      state.allTemplates = updatedState;
    },

    [`${saveTemplate.fulfilled}`]: (state, { payload }) => {
      const newStateTemplates = state.allTemplates.slice();
      const newTemplateId = newStateTemplates.findIndex(
        (t) => t.id === payload.id,
      );
      newStateTemplates[newTemplateId] = payload;

      state.allTemplates = newStateTemplates;
    },

    [`${deleteTemplate.fulfilled}`]: (state, { payload }) => {
      const newStateTemplates = state.allTemplates.slice();
      newStateTemplates.splice(payload, 1);

      state.allTemplates = newStateTemplates;
    },
  },
});

export const { setSelectedTemplateNull } = slice.actions;
export default slice.reducer;
