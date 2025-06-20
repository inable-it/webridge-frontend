import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface MenuState {
  activeMenu: string;
}

const initialState: MenuState = {
  activeMenu: "접근성 검사",
};

export const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    setActiveMenu: (state, action: PayloadAction<string>) => {
      state.activeMenu = action.payload;
    },
  },
});

export const { setActiveMenu } = menuSlice.actions;
export default menuSlice.reducer;
