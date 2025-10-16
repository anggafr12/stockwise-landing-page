import { Link, useLocation } from "react-router-dom";
import { User } from "lucide-react";

export const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <span className="text-xl font-bold text-primary">STOCKWISE</span>
          </Link>
          
          <div className="flex items-center gap-8">
            <Link 
              to="/education" 
              className={`text-sm font-medium transition-colors ${
                isActive('/education') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Education
            </Link>
            <Link 
              to="/admin" 
              className={`text-sm font-medium transition-colors ${
                isActive('/admin') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Admin
            </Link>
            <button className="flex items-center gap-2 text-primary">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">username</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
