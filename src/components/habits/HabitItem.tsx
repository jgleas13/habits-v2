import { useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export interface Habit {
  id: number;
  name: string;
  done: boolean;
  user_id: string;
  created_at: string;
}

interface HabitItemProps {
  habit: Habit;
  onStatusChange: (habit: Habit, done: boolean) => void;
}

interface MenuItemProps {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}

const MenuItem = ({ active, children, onClick }: MenuItemProps) => (
  <button
    onClick={onClick}
    className={`${
      active ? 'bg-gray-100' : ''
    } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
  >
    {children}
  </button>
);

export function HabitItem({ habit, onStatusChange }: HabitItemProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getStatusStyles = () => {
    return habit.done ? 'line-through text-gray-500' : 'text-gray-900';
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-gray-200 transition-all">
      {/* Quick Done Button */}
      <button
        onClick={() => onStatusChange(habit, !habit.done)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          habit.done
            ? 'bg-green-500 border-green-500'
            : 'border-gray-300 hover:border-green-500'
        }`}
      >
        {habit.done && (
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </button>

      {/* Habit Name */}
      <span className={`flex-1 text-lg ${getStatusStyles()}`}>
        {habit.name}
      </span>

      {/* Status Menu - Simplified for done/not done */}
      <Menu as="div" className="relative">
        <Menu.Button
          className="p-1 rounded-full hover:bg-gray-100"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="w-6 h-6 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <MenuItem active={active} onClick={() => onStatusChange(habit, true)}>
                    ✓ Mark as Done
                  </MenuItem>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <MenuItem active={active} onClick={() => onStatusChange(habit, false)}>
                    ✕ Mark as Not Done
                  </MenuItem>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
} 