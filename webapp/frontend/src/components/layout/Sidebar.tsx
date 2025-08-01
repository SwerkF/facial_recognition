'use client';

import React, { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import {
    BarChart2,
    Bell,
    Bookmark,
    ChevronLeft,
    HelpCircle,
    LayoutGrid,
    MessageCircle,
    Rocket,
    Settings,
    Users,
} from 'lucide-react';

interface SidebarItem {
    icon: React.ReactNode;
    label: string;
    href: string;
}

export default function Sidebar() {
    const [isExpanded, setIsExpanded] = useState(true);

    const menuItems: SidebarItem[] = [
        { icon: <LayoutGrid size={20} />, label: 'Dashboard', href: '#' },
        { icon: <BarChart2 size={20} />, label: 'Analytics', href: '#' },
        { icon: <Users size={20} />, label: 'Customers', href: '#' },
        { icon: <MessageCircle size={20} />, label: 'Chats', href: '#' },
        { icon: <Bookmark size={20} />, label: 'Subscriptions', href: '#' },
        { icon: <Bell size={20} />, label: 'Notification', href: '#' },
        { icon: <HelpCircle size={20} />, label: 'Support', href: '#' },
        { icon: <Settings size={20} />, label: 'Settings', href: '#' },
    ];

    return (
        <motion.div
            animate={{ width: isExpanded ? '240px' : '70px' }}
            transition={{ duration: 0.3 }}
            className="relative flex h-screen flex-col bg-gradient-to-b from-[#0A0A29] to-[#0A0A1F] p-4 text-white"
        >
            {/* Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="absolute -right-3 top-8 rounded-full bg-blue-600 p-1.5 text-white transition-colors hover:bg-blue-700"
            >
                <motion.div
                    animate={{ rotate: isExpanded ? 0 : 180 }}
                    transition={{ duration: 0.3 }}
                >
                    <ChevronLeft size={16} />
                </motion.div>
            </button>

            {/* Profile Section */}
            <div className="mb-8 flex items-center gap-4">
                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg">
                    <img src="" alt="Profile" className="h-full w-full object-cover" />
                </div>
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col"
                        >
                            <div className="flex items-center gap-1">
                                <span className="font-semibold">Hello</span>
                                <span className="text-yellow-500">👋</span>
                            </div>
                            <span className="text-sm text-gray-300">Dhrumin S.</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => (
                    <a
                        key={item.label}
                        href={item.href}
                        className="group flex items-center gap-4 rounded-lg p-2 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                    >
                        <span className="flex-shrink-0 transition-colors group-hover:text-blue-400">
                            {item.icon}
                        </span>
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="whitespace-nowrap text-sm"
                                >
                                    {item.label}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </a>
                ))}
            </nav>

            {/* Pro Access Button */}
            <AnimatePresence mode="wait">
                {isExpanded ? (
                    <motion.div
                        key="expanded"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 p-4"
                    >
                        <h3 className="mb-1 font-semibold">Become Pro Access</h3>
                        <p className="mb-3 text-sm text-blue-100">
                            Try your experience for using more features.
                        </p>
                        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50">
                            <Rocket size={16} />
                            Upgrade Pro
                        </button>
                    </motion.div>
                ) : (
                    <motion.button
                        key="collapsed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex w-full items-center justify-center rounded-lg bg-blue-600 p-2 transition-colors hover:bg-blue-700"
                    >
                        <Rocket size={20} />
                    </motion.button>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
