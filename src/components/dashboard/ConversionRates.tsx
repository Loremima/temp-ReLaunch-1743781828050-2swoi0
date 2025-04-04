import React from 'react';
import { TrendingUp } from 'lucide-react';

interface ConversionRatesProps {
    openRate: number;
    clickRate: number;
    conversionRate: number;
}

/**
 * Affiche les statistiques de performance des emails (taux d'ouverture, de clic et de conversion)
 */
const ConversionRates: React.FC<ConversionRatesProps> = ({
    openRate,
    clickRate,
    conversionRate
}) => {
    return (
        <div className="blue-gradient-card p-6 text-white">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Performance des relances
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-2">
                <div className="text-center p-3 bg-white/10 backdrop-blur-sm rounded-lg">
                    <p className="text-sm opacity-80 mb-1">Taux d'ouverture</p>
                    <p className="text-2xl font-bold">{openRate}%</p>
                </div>
                <div className="text-center p-3 bg-white/10 backdrop-blur-sm rounded-lg">
                    <p className="text-sm opacity-80 mb-1">Taux de clic</p>
                    <p className="text-2xl font-bold">{clickRate}%</p>
                </div>
            </div>

            <div className="text-center p-3 bg-white/10 backdrop-blur-sm rounded-lg">
                <p className="text-sm opacity-80 mb-1">Taux de conversion</p>
                <p className="text-2xl font-bold">{conversionRate}%</p>
            </div>

            <div className="mt-4 text-sm text-blue-100">
                Analyse basée sur votre historique d'envois
            </div>
        </div>
    );
};

export default ConversionRates; 