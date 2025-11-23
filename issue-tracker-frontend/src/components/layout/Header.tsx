import React from "react";
import { Menu } from "lucide-react";

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  return (
    <header className="bg-white border-b px-4 py-3 flex items-center gap-4 sticky top-0 z-30">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1 hover:bg-gray-100 rounded-lg"
      >
        <Menu size={24} />
      </button>
      <h2 className="text-lg font-semibold capitalize">{title}</h2>
    </header>
  );
};
