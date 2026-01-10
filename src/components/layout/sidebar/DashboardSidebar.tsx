import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

interface ProjectItem {
  label: string;
  path: string;
  icon: string;
}

interface DashboardSidebarProps {
  projects?: ProjectItem[];
  navItems?: NavItem[];
  isCollapsed?: boolean;
}

export function DashboardSidebar({
  projects,
  navItems,
  isCollapsed = false,
}: DashboardSidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  // Default projects for Admin
  const defaultProjects: ProjectItem[] = projects || [
    { label: 'Tổng quan', path: '/portal/admin/data-management', icon: 'dashboard' },
    // { label: 'Kho vật tư', path: '/portal/admin/inventory', icon: 'inventory_2' },
    { label: 'Người dùng', path: '/portal/admin/users', icon: 'group' },
  ];

  // Default nav items for Admin
  const defaultNavItems: NavItem[] = navItems || [
    { label: 'Thống Kê', path: '/portal/admin/dashboard', icon: 'description' },
  ];

  return (
    <aside
      className={`hidden lg:flex flex-col border-r border-border bg-background flex-shrink-0 h-screen transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo & Brand */}
      <div
        className={`flex items-center border-b border-border transition-all duration-300 ${
          isCollapsed ? 'justify-center px-2 py-4' : 'gap-3 px-6 py-5'
        }`}
      >
        <div className="size-8 flex items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
          <span className="material-symbols-outlined text-2xl">health_and_safety</span>
        </div>
        {!isCollapsed && (
          <h2 className="text-foreground text-lg font-bold leading-tight tracking-tight whitespace-nowrap">
            Cứu Trợ VN
          </h2>
        )}
      </div>

      {/* Navigation Content */}
      <div
        className="flex flex-col flex-1 overflow-y-auto gap-1 transition-all duration-300"
        style={{ padding: isCollapsed ? '1rem 0.5rem' : '1rem' }}
      >
        <TooltipProvider delayDuration={300}>
          {/* Projects Section */}
          {defaultProjects.length > 0 && (
            <>
              {!isCollapsed && (
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2 mt-2">
                  Hệ thống
                </div>
              )}
              {defaultProjects.map((project) => {
                const linkContent = (
                  <Link
                    key={project.path}
                    to={project.path}
                    className={`flex items-center rounded-lg transition-colors ${
                      isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
                    } ${
                      isActive(project.path)
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] flex-shrink-0">
                      {project.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="text-sm whitespace-nowrap">{project.label}</span>
                    )}
                  </Link>
                );

                return isCollapsed ? (
                  <Tooltip key={project.path}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="ml-2">
                      <p>{project.label}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  linkContent
                );
              })}
            </>
          )}

          {/* Divider */}
          {defaultNavItems.length > 0 && (
            <div className={`h-px bg-border my-2 ${isCollapsed ? 'mx-2' : ''}`}></div>
          )}

          {/* System Navigation */}
          {defaultNavItems.length > 0 && (
            <>
              {!isCollapsed && (
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                  Báo cáo
                </div>
              )}
              {defaultNavItems.map((item) => {
                const linkContent = (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center rounded-lg transition-colors ${
                      isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
                    } ${
                      isActive(item.path)
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] flex-shrink-0">
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="text-sm whitespace-nowrap">{item.label}</span>
                    )}
                  </Link>
                );

                return isCollapsed ? (
                  <Tooltip key={item.path}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="ml-2">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  linkContent
                );
              })}
            </>
          )}
        </TooltipProvider>
      </div>

      {/* User Profile Footer */}
      <div
        className={`border-t border-border transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-4'}`}
      >
        <TooltipProvider delayDuration={300}>
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                  <div
                    className={`bg-center bg-no-repeat bg-cover rounded-full size-9 border border-border flex-shrink-0 ${
                      user?.avatarUrl ? '' : 'bg-primary text-primary-foreground'
                    }`}
                    style={{
                      backgroundImage: user?.avatarUrl ? `url("${user.avatarUrl}")` : 'none',
                    }}
                  >
                    {!user?.avatarUrl && (
                      <div className="w-full h-full flex items-center justify-center font-bold">
                        {user?.fullName?.charAt(0) || 'A'}
                      </div>
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="ml-2">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">
                    {user?.fullName || 'Admin User'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user?.email || 'admin@cuutrovn.org'}
                  </span>
                </div>
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors">
              <div
                className={`bg-center bg-no-repeat bg-cover rounded-full size-9 border border-border flex-shrink-0 ${
                  user?.avatarUrl ? '' : 'bg-primary text-primary-foreground'
                }`}
                style={{
                  backgroundImage: user?.avatarUrl ? `url("${user.avatarUrl}")` : 'none',
                }}
              >
                {!user?.avatarUrl && (
                  <div className="w-full h-full flex items-center justify-center font-bold">
                    {user?.fullName?.charAt(0) || 'A'}
                  </div>
                )}
              </div>
              <div className="flex flex-col overflow-hidden min-w-0">
                <span className="text-sm font-bold text-foreground truncate">
                  {user?.fullName || 'Admin User'}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {user?.email || 'admin@cuutrovn.org'}
                </span>
              </div>
            </div>
          )}
        </TooltipProvider>
      </div>
    </aside>
  );
}
