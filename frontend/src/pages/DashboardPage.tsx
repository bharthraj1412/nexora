import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiFolder, FiFile, FiActivity, FiTrendingUp, FiPlus } from 'react-icons/fi';
import { useCollectionStore } from '../store/collectionStore';
import { useOnboardingStore } from '../store/onboardingStore';
import { api } from '../utils/api';
import { ActivityLog } from '../types';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import FirstTimeWalkthrough from '../components/onboarding/FirstTimeWalkthrough';
import { formatRelative } from '../utils/format';

export default function DashboardPage() {
    const { collections, fetchCollections } = useCollectionStore();
    const { hasSeenWalkthrough, completeWalkthrough } = useOnboardingStore();
    const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                await fetchCollections();
                const { data } = await api.get('/activity?limit=5');
                setRecentActivity(data);
            } catch (error) {
                // Error handled
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [fetchCollections]);

    if (loading) {
        return <LoadingSpinner size="lg" />;
    }

    const totalRecords = collections.reduce((sum, c) => sum + (c.record_count || 0), 0);

    const stats = [
        {
            name: 'Total Folders',
            value: collections.length,
            icon: FiFolder,
            color: 'bg-primary-500',
        },
        {
            name: 'Total Items',
            value: totalRecords,
            icon: FiFile,
            color: 'bg-secondary-500',
        },
        {
            name: 'Recent Changes',
            value: recentActivity.length,
            icon: FiActivity,
            color: 'bg-green-500',
        },
    ];

    return (
        <>
            {!hasSeenWalkthrough && (
                <FirstTimeWalkthrough onComplete={completeWalkthrough} />
            )}

            <div className="space-y-8 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Dashboard
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Overview of your workspace
                        </p>
                    </div>
                    <Link to="/folders">
                        <button className="btn btn-primary flex items-center gap-2">
                            <FiPlus />
                            New Folder
                        </button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat) => (
                        <Card key={stat.name} className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {stat.name}
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                        {stat.value}
                                    </p>
                                </div>
                                <div className={`${stat.color} p - 4 rounded - xl`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Recent Folders
                        </h2>
                        {collections.length === 0 ? (
                            <div className="text-center py-8">
                                <FiFolder className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600 dark:text-gray-400 mb-2">
                                    No folders yet
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    Create your first folder to start organizing your information
                                </p>
                                <Link to="/folders">
                                    <button className="btn btn-primary">
                                        Create Your First Folder
                                    </button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {collections.slice(0, 5).map((collection: any) => (
                                    <Link
                                        key={collection.id}
                                        to={`/ folders / ${collection.id} `}
                                        className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                                                    <FiFolder className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900 dark:text-white">
                                                        {collection.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {collection.record_count || 0} items
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </Card>

                    <Card className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Recent Activity
                        </h2>
                        {recentActivity.length === 0 ? (
                            <div className="text-center py-8">
                                <FiActivity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600 dark:text-gray-400">
                                    No recent activity
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentActivity.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex items-start gap-3 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
                                    >
                                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                                            <FiActivity className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-900 dark:text-white">
                                                {activity.action} {activity.entity_type}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatRelative(activity.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </>
    );
}
