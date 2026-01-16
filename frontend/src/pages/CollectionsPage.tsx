import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiFolder, FiEdit2, FiTrash2, FiUpload } from 'react-icons/fi';
import { useCollectionStore } from '../store/collectionStore';
import { getTemplateById } from '../utils/templates';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import TemplatePicker from '../components/templates/TemplatePicker';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import FileUpload from '../components/import/FileUpload';
import ImportPreview from '../components/import/ImportPreview';
import { formatDateTime } from '../utils/format';

export default function CollectionsPage() {
    const navigate = useNavigate();
    const { collections, isLoading, fetchCollections, createCollection, updateCollection, deleteCollection } = useCollectionStore();
    const [showTemplatePicker, setShowTemplatePicker] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Derived state for modals
    const isCreateModalOpen = showModal && !editingId;
    const isEditModalOpen = showModal && !!editingId;

    // Import state
    const [showFileUpload, setShowFileUpload] = useState(false);
    const [showImportPreview, setShowImportPreview] = useState(false);
    const [importData, setImportData] = useState<any>(null);
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        fetchCollections();
    }, [fetchCollections]);

    const handleTemplateSelect = async (categoryId: string, templateId: string) => {
        const template = getTemplateById(categoryId, templateId);
        if (!template) return;

        setSubmitting(true);
        try {
            await createCollection(template.name, template.description, template.fields, template.exampleItems);
            setShowTemplatePicker(false);
        } catch (error) {
            // Error handled
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId) {
                await updateCollection(editingId, name, description);
            } else {
                await createCollection(name, description, undefined, undefined);
            }
            handleClose();
        } catch (error) {
            // Error handled in store
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (collection: any) => {
        setEditingId(collection.id);
        setName(collection.name);
        setDescription(collection.description || '');
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this collection?')) {
            await deleteCollection(id);
        }
    };

    const handleClose = () => {
        setShowModal(false);
        setEditingId(null);
        setName('');
        setDescription('');
    };

    // File import handlers
    const handleFileSelected = async (file: File) => {
        // Store file reference for later use in confirmation
        setImportData({ file });
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const { data } = await api.post('/import/preview', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Store preview data but keep file reference
            setImportData(prev => ({ ...prev, ...data }));
            setShowFileUpload(false);
            setShowImportPreview(true);
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to process file');
            setImportData(null); // Clear on fail
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirmImport = async (folderName: string, folderDescription: string, editedSchema: any) => {
        if (!importData?.file) return;

        setImporting(true);
        try {
            const formData = new FormData();
            formData.append('folder_name', folderName);
            formData.append('description', folderDescription);
            formData.append('schema', JSON.stringify(editedSchema)); // Send renamed schema
            formData.append('file', importData.file); // Re-upload file for streaming

            // Use new upload endpoint
            const { data } = await api.post('/import/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success(data.message);
            setShowImportPreview(false);
            setImportData(null);

            // Refresh collections
            await fetchCollections();

            // Navigate to new folder
            navigate(`/folders/${data.collection_id}`);
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to import file');
        } finally {
            setImporting(false);
        }
    };

    const handleCancelImport = () => {
        setShowImportPreview(false);
        setImportData(null);
    };

    if (isLoading) {
        return <LoadingSpinner size="lg" />;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        My Folders
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Organize your information into folders
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => setShowFileUpload(true)} variant="secondary" className="flex items-center gap-2">
                        <FiUpload />
                        Import File
                    </Button>
                    <Button onClick={() => setShowTemplatePicker(true)} className="flex items-center gap-2">
                        <FiPlus />
                        New Folder
                    </Button>
                </div>
            </div>


            {collections.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={<FiFolder className="w-16 h-16" />}
                        title="No folders yet"
                        description="Create your first folder or import data from a file to get started!"
                        action={
                            <div className="flex gap-3">
                                <Button onClick={() => setShowFileUpload(true)} variant="secondary" className="flex items-center gap-2">
                                    <FiUpload />
                                    Import File
                                </Button>
                                <Button onClick={() => setShowTemplatePicker(true)} className="flex items-center gap-2">
                                    <FiPlus />
                                    Create My First Folder
                                </Button>
                            </div>
                        }
                    />
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {collections.map((collection) => (
                        <Card key={collection.id} hover>
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
                                        <FiFolder className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(collection)}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        >
                                            <FiEdit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(collection.id)}
                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <FiTrash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                        </button>
                                    </div>
                                </div>

                                <Link to={`/collections/${collection.id}`}>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                        {collection.name}
                                    </h3>
                                </Link>

                                {collection.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                        {collection.description}
                                    </p>
                                )}

                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {collection.record_count || 0} items
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            <span className="font-medium">Created:</span> {formatDateTime(collection.created_at)}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            <span className="font-medium">Updated:</span> {formatDateTime(collection.updated_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )
            }

            {
                showTemplatePicker && (
                    <TemplatePicker
                        onSelect={handleTemplateSelect}
                        onClose={() => setShowTemplatePicker(false)}
                    />
                )
            }
            {/* Create/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={handleClose}
                title={editingId ? 'Edit Folder' : 'Create New Folder'}
            >
                <div className="space-y-6">
                    {!editingId && (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Have a file?</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Import CSV or Excel files to create a folder instantly.
                                    </p>
                                </div>
                                <Button
                                    onClick={() => {
                                        handleClose();
                                        setShowFileUpload(true);
                                    }}
                                    variant="secondary"
                                    size="sm"
                                    className="flex items-center gap-2"
                                >
                                    <FiUpload />
                                    Import File
                                </Button>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Folder Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. My Documents"
                            required
                        />
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                Description <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="input min-h-[80px] py-2"
                                placeholder="What's in this folder?"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                isLoading={submitting}
                            >
                                {editingId ? 'Save Changes' : 'Create Folder'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* File Import Modals */}
            <FileUpload
                isOpen={showFileUpload}
                onFileSelected={handleFileSelected}
                onCancel={() => setShowFileUpload(false)}
            />

            {
                showImportPreview && importData?.schema && (
                    <ImportPreview
                        isOpen={showImportPreview}
                        folderName={importData.folder_name}
                        totalRows={importData.total_rows}
                        totalColumns={importData.total_columns}
                        schema={importData.schema}
                        preview={importData.preview}
                        records={importData.records || []}
                        onConfirm={handleConfirmImport}
                        onCancel={handleCancelImport}
                        isLoading={importing}
                    />
                )
            }
        </div >
    );
}
