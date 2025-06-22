import {configureStore} from '@reduxjs/toolkit';
import authSlice from './authSlice';
import searchSlice from './searchSlice';
import profileSlice from './profileSlice'; 

const store = configureStore({
    reducer: {
        auth : authSlice,
        search: searchSlice,
        profile: profileSlice, 
    }
});


export default store;