"use client";

import { useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { HabitWithCompletion, HabitStatus } from '@/lib/types';

interface HabitItemProps {
  habit: HabitWithCompletion;
  onStatusChange: (habitId: number, status: 'success' | 'failed' | 'skipped') => void;
  onSelect: (habit: HabitWithCompletion) => void;
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

export function HabitItem({ habit, onStatusChange, onSelect }: HabitItemProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getStatusStyles = () => {
    switch (habit.status) {
      case 'success':
        return 'line-through text-green-500';
      case 'failed':
        return 'text-red-500';
      case 'skipped':
        return 'line-through text-gray-400';
      default:
        return 'text-gray-900';
    }
  };

  const getStatusIcon = () => {
    switch (habit.status) {
      case 'success':
        return (
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
        );
      case 'failed':
        return (
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      case 'skipped':
        return (
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
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusButtonStyles = () => {
    switch (habit.status) {
      case 'success':
        return 'bg-green-500 border-green-500';
      case 'failed':
        return 'bg-red-500 border-red-500';
      case 'skipped':
        return 'bg-gray-400 border-gray-400';
      default:
        return 'border-gray-300 hover:border-green-500';
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Don't select if clicking on the status button or menu
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onSelect(habit);
  };

  return (
    <div 
      className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-gray-200 transition-all cursor-pointer"
      onClick={handleClick}
    >
      {/* Quick Done Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onStatusChange(habit.id, habit.status === 'success' ? 'failed' : 'success');
        }}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${getStatusButtonStyles()}`}
      >
        {getStatusIcon()}
      </button>

      {/* Habit Name */}
      <span className={`flex-1 text-lg ${getStatusStyles()}`}>
        {habit.name}
      </span>

      {/* Status Menu */}
      <Menu as="div" className="relative">
        <Menu.Button
          className="p-1 rounded-full hover:bg-gray-100"
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
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
                  <MenuItem active={active} onClick={() => onStatusChange(habit.id, 'success')}>
                    ✓ Mark as Done
                  </MenuItem>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <MenuItem active={active} onClick={() => onStatusChange(habit.id, 'failed')}>
                    ✕ Mark as Failed
                  </MenuItem>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <MenuItem active={active} onClick={() => onStatusChange(habit.id, 'skipped')}>
                    ↷ Mark as Skipped
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