import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const menuItems = [
  { path: "/", label: "Dashboard", icon: "fa-home" },
  { path: "/schedules", label: "Schedules", icon: "fa-calendar-alt" },
  { path: "/teachers", label: "Teachers", icon: "fa-user-tie" },
  { path: "/courses", label: "Courses", icon: "fa-book" },
  { path: "/settings", label: "Settings", icon: "fa-cog" },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="bg-neutral-800 text-white w-full md:w-64 flex-shrink-0 md:min-h-screen">
      <div className="p-4 border-b border-neutral-700">
        <h1 className="text-xl font-heading font-bold">PUSAT Scheduler</h1>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link href={item.path}>
                <a
                  className={cn(
                    "flex items-center p-2 rounded-md transition",
                    location === item.path
                      ? "bg-primary-600 text-white"
                      : "hover:bg-neutral-700"
                  )}
                >
                  <i className={`fas ${item.icon} w-5 h-5 mr-3`}></i>
                  <span>{item.label}</span>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
