import React from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield,
  Bell,
  Mail,
  User,
  HelpCircle,
  Globe,
  Palette,
  Moon,
  Sun,
  Clock,
  Languages,
  Link as LinkIcon,
  Users,
  ChevronLeft
} from 'lucide-react';

import EmailSettings from './Settings/EmailSettings';
import NotificationSettings from './Settings/NotificationSettings';
import AccountSettings from './Settings/AccountSettings';
import TeamSettings from './Settings/TeamSettings';
import ApiIntegration from './Settings/ApiIntegration';
import GeneralSettings from './Settings/GeneralSettings';
import HelpSettings from './Settings/HelpSettings';

const settingsSections = [
  {
    id: 'general',
    name: 'Général',
    icon: Shield,
    href: '/app/settings',
    description: 'Langue, fuseau horaire, thème et préférences générales'
  },
  {
    id: 'account',
    name: 'Compte & Facturation',
    icon: User,
    href: '/app/settings/account',
    description: 'Gérez votre profil et vos informations de facturation'
  },
  {
    id: 'team',
    name: 'Équipe',
    icon: Users,
    href: '/app/settings/team',
    description: 'Gérez les membres de votre équipe et leurs permissions'
  },
  {
    id: 'email',
    name: 'Email',
    icon: Mail,
    href: '/app/settings/email',
    description: 'Configuration des services d\'envoi d\'emails'
  },
  {
    id: 'integrations',
    name: 'Intégrations',
    icon: LinkIcon,
    href: '/app/settings/integrations',
    description: 'API, webhooks et services connectés'
  },
  {
    id: 'notifications',
    name: 'Notifications',
    icon: Bell,
    href: '/app/settings/notifications',
    description: 'Gérez vos préférences de notifications'
  },
  {
    id: 'help',
    name: 'Aide & Support',
    icon: HelpCircle,
    href: '/app/settings/help',
    description: 'Documentation et ressources d\'aide'
  }
];

export default function Settings() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div>
      {/* Header with back button */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => navigate('/app/dashboard')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Paramètres</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez vos préférences et configurez votre compte
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-8">
        {/* Settings Navigation */}
        <div className="col-span-1">
          <nav className="space-y-2">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              const isActive = location.pathname === section.href ||
                (section.href !== '/app/settings' && location.pathname.startsWith(section.href));

              return (
                <Link
                  key={section.id}
                  to={section.href}
                  className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'hover:bg-blue-50/50'
                    }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-blue-600 group-hover:text-blue-700'}`} />
                  <div className="ml-3 flex-1">
                    <p className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-900'}`}>
                      {section.name}
                    </p>
                    <p className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                      {section.description}
                    </p>
                  </div>
                  <ChevronLeft className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-400'
                    } opacity-0 group-hover:opacity-100 transition-opacity transform rotate-180`} />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="col-span-3">
          <Routes>
            <Route path="/" element={<GeneralSettings />} />
            <Route path="/account" element={<AccountSettings />} />
            <Route path="/team" element={<TeamSettings />} />
            <Route path="/email" element={<EmailSettings />} />
            <Route path="/integrations" element={<ApiIntegration />} />
            <Route path="/notifications" element={<NotificationSettings />} />
            <Route path="/help" element={<HelpSettings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}