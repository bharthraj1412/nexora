import { useState, useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiEdit2 } from 'react-icons/fi';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Card from '../ui/Card';

interface ImportPreviewProps {
    folderName: string;
    totalRows: number;
    totalColumns: number;
    schema: {
        fields: Array<{
            name: string;
            label: string;
            type: string;
            required: boolean;
        }>;
    };
    preview: Array<Record<string, any>>;
    records?: Array<Record<string, any>>;
    onConfirm: (folderName: string, description: string, editedSchema: any) => void;
    onCancel: () => void;
    isOpen: boolean;
    isLoading?: boolean;
}

export default function ImportPreview({
    folderName,
    totalRows,
    totalColumns,
    schema,
    preview,
    records,
    onConfirm,
    onCancel,
    isOpen,
    isLoading = false
}: ImportPreviewProps) {
    const [editedFolderName, setEditedFolderName] = useState(folderName);
    const [description, setDescription] = useState('');
    const [editedSchema, setEditedSchema] = useState(schema);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [hasValidationErrors, setHasValidationErrors] = useState(false);

    // Validate field names
    useEffect(() => {
        const errors: Record<string, string> = {};
        const labels = editedSchema.fields.map(f => f.label.trim().toLowerCase());

        editedSchema.fields.forEach((field, index) => {
            const trimmed = field.label.trim();

            // Check for empty
            if (!trimmed) {
                errors[field.name] = 'Name cannot be empty';
            }
            // Check for duplicates
            else if (labels.filter(l => l === trimmed.toLowerCase()).length > 1) {
                errors[field.name] = 'Duplicate name';
            }
        });

        setFieldErrors(errors);
        setHasValidationErrors(Object.keys(errors).length > 0);
    }, [editedSchema]);

    const handleFieldLabelChange = (fieldName: string, newLabel: string) => {
        setEditedSchema({
            ...editedSchema,
            fields: editedSchema.fields.map(f =>
                f.name === fieldName ? { ...f, label: newLabel } : f
            )
        });
    };

    const handleConfirm = () => {
        if (hasValidationErrors || !editedFolderName.trim()) return;
        onConfirm(editedFolderName, description, editedSchema);
    };

    return (
        <Modal isOpen={isOpen} onClose={onCancel} title="Preview Import" size="xl">
            <div className="space-y-6">
                {/* Summary */}
                <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <FiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-green-900 dark:text-green-100">
                                File parsed successfully
                            </p>
                            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                                Found {totalRows} rows and {totalColumns} columns
                            </p>
                        </div>
                    </div>
                </div>

                {/* Folder Details */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Folder Name
                        </label>
                        <input
                            type="text"
                            value={editedFolderName}
                            onChange={(e) => setEditedFolderName(e.target.value)}
                            className="input"
                            placeholder="Enter folder name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Description (optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="input min-h-[80px]"
                            placeholder="Add a description for this folder"
                        />
                    </div>
                </div>

                {/* Editable Fields */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Column Headers ({editedSchema.fields.length})
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <FiEdit2 className="w-3 h-3" />
                            Click to rename
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {editedSchema.fields.map((field, index) => (
                            <div key={field.name} className="space-y-1">
                                <div className="flex items-start gap-2">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={field.label}
                                            onChange={(e) => handleFieldLabelChange(field.name, e.target.value)}
                                            className={`input text-sm ${fieldErrors[field.name]
                                                    ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                                                    : ''
                                                }`}
                                            placeholder="Column name"
                                        />
                                    </div>
                                    <div className="px-2 py-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-medium text-gray-600 dark:text-gray-400 capitalize whitespace-nowrap">
                                        {field.type}
                                    </div>
                                </div>
                                {fieldErrors[field.name] && (
                                    <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                        <FiAlertCircle className="w-3 h-3" />
                                        {fieldErrors[field.name]}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Preview Data */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Preview Data
                        </h3>
                        <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full">
                            Showing first {preview.length} of {totalRows} rows
                        </span>
                    </div>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto border border-gray-100 dark:border-gray-800 rounded-lg p-2 bg-gray-50/50 dark:bg-gray-800/50">
                        {preview.map((item, index) => (
                            <Card key={index} className="p-3 shadow-sm hover:shadow-md transition-shadow">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                                    {editedSchema.fields.slice(0, 6).map((field) => {
                                        const value = item[field.name];
                                        if (value === undefined || value === null || value === '') return null;

                                        return (
                                            <div key={field.name} className="min-w-0">
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold truncate">
                                                    {field.label}
                                                </p>
                                                <p className="text-sm text-gray-900 dark:text-gray-100 truncate font-medium">
                                                    {field.type === 'number' ? value : String(value)}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        ))}
                        {totalRows > preview.length && (
                            <div className="text-center py-2 text-xs text-gray-500 italic">
                                + {totalRows - preview.length} more rows will be imported
                            </div>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <FiAlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div className="text-sm text-blue-900 dark:text-blue-100">
                            <p className="font-medium">Ready to import</p>
                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                This will create a new folder with {totalRows} items using the column names above.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        onClick={handleConfirm}
                        disabled={!editedFolderName.trim() || hasValidationErrors || isLoading}
                        isLoading={isLoading}
                        className="flex-1"
                    >
                        {isLoading ? 'Importing...' : `Import ${totalRows} Items`}
                    </Button>
                    <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
                        Cancel
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
