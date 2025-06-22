import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    profileData: null,
    loading: false,
    error: null,
};

const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        setProfile: (state, action) => {
            state.profileData = action.payload;
        },
        clearProfile: (state) => {
            state.profileData = null;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        updateProfileUserName: (state, action) => {
            if (state.profileData) {
                state.profileData.userName = action.payload;
            }
        },
    },
});

export const {
    setProfile,
    clearProfile,
    setLoading,
    setError,
    updateProfileUserName,
} = profileSlice.actions;

export default profileSlice.reducer;
