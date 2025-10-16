import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const SearchBar = () => {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search course"
          className="pl-12 h-12 bg-[#0B1D43] border border-[#1a2b55] text-white placeholder:text-gray-400 focus:border-[#0070F3] focus:ring-0"
        />
      </div>

      <Button
        variant="outline"
        className="gap-2 h-12 px-6 bg-[#101B44] border border-[#1a2b55] text-white hover:bg-[#13265C] hover:text-[#0070F3] transition-colors"
      >
        <span>Filters</span>
        <SlidersHorizontal className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default SearchBar;
   