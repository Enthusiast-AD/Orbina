import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    status: false,
    userData: null,
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            state.status = true;
            state.userData = action.payload.userData;
        },
        logout: (state) => {
            state.status = false;
            state.userData = null;
        },
        updateUserName: (state, action) => {
            if (state.userData) {
                state.userData.name = action.payload;
            }
        },
    }
})

export const { login, logout, updateUserName } = authSlice.actions;

export default authSlice.reducer;