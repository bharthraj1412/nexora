import { useEffect, useState } from 'react';
import { FiActivity, FiFilter } from 'react-icons/fi';
import { api } from '../utils/api';
import { ActivityLog } from '../types';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { formatDateTime, formatRelative } from '../utils/format';

export default function ActivityPage() {
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [entityTypeFilter, setEntityTypeFilter] = useState('');
    const [actionFilter, setActionFilter] = useState('');

    useEffect(() => {
        fetchActivities();
    }, [entityTypeFilter, actionFilter]);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (entityTypeFilter) params.append('entity_type', entityTypeFilter);
            if (actionFilter) params.append('action', actionFilter);

            const { data } = await api.get(`/activity?${params.toString()}`);

            // Sort by most recent first (created_at descending)
            const sortedData = (data || []).sort((a: ActivityLog, b: ActivityLog) => {
                const dateA = new Date(a.created_at).getTime();
                const dateB = new Date(b.created_at).getTime();
                return dateB - dateA; // Most recent first
            });

            setActivities(sortedData);
        } catch (error) {
            setActivities([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner size="lg" />;
    }

    const actionColors: Record<string, string> = {
        created: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
        updated: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
        deleted: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    History
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    View all changes to your folders and items
                </p>
            </div>

            <Card className="p-4">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <FiFilter className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Filters:
                        </span>
                    </div>

                    <select
                        value={entityTypeFilter}
                        onChange={(e) => setEntityTypeFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                    >
                        <option value="">All Types</option>
                        <option value="collection">Folders</option>
                        <option value="record">Items</option>
                    </select>

                    <select
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                    >
                        <option value="">All Actions</option>
                        <option value="created">Created</option>
                        <option value="updated">Updated</option>
                        <option value="deleted">Deleted</option>
                    </select>

                    {(entityTypeFilter || actionFilter) && (
                        <button
                            onClick={() => {
                                setEntityTypeFilter('');
                                setActionFilter('');
                            }}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            </Card>

            {activities.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={<FiActivity className="w-16 h-16" />}
                        title="No activity yet"
                        description="Actions you take will appear here"
                    />
                </Card>
            ) : (
                <Card>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {activities.map((activity) => (
                            <div key={activity.id} className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`badge ${actionColors[activity.action] || 'badge-primary'}`}>
                                                {activity.action}
                                            </span>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {activity.entity_type}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-900 dark:text-white mb-1">
                                            Entity ID: <span className="font-mono text-xs">{activity.entity_id}</span>
                                        </p>

                                        {activity.changes && (
                                            <details className="mt-3">
                                                <summary className="text-sm text-primary-600 dark:text-primary-400 cursor-pointer hover:underline">
                                                    View changes
                                                </summary>
                                                <pre className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs overflow-auto">
                                                    {JSON.stringify(activity.changes, null, 2)}
                                                </pre>
                                            </details>
                                        )}
                                    </div>

                                    <div className="text-right ml-4">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {activity.created_at ? formatDateTime(activity.created_at) : 'Time unavailable'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {activity.created_at ? formatRelative(activity.created_at) : ''}
                                        </p>
                                        {activity.ip_address && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                IP: {activity.ip_address}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}
