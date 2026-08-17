import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Sparkles } from 'lucide-react';
import { useUserInteractions } from '../../hooks/useUserInteractions';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearchSubmit?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search products, brands, categories with AI...',
  className = '',
  onSearchSubmit,
}) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { track } = useUserInteractions();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      track('search');
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
      if (onSearchSubmit) onSearchSubmit();
    }
  };

  const clearSearch = () => {
    setQuery('');
  };

  return (
    <form onSubmit={handleSearch} className={`relative flex items-center ${className}`}>
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#66736A]">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 bg-white border border-[#DDE4DC] rounded-xl text-xs text-[#17211B] placeholder-[#66736A] focus:outline-none focus:border-[#1F6F50] focus:ring-2 focus:ring-[#1F6F50]/20 transition-all shadow-xs"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#66736A] hover:text-[#17211B]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <button
        type="submit"
        className="ml-2 px-3.5 py-2 bg-[#12372A] hover:bg-[#1F6F50] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all shrink-0"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#B7F34A]" />
        <span>Search</span>
      </button>
    </form>
  );
};
