import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ChartData, DashboardStats } from '../types';

export function useDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    activeProspects: 0,
    responseRate: 0,
    pendingFollowups: 0,
    totalEmails: 0,
    openRate: 0,
    clickRate: 0,
    prospectsChange: undefined,
    responseRateChange: undefined,
    pendingFollowupsChange: undefined,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upcomingFollowups, setUpcomingFollowups] = useState<any[]>([]);

  // Chargement des données du tableau de bord
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Récupération des données du tableau de bord depuis Supabase
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Récupération du nombre de prospects actifs
      const { count: activeProspects, error: prospectsError } = await supabase
        .from('prospects')
        .select('id', { count: 'exact' })
        .eq('status', 'Pending')
        .eq('user_id', user?.id);

      if (prospectsError) {
        throw prospectsError;
      }

      // Récupération du taux de réponse
      const { data: historyData, error: historyError } = await supabase
        .from('history')
        .select('status, prospect_id, prospects!inner(user_id)')
        .eq('prospects.user_id', user?.id);

      if (historyError) {
        throw historyError;
      }

      const totalEmails = historyData?.length || 0;
      const responses = historyData?.filter(h => h.status === 'Responded').length || 0;
      const responseRate = totalEmails > 0 ? (responses / totalEmails) * 100 : 0;

      // Récupération des relances en attente
      const { count: pendingFollowups, error: pendingError } = await supabase
        .from('prospects')
        .select('id', { count: 'exact' })
        .eq('status', 'Pending')
        .eq('user_id', user?.id)
        .lte('next_followup', format(new Date(), 'yyyy-MM-dd'));

      if (pendingError) {
        throw pendingError;
      }

      // Calcul des données du graphique pour les 7 derniers jours
      const chartDataPromises = Array.from({ length: 7 }).map(async (_, i) => {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        const { data: dayData, error: dayError } = await supabase
          .from('history')
          .select('status, prospects!inner(user_id)')
          .eq('prospects.user_id', user?.id)
          .gte('sent_at', `${date}T00:00:00`)
          .lt('sent_at', `${date}T23:59:59`);

        if (dayError) {
          return {
            date,
            emails: 0,
            responses: 0
          };
        }

        return {
          date,
          emails: dayData?.length || 0,
          responses: dayData?.filter(h => h.status === 'Responded').length || 0
        };
      });

      const chartData = await Promise.all(chartDataPromises);

      // Calcul des métriques d'email (pour l'instant, valeurs par défaut)
      const openRate = totalEmails > 0 ? Math.round((responses * 1.5) / totalEmails * 100) : 0;
      const clickRate = totalEmails > 0 ? Math.round(responses / totalEmails * 100) : 0;

      setStats({
        activeProspects: activeProspects || 0,
        responseRate,
        pendingFollowups: pendingFollowups || 0,
        totalEmails,
        openRate,
        clickRate,
        prospectsChange: undefined,
        responseRateChange: undefined,
        pendingFollowupsChange: undefined,
      });

      setChartData(chartData.reverse());

      // Récupération des prospects avec des relances à venir
      const { data: followups, error: followupsError } = await supabase
        .from('prospects')
        .select('id, name, email, project, next_followup')
        .eq('user_id', user?.id)
        .eq('status', 'Pending')
        .order('next_followup', { ascending: true })
        .limit(3);

      if (followupsError) {
        console.error("Error fetching upcoming followups:", followupsError);
      } else {
        setUpcomingFollowups(followups || []);
      }

      setError(null);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError('Erreur lors de la récupération des données du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  // Calcul du taux de conversion à partir des données du graphique
  const calculateConversionRate = () => {
    const totalEmails = chartData.reduce((sum, day) => sum + day.emails, 0);
    const totalResponses = chartData.reduce((sum, day) => sum + day.responses, 0);
    
    return totalResponses > 0 ? Math.round((totalResponses / totalEmails) * 100) : 0;
  };

  return {
    stats,
    chartData,
    loading,
    error,
    upcomingFollowups,
    fetchDashboardData,
    conversionRate: calculateConversionRate()
  };
} 