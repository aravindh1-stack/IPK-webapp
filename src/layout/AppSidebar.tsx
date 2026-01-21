import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "@/context/SidebarContext";
import {
  GridIcon,
  CalenderIcon,
  ListIcon,
  UserCircleIcon,
  PlugInIcon,
  ChevronDownIcon,
  HorizontaLDots,
  PieChartIcon,
  GroupIcon,
} from "@/icons";
import SidebarWidget from "./SidebarWidget";
import { Role, useAuth } from "@/context/AuthContex";

type NavChild = { name: string; path: string };
type NavSubItem = { name: string; path: string; pro?: boolean; new?: boolean; children?: NavChild[] };
type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: NavSubItem[];
};

const marketingNav: NavItem[] = [
  {
    icon: <GridIcon />,
    name: 'Marketing Overview',
    path: '/marketing/dashboard',
  },
  {
    icon: <CalenderIcon />,
    name: 'Campaign Calendar',
    path: '/marketing/calendar',
  },
  {
    icon: <ListIcon />,
    name: 'Lead Intake',
    subItems: [
      { name: 'Create Lead', path: '/marketing/leads_create' },
      { name: 'Lead Library', path: '/marketing/overall-leads' },
    ],
  },
];

const salesNav: NavItem[] = [
  {
    icon: <GridIcon />,
    name: 'Sales Dashboard',
    path: '/sales/dashboard',
  },
  {
    icon: <UserCircleIcon />,
    name: 'Lead Management',
    path: '/sales/stages',
    subItems: [
      { name: 'My Leads', path: '/sales/stages' },
      { name: 'Lead Profile', path: '/sales/leads' },
    ],
  },

   {
  icon: <GroupIcon />,
    name: "Onboarding",
  subItems: [
    {
      name: "Onboard List",
      path: "/sales/onboarding",
    },
    {
      name: "Onboarding Process",
      path: "/sales/onboarding/process",
    },
  ],
}
];
  // {
  //   icon: <CalenderIcon />,
  //   name: 'Engagement',
  //   subItems: [
  //     { name: 'Events', path: '/sales/events' },
  //     { name: 'Calls', path: '/sales/call' },
  //     { name: 'Chat', path: '/sales/chat' },
  //   ],
  // },


const adminNav: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: 'Admin Dashboard',
    path: '/admin/dashboard',
  },
  {
    icon: <GroupIcon />,
    name: 'IPK Users',
    path: '/admin/users',
  },
];

function getNav(role?: Role) {
  // Show only the menus relevant to the signed-in role
  if (role === "RM") return { main: salesNav, others: [] as NavItem[] };
  if (role === "STAFF") return { main: salesNav, others: [] as NavItem[] };
  if (role === "MARKETING") return { main: marketingNav, others: [] as NavItem[] };
  if (role === "ADMIN") return { main: adminNav, others: [] as NavItem[] };
  return { main: [] as NavItem[], others: [] as NavItem[] };
}
const AppSidebar: React.FC = () => {
  const { user } = useAuth();
  const userRole = user?.role !== "UNKNOWN" ? user?.role : undefined;
  const { main: navItems, others: othersItems } = getNav(userRole);
  const hasOthers = othersItems.length > 0;
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [openChild, setOpenChild] = useState<Record<string, boolean>>({});
  const childRefs = useRef<Record<string, HTMLUListElement | null>>({});
  const [childHeights, setChildHeights] = useState<Record<string, number>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => {
      const cur = location.pathname;
      if (path === "/") {
        // Special case: only highlight Dashboard on the root
        return cur === "/";
      }
      return cur === path || cur.startsWith(path + "/");
    },
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem: NavSubItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
            if (subItem.children) {
              subItem.children.forEach((child) => {
                if (isActive(child.path)) {
                  setOpenSubmenu({
                    type: menuType as "main" | "others",
                    index,
                  });
                  submenuMatched = true;
                }
              });
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  // measure heights of child lists for smooth animation
  useEffect(() => {
    const next: Record<string, number> = {};
    Object.keys(childRefs.current).forEach((k) => {
      next[k] = childRefs.current[k]?.scrollHeight || 0;
    });
    setChildHeights(next);
  }, [openSubmenu, openChild, isExpanded, isHovered, isMobileOpen]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => {
                handleSubmenuToggle(index, menuType);
                // If parent has a default path, navigate to it (e.g., Lead Management -> My Leads)
                if (nav.path) navigate(nav.path);
              }}
              className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={`menu-item-icon-size  ${openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
              >
                <span
                  className={`menu-item-icon-size ${isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem, subIndex) => {
                  const key = `${menuType}-${index}-${subIndex}`;
                  const hasChildren = Boolean(subItem.children && subItem.children.length > 0);
                  const isOpen = hasChildren ? openChild[key] !== false : true; // default open
                  return (
                    <li key={subItem.name}>
                      <div className="flex items-center gap-2">
                        <Link
                          to={subItem.path}
                          className={`flex-1 menu-dropdown-item ${isActive(subItem.path)
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                            }`}
                        >
                          {subItem.name}
                          <span className="flex items-center gap-1 ml-auto">
                            {subItem.new && (
                              <span
                                className={`ml-auto ${isActive(subItem.path)
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                  } menu-dropdown-badge`}
                              >
                                new
                              </span>
                            )}
                            {subItem.pro && (
                              <span
                                className={`ml-auto ${isActive(subItem.path)
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                  } menu-dropdown-badge`}
                              >
                                pro
                              </span>
                            )}
                          </span>
                        </Link>
                        {hasChildren && (
                          <button
                            aria-label="Toggle submenu"
                            className={`p-1 rounded hover:bg-gray-50 dark:hover:bg-white/[0.06] ${isOpen ? 'rotate-180' : ''
                              }`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setOpenChild((s) => ({ ...s, [key]: !isOpen }));
                            }}
                          >
                            <ChevronDownIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      {hasChildren && (
                        <ul
                          ref={(el) => { childRefs.current[key] = el; return undefined; }}
                          className="mt-1 ml-5 space-y-1 overflow-hidden transition-all duration-300"
                          style={{ height: isOpen ? `${childHeights[key] || 0}px` : '0px' }}
                        >
                          {subItem.children!.map((child) => (
                            <li key={child.path}>
                              <Link
                                to={child.path}
                                className={`menu-dropdown-item pl-7 text-sm ${isActive(child.path)
                                    ? "menu-dropdown-item-active"
                                    : "menu-dropdown-item-inactive"
                                  }`}
                              >
                                {child.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            {hasOthers && (
              <div className="">
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                    }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "Others"
                  ) : (
                    <HorizontaLDots />
                  )}
                </h2>
                {renderMenuItems(othersItems, "others")}
              </div>
            )}
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
