export const FOLDER_TEMPLATES = {
    student: {
        id: 'student',
        name: 'Student',
        icon: '🎓',
        templates: [
            {
                id: 'assignments',
                name: 'Assignments',
                description: 'Track your homework and assignments',
                icon: '📚',
                fields: [
                    { name: 'subject', type: 'text', label: 'Subject', required: true },
                    { name: 'title', type: 'text', label: 'Title', required: true },
                    { name: 'status', type: 'select', label: 'Status', required: true, options: ['Pending', 'In Progress', 'Completed'] },
                    { name: 'deadline', type: 'date', label: 'Deadline', required: false },
                    { name: 'notes', type: 'textarea', label: 'Notes', required: false }
                ],
                exampleItems: [
                    {
                        subject: 'Database Management',
                        title: 'SQL Assignment',
                        status: 'Completed',
                        deadline: '2024-01-20',
                        notes: 'Practice queries on employee database'
                    },
                    {
                        subject: 'Operating Systems',
                        title: 'Process Scheduling Lab',
                        status: 'Pending',
                        deadline: '2024-01-25',
                        notes: 'Implement round robin algorithm'
                    }
                ]
            },
            {
                id: 'exams',
                name: 'Exam Tracker',
                description: 'Keep track of your exams and grades',
                icon: '📝',
                fields: [
                    { name: 'subject', type: 'text', label: 'Subject', required: true },
                    { name: 'examDate', type: 'date', label: 'Exam Date', required: true },
                    { name: 'grade', type: 'text', label: 'Grade', required: false },
                    { name: 'totalMarks', type: 'number', label: 'Total Marks', required: false },
                    { name: 'status', type: 'select', label: 'Status', required: true, options: ['Upcoming', 'Completed', 'Graded'] }
                ],
                exampleItems: [
                    {
                        subject: 'Mathematics',
                        examDate: '2024-02-15',
                        grade: 'A',
                        totalMarks: 95,
                        status: 'Graded'
                    }
                ]
            },
            {
                id: 'notes',
                name: 'Study Notes',
                description: 'Organize your study notes',
                icon: '📖',
                fields: [
                    { name: 'subject', type: 'text', label: 'Subject', required: true },
                    { name: 'topic', type: 'text', label: 'Topic', required: true },
                    { name: 'content', type: 'textarea', label: 'Notes', required: true },
                    { name: 'date', type: 'date', label: 'Date', required: false }
                ],
                exampleItems: [
                    {
                        subject: 'Computer Networks',
                        topic: 'OSI Model',
                        content: '7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application',
                        date: '2024-01-15'
                    }
                ]
            }
        ]
    },
    business: {
        id: 'business',
        name: 'Business',
        icon: '🏢',
        templates: [
            {
                id: 'orders',
                name: 'Orders',
                description: 'Manage customer orders',
                icon: '📦',
                fields: [
                    { name: 'orderNumber', type: 'text', label: 'Order Number', required: true },
                    { name: 'customerName', type: 'text', label: 'Customer Name', required: true },
                    { name: 'amount', type: 'number', label: 'Amount (₹)', required: true },
                    { name: 'status', type: 'select', label: 'Status', required: true, options: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] },
                    { name: 'orderDate', type: 'date', label: 'Order Date', required: true }
                ],
                exampleItems: [
                    {
                        orderNumber: 'ORD-001',
                        customerName: 'Rahul Kumar',
                        amount: 5000,
                        status: 'Delivered',
                        orderDate: '2024-01-10'
                    }
                ]
            },
            {
                id: 'customers',
                name: 'Customers',
                description: 'Track your customer information',
                icon: '👥',
                fields: [
                    { name: 'name', type: 'text', label: 'Name', required: true },
                    { name: 'email', type: 'email', label: 'Email', required: false },
                    { name: 'phone', type: 'text', label: 'Phone', required: true },
                    { name: 'city', type: 'text', label: 'City', required: false },
                    { name: 'type', type: 'select', label: 'Customer Type', required: true, options: ['Regular', 'Premium', 'VIP'] }
                ],
                exampleItems: [
                    {
                        name: 'Priya Sharma',
                        email: 'priya@example.com',
                        phone: '9876543210',
                        city: 'Chennai',
                        type: 'Premium'
                    }
                ]
            },
            {
                id: 'expenses',
                name: 'Expenses',
                description: 'Track business expenses',
                icon: '💰',
                fields: [
                    { name: 'description', type: 'text', label: 'Description', required: true },
                    { name: 'amount', type: 'number', label: 'Amount (₹)', required: true },
                    { name: 'category', type: 'select', label: 'Category', required: true, options: ['Office Supplies', 'Travel', 'Food', 'Utilities', 'Salary', 'Other'] },
                    { name: 'date', type: 'date', label: 'Date', required: true },
                    { name: 'paymentMethod', type: 'select', label: 'Payment Method', required: false, options: ['Cash', 'Card', 'UPI', 'Bank Transfer'] }
                ],
                exampleItems: [
                    {
                        description: 'Office rent',
                        amount: 15000,
                        category: 'Utilities',
                        date: '2024-01-01',
                        paymentMethod: 'Bank Transfer'
                    }
                ]
            }
        ]
    },
    personal: {
        id: 'personal',
        name: 'Personal',
        icon: '💻',
        templates: [
            {
                id: 'projects',
                name: 'Projects',
                description: 'Track your personal or work projects',
                icon: '🚀',
                fields: [
                    { name: 'name', type: 'text', label: 'Project Name', required: true },
                    { name: 'description', type: 'textarea', label: 'Description', required: false },
                    { name: 'status', type: 'select', label: 'Status', required: true, options: ['Planning', 'In Progress', 'Completed', 'On Hold'] },
                    { name: 'progress', type: 'number', label: 'Progress (%)', required: false },
                    { name: 'startDate', type: 'date', label: 'Start Date', required: false }
                ],
                exampleItems: [
                    {
                        name: 'NEXORA App',
                        description: 'Personal data management platform',
                        status: 'In Progress',
                        progress: 75,
                        startDate: '2024-01-01'
                    }
                ]
            },
            {
                id: 'tasks',
                name: 'Tasks',
                description: 'Your personal to-do list',
                icon: '✅',
                fields: [
                    { name: 'task', type: 'text', label: 'Task', required: true },
                    { name: 'priority', type: 'select', label: 'Priority', required: true, options: ['Low', 'Medium', 'High', 'Urgent'] },
                    { name: 'status', type: 'select', label: 'Status', required: true, options: ['To Do', 'In Progress', 'Done'] },
                    { name: 'dueDate', type: 'date', label: 'Due Date', required: false }
                ],
                exampleItems: [
                    {
                        task: 'Complete NEXORA frontend',
                        priority: 'High',
                        status: 'In Progress',
                        dueDate: '2024-01-20'
                    }
                ]
            },
            {
                id: 'goals',
                name: 'Goals Tracker',
                description: 'Track your personal goals',
                icon: '🎯',
                fields: [
                    { name: 'goal', type: 'text', label: 'Goal', required: true },
                    { name: 'category', type: 'select', label: 'Category', required: true, options: ['Health', 'Career', 'Learning', 'Finance', 'Personal'] },
                    { name: 'target', type: 'text', label: 'Target', required: false },
                    { name: 'progress', type: 'number', label: 'Progress (%)', required: false },
                    { name: 'deadline', type: 'date', label: 'Deadline', required: false }
                ],
                exampleItems: [
                    {
                        goal: 'Learn React',
                        category: 'Learning',
                        target: 'Build 5 projects',
                        progress: 60,
                        deadline: '2024-03-31'
                    }
                ]
            }
        ]
    }
};

export function getAllTemplates() {
    return Object.values(FOLDER_TEMPLATES);
}

export function getTemplateById(categoryId: string, templateId: string) {
    const category = FOLDER_TEMPLATES[categoryId as keyof typeof FOLDER_TEMPLATES];
    if (!category) return null;
    return category.templates.find(t => t.id === templateId);
}
