import { useState } from 'react';

interface Field {
    name: string;
    type: string;
    label: string;
    required: boolean;
    options?: string[];
}

interface DynamicFormProps {
    fields: Field[];
    onSubmit: (data: Record<string, any>) => void;
    onCancel: () => void;
    isSubmitting: boolean;
    initialData?: Record<string, any>;
}

export default function DynamicForm({ fields, onSubmit, onCancel, isSubmitting, initialData = {} }: DynamicFormProps) {
    const [formData, setFormData] = useState<Record<string, any>>(initialData);

    const handleChange = (name: string, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const renderField = (field: Field) => {
        const value = formData[field.name] || '';

        switch (field.type) {
            case 'text':
            case 'email':
                return (
                    <input
                        type={field.type}
                        value={value}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        required={field.required}
                        className="input"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                );

            case 'number':
                return (
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        required={field.required}
                        className="input"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                );

            case 'date':
                return (
                    <input
                        type="date"
                        value={value}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        required={field.required}
                        className="input"
                    />
                );

            case 'select':
                return (
                    <select
                        value={value}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        required={field.required}
                        className="input"
                    >
                        <option value="">Select {field.label.toLowerCase()}</option>
                        {field.options?.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                );

            case 'textarea':
                return (
                    <textarea
                        value={value}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        required={field.required}
                        className="input min-h-[100px]"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => (
                <div key={field.name}>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderField(field)}
                </div>
            ))}

            <div className="flex gap-3 pt-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary flex-1"
                >
                    {isSubmitting ? 'Saving...' : initialData && Object.keys(initialData).length > 0 ? 'Update Item' : 'Add Item'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="btn btn-secondary"
                    disabled={isSubmitting}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
