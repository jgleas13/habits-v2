import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface NavItem {
  name: string;
  href: string;
  icon?: React.ReactNode;
}

const timeframes: NavItem[] = [
  { name: 'All Habits', href: '/' },
  { name: 'Afternoon', href: '/afternoon' },
];

const areas: NavItem[] = [
  { name: 'Work', href: '/areas/work' },
  { name: 'Personal', href: '/areas/personal' },
];

const preferences: NavItem[] = [
  { name: 'Manage Habits', href: '/manage' },
  { name: 'App Settings', href: '/settings' },
  { name: 'Resources', href: '/resources' },
];

export function Sidebar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        href={item.href}
        className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        {item.icon}
        <span>{item.name}</span>
      </Link>
    );
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 p-4 flex flex-col">
      {/* User Profile */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          {user?.email?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="font-medium">{user?.email?.split('@')[0]}</div>
          <div className="text-sm text-gray-500">{user?.email}</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-8">
        {/* Timeframes */}
        <div>
          <div className="px-4 mb-2">
            <h2 className="text-sm font-semibold text-gray-500">TIMEFRAMES</h2>
          </div>
          <div className="space-y-1">
            {timeframes.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </div>
        </div>

        {/* Areas */}
        <div>
          <div className="px-4 mb-2">
            <h2 className="text-sm font-semibold text-gray-500">AREAS</h2>
          </div>
          <div className="space-y-1">
            {areas.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
            <button className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg w-full">
              + New Area
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div>
          <div className="px-4 mb-2">
            <h2 className="text-sm font-semibold text-gray-500">PREFERENCES</h2>
          </div>
          <div className="space-y-1">
            {preferences.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </div>
        </div>
      </nav>

      {/* Sign Out Button */}
      <button
        onClick={handleSignOut}
        className="mt-8 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
      >
        Sign Out
      </button>
    </div>
  );
} 