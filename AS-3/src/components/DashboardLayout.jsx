import { Outlet, NavLink, Link } from 'react-router-dom';
import ChatBot from '../features/chatbot/Chatbot';

const DashboardLayout = () => {
    const navClasses = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
            ? 'bg-green-700 text-white shadow-md translate-x-1'
            : 'text-green-100 hover:bg-green-800 hover:text-white'
        }`;

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-gray-800">

            {/* 1. FIXED SIDEBAR */}
            <aside className="w-64 bg-green-900 text-white flex flex-col shadow-2xl z-20">
                <div className="p-6 border-b border-green-800">
                    <h2 className="text-3xl font-extrabold tracking-tight">Agri-Dash</h2>
                    <p className="text-green-300 text-sm mt-1 font-medium">Farm Management System</p>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-grow p-4 space-y-2 mt-4">
                    <NavLink to="/gamification" className={navClasses}>
                        <span className="text-xl">🏆</span>
                        <span className="font-medium tracking-wide">Rewards Program</span>
                    </NavLink>

                    <NavLink to="/resources" className={navClasses}>
                        <span className="text-xl">🚜</span>
                        <span className="font-medium tracking-wide">Equipment Hub</span>
                    </NavLink>
                </nav>

                <div className="p-4 border-t border-green-800 text-sm text-green-300 flex items-center justify-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    System Online
                </div>
            </aside>

            {/* 2. MAIN CONTENT WRAPPER */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* TOP HEADER */}
                <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex justify-between items-center z-10">
                    <h1 className="text-2xl font-bold text-gray-700">
                        Dashboard Overview
                    </h1>

                    <div className="flex items-center gap-4">
                        <button className="text-gray-400 hover:text-green-600 transition-colors">
                            🔔
                        </button>

                        {/* Clickable Profile Avatar */}
                        <Link to="/profile" className="hover:opacity-80 transition-opacity">
                            <div className="h-10 w-10 rounded-full border-2 border-green-600 overflow-hidden bg-green-100 flex items-center justify-center shadow-sm">
                                <img
                                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Farmer"
                                    alt="Profile"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </Link>
                    </div>
                </header>

                {/* 3. SCROLLABLE PAGE CONTENT */}
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>

            </div>

            {/* FLOATING CHATBOT WIDGET */}
            <ChatBot />

        </div>
    );
};

export default DashboardLayout;