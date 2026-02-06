// src/components/common/SearchBar.jsx
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui';

const SearchBar = ({ 
  onSearch, 
  placeholder = 'Search...', 
  className = '',
  autoFocus = false 
}) => {
  const [query, setQuery] = useState('');

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <Input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="pl-10"
        autoFocus={autoFocus}
      />
    </form>
  );
};

export default SearchBar;
