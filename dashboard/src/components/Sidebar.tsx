import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  House,
  Users,
  ChartColumn,
  UserPlus,
  ChevronsLeftRightEllipsis,
  ChevronDown,
  Upload,
  CloudUpload,
  Router,
} from "lucide-react";

interface MenuItem {
  to?: string;
  icon: React.ReactNode;
  label: string;
  children?: MenuItem[];
}

export default function Sidebar() {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : false;
  });
  const [expandedGroups, setExpandedGroups] = useState<string[]>(() => {
    const saved = localStorage.getItem("sidebarExpandedGroups");
    return saved ? JSON.parse(saved) : [];
  });

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  // Save expandedGroups to localStorage
  useEffect(() => {
    localStorage.setItem(
      "sidebarExpandedGroups",
      JSON.stringify(expandedGroups),
    );
  }, [expandedGroups]);

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label],
    );
  };

  const isActive = (path?: string) => path === pathname;

  const linkClass = (path?: string) =>
    `flex items-center ${
      collapsed ? "justify-center" : "justify-start gap-3 px-4"
    } py-3 rounded-lg mb-2 transition-colors duration-200 ${
      isActive(path)
        ? "bg-blue-600 text-white"
        : "text-gray-300 hover:bg-blue-900"
    }`;

  const groupButtonClass = () =>
    `flex items-center ${
      collapsed ? "justify-center" : "justify-between"
    } w-full ${
      collapsed ? "justify-center" : "justify-start gap-3 px-4"
    } py-3 rounded-lg mb-2 transition-colors duration-200 text-gray-300 hover:bg-blue-900 cursor-pointer`;

  const menuItems: MenuItem[] = [
    { to: "/", icon: <House size={20} />, label: "Home" },
    {
      icon: <Users size={20} />,
      label: "Verwaltung",
      children: [
        { to: "/users", icon: <Users size={20} />, label: "Users" },
        {
          to: "/create-trainer",
          icon: <Dumbbell size={20} />,
          label: "Trainer erstellen",
        },
        {
          to: "/create-owner",
          icon: <UserPlus size={20} />,
          label: "Owner erstellen",
        },
      ],
    },
    {
      icon: <Dumbbell size={20} />,
      label: "Exercises",
      children: [
        {
          to: "/exercises/list",
          icon: <Dumbbell size={20} />,
          label: "Übersicht",
        },
        {
          to: "/exercises/create",
          icon: <UserPlus size={20} />,
          label: "Exercise hinzufügen",
        },
      ],
    },
    {
      icon: <Upload size={20} />,
      label: "Upload",
      children: [
        {
          to: "/media/list",
          icon: <Router size={20} />,
          label: "Dateiübersicht",
        },
        {
          to: "/media/upload",
          icon: <CloudUpload size={20} />,
          label: "Datei hochladen",
        },
      ],
    },
    { to: "/stats", icon: <ChartColumn size={20} />, label: "Stats" },
    {
      to: "/system",
      icon: <ChevronsLeftRightEllipsis size={20} />,
      label: "Systemstatus",
    },
  ];

  const renderMenuItem = (item: MenuItem, index: number) => {
    const isExpanded = expandedGroups.includes(item.label);
    const hasChildren = item.children && item.children.length > 0;

    if (!hasChildren) {
      return (
        <Link
          key={`${item.label}-${index}`}
          to={item.to || "#"}
          className={linkClass(item.to)}
        >
          <span className="text-xl">{item.icon}</span>
          {!collapsed && <span>{item.label}</span>}
        </Link>
      );
    }

    return (
      <div key={`${item.label}-${index}`}>
        <button
          onClick={() => toggleGroup(item.label)}
          className={groupButtonClass()}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </div>
          {!collapsed && (
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          )}
        </button>

        {isExpanded && !collapsed && (
          <div className="ml-4 border-l border-gray-700 pl-2">
            {item.children?.map((child, childIndex) => (
              <Link
                key={`${child.label}-${childIndex}`}
                to={child.to || "#"}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg mb-2 transition-colors duration-200 text-gray-300 hover:bg-blue-900 ${
                  isActive(child.to) ? "bg-blue-600 text-white" : ""
                }`}
              >
                <span className="text-lg">{child.icon}</span>
                <span className="text-sm">{child.label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`relative h-screen bg-gray-900 border-r border-gray-800 p-4 flex flex-col transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <h1
        className={`text-2xl font-bold mb-6 text-white transition-opacity duration-300 ${
          collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        ProPerform
      </h1>

      <div className="flex-1 overflow-y-auto">
        {menuItems.map((item, index) => renderMenuItem(item, index))}
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="cursor-pointer absolute bottom-4 right-4 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full transition"
      >
        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
    </div>
  );
}
