import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import moment from "moment";
import { TemplateType } from "../../types/FormTemplateTypes";
import _ from "lodash";

import { getFromLocalStorage, saveToLocalStorage } from "../common";
import {
  closeCircularProgress,
  openCircularProgress,
} from "../uireducers/progress";

import { generateID } from "../../utils/common";
import DemoFormLayouts from "../../utils/demoFormLayouts";

interface AddTemplateType {
  formName: string;
}

export const getAllTemplates = createAsyncThunk(
  "formBuilderEntity/getAllTemplates",
  async (data, { dispatch }) => {
    dispatch(openCircularProgress());

    return await new Promise<TemplateType[]>((resolve, reject) => {
      let outputInStorage = JSON.parse(getFromLocalStorage("templates"));

      if (outputInStorage === null) {
        outputInStorage = DemoFormLayouts;
        saveToLocalStorage("templates", JSON.stringify(outputInStorage));
      }

      setTimeout(() => {
        dispatch(closeCircularProgress());
        resolve(outputInStorage);
      }, 1000);
    });
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
        createdAt: currentDateTime,
        creator: "Test User",
        formLayoutComponents: [],
        lastPublishedAt: 0,
        publishHistory: [],
        publishStatus: "draft",
        updatedAt: 0,
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
