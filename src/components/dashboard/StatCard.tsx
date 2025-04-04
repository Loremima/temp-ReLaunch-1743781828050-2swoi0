import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface StatCardProps {
    icon: React.ElementType;
    title: string;
    value: string | number;
    color: 'blue' | 'green' | 'yellow' | 'indigo';
    trend?: { value: number; positive: boolean };
    description?: string;
}

/**
 * Affiche une carte de statistique avec une icône, un titre, une valeur et éventuellement une tendance
 */
const StatCard: React.FC<StatCardProps> = ({
    icon: Icon,
    title,
    value,
    color,
    trend,
    description
}) => {
    const gradients = {
        blue: 'from-blue-600 to-blue-700',
        green: 'from-green-500 to-green-600',
        yellow: 'from-yellow-500 to-amber-500',
        indigo: 'from-indigo-600 to-indigo-700'
    };

    const iconBackground = {
        blue: 'bg-blue-100 dark:bg-blue-900/30',
        green: 'bg-green-100 dark:bg-green-900/30',
        yellow: 'bg-yellow-100 dark:bg-yellow-900/30',
        indigo: 'bg-indigo-100 dark:bg-indigo-900/30'
    };

    const iconColor = {
        blue: 'text-blue-600 dark:text-blue-400',
        green: 'text-green-600 dark:text-green-400',
        yellow: 'text-yellow-600 dark:text-yellow-400',
        indigo: 'text-indigo-600 dark:text-indigo-400'
    };

    return (
        <div className="bg-white dark:stat-card group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex flex-col p-6">
                <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-lg ${iconBackground[color]}`}>
                        <Icon className={`h-6 w-6 ${iconColor[color]}`} />
                    </div>
                    <h3 className="ml-3 text-sm font-medium text-gray-500 dark:text-gray-300">{title}</h3>
                </div>

                <div className="flex items-end justify-between">
                    <div className="flex flex-col">
                        <span className={`text-3xl font-bold bg-gradient-to-r ${gradients[color]} bg-clip-text text-transparent`}>
                            {value}
                        </span>
                        {trend && (
                            <div className="flex items-center mt-1 text-sm">
                                {trend.positive ? (
                                    <ArrowUpRight className="h-3.5 w-3.5 text-green-500 dark:text-green-400 mr-1" />
                                ) : (
                                    <ArrowUpRight className="h-3.5 w-3.5 text-red-500 dark:text-red-400 mr-1 transform rotate-90" />
                                )}
                                <span className={trend.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                    {trend.value}%
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {description && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{description}</p>
                )}
            </div>
            <div className={`h-1 w-full bg-gradient-to-r ${gradients[color]} transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300`}></div>
        </div>
    );
};

export default StatCard;