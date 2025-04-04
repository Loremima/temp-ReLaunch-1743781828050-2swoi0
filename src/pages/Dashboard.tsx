import React from 'react';
import { HiPlus, HiRefresh, HiUsers } from 'react-icons/hi';
import { useAuth } from '../contexts/AuthContext';
import { useDashboard } from '../hooks';
import StatCard from '../components/dashboard/StatCard';
import ActivityChart from '../components/dashboard/ActivityChart';
import UpcomingFollowups from '../components/dashboard/UpcomingFollowups';
import ConversionRates from '../components/dashboard/ConversionRates';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    stats,
    chartData,
    loading,
    error,
    upcomingFollowups,
    fetchDashboardData,
    conversionRate
  } = useDashboard();

  // Gérer les erreurs
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Tableau de bord</h1>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-900/30">
            <p className="text-red-700 dark:text-red-400">
              {error}
              <button
                onClick={() => fetchDashboardData()}
                className="ml-2 text-red-600 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 underline"
              >
                Réessayer
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Afficher un loader pendant le chargement des données
  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Gérer l'ajout d'un prospect
  const handleAddProspect = () => {
    navigate('/prospects/add');
  };

  return (
    <div className="container mx-auto p-6">
      {/* En-tête du tableau de bord */}
      <DashboardHeader
        userName={user?.user_metadata?.name || 'utilisateur'}
        onAddProspect={handleAddProspect}
      />

      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard
          icon={HiUsers}
          title="Prospects actifs"
          value={stats.activeProspects}
          color="blue"
          trend={stats.prospectsChange ? { value: Math.abs(stats.prospectsChange), positive: stats.prospectsChange >= 0 } : undefined}
          description="Prospects en attente de réponse"
        />
        <StatCard
          icon={HiRefresh}
          title="Taux de réponse"
          value={`${stats.responseRate.toFixed(1)}%`}
          color="green"
          trend={stats.responseRateChange ? { value: Math.abs(stats.responseRateChange), positive: stats.responseRateChange >= 0 } : undefined}
          description="Basé sur votre historique d'envoi"
        />
        <StatCard
          icon={HiPlus}
          title="Relances en attente"
          value={stats.pendingFollowups}
          color="yellow"
          trend={stats.pendingFollowupsChange ? { value: Math.abs(stats.pendingFollowupsChange), positive: stats.pendingFollowupsChange >= 0 } : undefined}
          description="Relances prévues aujourd'hui"
        />
      </div>

      {/* Graphiques et informations complémentaires */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique d'activité */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Activité des 7 derniers jours</h2>
          <ActivityChart data={chartData} />
        </div>

        {/* Relances à venir */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <UpcomingFollowups
            prospects={upcomingFollowups}
            onViewAll={() => navigate('/prospects?filter=followup')}
          />
        </div>

        {/* Taux de conversion */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mt-6">
          <ConversionRates
            openRate={stats.openRate}
            clickRate={stats.clickRate}
            conversionRate={conversionRate}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;