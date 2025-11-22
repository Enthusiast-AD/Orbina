import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setSearchTerm } from '../../store/searchSlice';
import { Search as SearchIcon } from 'lucide-react';

function Search() {
  const dispatch = useDispatch();
  const searchQuery = useSelector((state) => state.search.term);
  return (
    <div>
      <div className="relative hidden sm:block">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <input 
          type="search" 
          className="flex h-11 rounded-none border border-input px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 w-80 bg-background text-foreground placeholder:text-muted-foreground" 
          placeholder="Search posts..." 
          value={searchQuery} 
          onChange={(e) => dispatch(setSearchTerm(e.target.value))} 
        />
      </div>
    </div>
  )
}

export default Search
