import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setSearchTerm } from '../../store/searchSlice';

function Search() {
  const dispatch = useDispatch();
  const searchQuery = useSelector((state) => state.search.term);
  return (
    <div>
      <div className="relative hidden sm:block">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
        <input type="search" className="flex h-11 rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 w-80  bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 " placeholder="Search posts..." value={searchQuery} onChange={(e) => dispatch(setSearchTerm(e.target.value))} data-listener-added_6e197041="true" />
      </div>
    </div>
  )
}

export default Search
