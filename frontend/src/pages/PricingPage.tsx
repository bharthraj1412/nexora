import { FiCheck } from 'react-icons/fi';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function PricingPage() {
    const plans = [
        {
            name: 'Free',
            price: '$0',
            description: 'Perfect for getting started',
            features: [
                '5 Collections',
                '100 Records per collection',
                'Basic activity logs',
                'Email support',
            ],
            cta: 'Current Plan',
            current: true,
        },
        {
            name: 'Pro',
            price: '$29',
            period: '/month',
            description: 'For professional use',
            features: [
                'Unlimited Collections',
                'Unlimited Records',
                'Advanced activity logs',
                'Priority support',
                'API access',
                'Export data',
            ],
            cta: 'Coming Soon',
            popular: true,
        },
        {
            name: 'Team',
            price: '$99',
            period: '/month',
            description: 'For teams and organizations',
            features: [
                'Everything in Pro',
                'Team collaboration',
                'Role-based access',
                'Advanced security',
                'Dedicated support',
                'SLA guarantee',
            ],
            cta: 'Coming Soon',
        },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Simple, transparent pricing
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Choose the plan that's right for you. Upgrade anytime to unlock more features.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {plans.map((plan) => (
                    <Card
                        key={plan.name}
                        className={`p-8 ${plan.popular
                                ? 'ring-2 ring-primary-600 dark:ring-primary-400 relative'
                                : ''
                            }`}
                    >
                        {plan.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                                    Most Popular
                                </span>
                            </div>
                        )}

                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {plan.name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                {plan.description}
                            </p>
                            <div className="flex items-baseline">
                                <span className="text-5xl font-bold text-gray-900 dark:text-white">
                                    {plan.price}
                                </span>
                                {plan.period && (
                                    <span className="text-gray-600 dark:text-gray-400 ml-2">
                                        {plan.period}
                                    </span>
                                )}
                            </div>
                        </div>

                        <ul className="space-y-4 mb-8">
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex items-start gap-3">
                                    <div className="w-5 h-5 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <FiCheck className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <span className="text-gray-700 dark:text-gray-300">
                                        {feature}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <Button
                            className="w-full"
                            variant={plan.current ? 'secondary' : 'primary'}
                            disabled={!plan.current}
                        >
                            {plan.cta}
                        </Button>
                    </Card>
                ))}
            </div>

            <div className="text-center max-w-3xl mx-auto">
                <Card className="p-8 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-700">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Need a custom plan?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        We offer custom plans for enterprises with specific needs. Contact our sales team to discuss your requirements.
                    </p>
                    <Button variant="primary">
                        Contact Sales
                    </Button>
                </Card>
            </div>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                <p>Pricing is in USD. All plans include 14-day free trial.</p>
                <p className="mt-1">Cancel anytime, no questions asked.</p>
            </div>
        </div>
    );
}
