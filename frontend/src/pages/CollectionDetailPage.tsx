import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { useCollectionStore } from '../store/collectionStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import DynamicForm from '../components/forms/DynamicForm';
import { formatDateTime } from '../utils/format';

export default function CollectionDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentCollection, records, isLoading, fetchCollection, fetchRecords, createRecord, updateRecord, deleteRecord } = useCollectionStore();
    const [showModal, setShowModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (id) {
            fetchCollection(id);
            fetchRecords(id);
        }
    }, [id, fetchCollection, fetchRecords]);

    const handleSubmit = async (data: Record<string, any>) => {
        setSubmitting(true);
        try {
            if (editingRecord) {
                await updateRecord(id!, editingRecord.id, data);
            } else {
                await createRecord(id!, data);
            }
            handleClose();
        } catch (error) {
            // Error handled
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (record: any) => {
        setEditingRecord(record);
        setShowModal(true);
    };

    const handleDelete = async (recordId: string) => {
        if (confirm('Are you sure you want to delete this item?')) {
            await deleteRecord(id!, recordId);
        }
    };

    const handleClose = () => {
        setShowModal(false);
        setEditingRecord(null);
    };

    const handleCreateExample = async (exampleData: any) => {
        await createRecord(id!, exampleData);
    };

    if (isLoading) {
        return <LoadingSpinner size="lg" />;
    }

    if (!currentCollection) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">Folder not found</p>
                <Link to="/folders">
                    <Button className="mt-4">Back to Folders</Button>
                </Link>
            </div>
        );
    }

    const fields = currentCollection.schema?.fields || [];
    const hasFields = fields.length > 0;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/folders')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                    <FiArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {currentCollection.name}
                    </h1>
                    {currentCollection.description && (
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {currentCollection.description}
                        </p>
                    )}
                </div>
                {hasFields && (
                    <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
                        <FiPlus />
                        Add Item
                    </Button>
                )}
            </div>

            {!hasFields && (
                <Card className="p-8 text-center bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800">
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                        This folder doesn't have any fields defined yet.
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        This folder was created without a template. You can still use it, but you'll need to manually enter JSON data.
                    </p>
                </Card>
            )}

            {records.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={<FiEdit2 className="w-16 h-16" />}
                        title="No items yet"
                        description={hasFields ? "Add your first item to this folder. Just fill in the form - it's easy!" : "Create items using the button below."}
                        action={
                            hasFields ? (
                                <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
                                    <FiPlus />
                                    Add My First Item
                                </Button>
                            ) : undefined
                        }
                    />
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {records.map((record) => (
                        <Card key={record.id} hover>
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        {fields.map((field: any) => {
                                            const value = record.data[field.name];
                                            if (!value) return null;

                                            return (
                                                <div key={field.name} className="mb-3">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                                        {field.label}
                                                    </p>
                                                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                                                        {field.type === 'date' ? new Date(value).toLocaleDateString() : value}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="flex gap-1 ml-2">
                                        <button
                                            onClick={() => handleEdit(record)}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        >
                                            <FiEdit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(record.id)}
                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <FiTrash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        <span className="font-medium">Created:</span> {formatDateTime(record.created_at)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        <span className="font-medium">Updated:</span> {formatDateTime(record.updated_at)}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {hasFields && (
                <Modal
                    isOpen={showModal}
                    onClose={handleClose}
                    title={editingRecord ? 'Edit Item' : 'Add New Item'}
                    size="lg"
                >
                    <DynamicForm
                        fields={fields}
                        onSubmit={handleSubmit}
                        onCancel={handleClose}
                        isSubmitting={submitting}
                        initialData={editingRecord?.data || {}}
                    />
                </Modal>
            )}
        </div>
    );
}
