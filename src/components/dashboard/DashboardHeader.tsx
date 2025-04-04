import React from 'react';
import { Plus } from 'lucide-react';

interface DashboardHeaderProps {
    userName: string;
    onAddProspect: () => void;
}

/**
 * En-tête du tableau de bord avec titre et bouton d'action
 */
const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    userName,
    onAddProspect
}) => {
    return (
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Tableau de bord
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Bonjour {userName || 'Utilisateur'}, voici un aperçu de votre activité de relance.
                </p>
            </div>
            <button
                onClick={onAddProspect}
                className="gradient-button flex items-center px-4 py-2 rounded-lg transition-all duration-300 shadow-sm hover:shadow transform hover:-translate-y-0.5"
            >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un prospect
            </button>
        </div>
    );
};

export default DashboardHeader; 