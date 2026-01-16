import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { FOLDER_TEMPLATES } from '../../utils/templates';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface TemplatePickerProps {
    onSelect: (categoryId: string, templateId: string) => void;
    onClose: () => void;
}

export default function TemplatePicker({ onSelect, onClose }: TemplatePickerProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const categories = Object.values(FOLDER_TEMPLATES);

    if (selectedCategory) {
        const category = FOLDER_TEMPLATES[selectedCategory as keyof typeof FOLDER_TEMPLATES];

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
                        <div>
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className="text-sm text-primary-600 hover:text-primary-700 mb-2 flex items-center gap-1"
                            >
                                ← Back to categories
                            </button>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <span className="text-3xl">{category.icon}</span>
                                Choose a {category.name} Template
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <FiX className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {category.templates.map((template) => (
                            <Card
                                key={template.id}
                                hover
                                className="cursor-pointer"
                                onClick={() => onSelect(category.id, template.id)}
                            >
                                <div className="p-6">
                                    <div className="text-4xl mb-3">{template.icon}</div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                        {template.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        {template.description}
                                    </p>

                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-3">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Fields included:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {template.fields.slice(0, 4).map((field) => (
                                                <span
                                                    key={field.name}
                                                    className="text-xs px-2 py-1 bg-white dark:bg-gray-800 rounded-md text-gray-700 dark:text-gray-300"
                                                >
                                                    {field.label}
                                                </span>
                                            ))}
                                            {template.fields.length > 4 && (
                                                <span className="text-xs px-2 py-1 text-gray-500">
                                                    +{template.fields.length - 4} more
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        ✨ Includes {template.exampleItems.length} example item{template.exampleItems.length > 1 ? 's' : ''}
                                    </p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            Choose a Category
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Select what you want to organize
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <FiX className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {categories.map((category) => (
                        <Card
                            key={category.id}
                            hover
                            className="cursor-pointer"
                            onClick={() => setSelectedCategory(category.id)}
                        >
                            <div className="p-8 text-center">
                                <div className="text-6xl mb-4">{category.icon}</div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    {category.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    {category.templates.length} templates available
                                </p>
                                <Button variant="secondary" className="w-full">
                                    Explore →
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                        💡 <strong>Tip:</strong> Templates come with pre-configured fields and example items to get you started quickly
                    </p>
                </div>
            </div>
        </div>
    );
}
