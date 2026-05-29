
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, MessageSquare, FileText, HelpCircle, Clock, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SupportPage() {
    return (
        <div className="space-y-8">
            <header className="bg-white rounded-xl shadow-sm border border-gray-100/50">
                <div className="p-6">
                    <h1 className="text-3xl font-bold mb-4">Support Center</h1>
                    <p className="text-gray-600">We're here to help! Get in touch with us for any assistance.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm border-gray-200 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 overflow-hidden group">
                    <div style={{ height: 3, background: '#4f46e5', width: '100%' }} />
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}>
                                <Mail className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Email Support</CardTitle>
                                <CardDescription>Get help via email within 24 hours</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <p className="text-sm text-gray-600 mb-2 font-medium">General Support</p>
                            <a href="mailto:support@bytebuzz.in" className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-2">
                                support@bytebuzz.in
                                <Mail className="w-4 h-4" />
                            </a>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <p className="text-sm text-gray-600 mb-2 font-medium">Technical Support</p>
                            <a href="mailto:tech@bytebuzz.in" className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-2">
                                tech@bytebuzz.in
                                <Mail className="w-4 h-4" />
                            </a>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-gray-200 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 overflow-hidden group">
                    <div style={{ height: 3, background: '#6366f1', width: '100%' }} />
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                                <Phone className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Contact Information</CardTitle>
                                <CardDescription>Alternative ways to reach us</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <p className="text-sm text-gray-600 mb-2 font-medium">Help Desk ID</p>
                            <p className="text-gray-900 font-semibold">HD-2026-BYTEBUZZ</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <p className="text-sm text-gray-600 mb-2 font-medium">Response Time</p>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-indigo-600" />
                                <p className="text-gray-900 font-semibold">Within 24 hours</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-sm border-gray-200 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 overflow-hidden">
                <div style={{ height: 3, background: '#4338ca', width: '100%' }} />
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #4338ca, #4f46e5)' }}>
                            <HelpCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
                            <CardDescription>Quick answers to common questions</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="border-l-4 border-indigo-600 pl-4 py-2">
                            <h4 className="font-bold text-sm text-gray-900 mb-1">How do I apply for a job?</h4>
                            <p className="text-sm text-gray-600">Browse available jobs and click the "Apply Now" button on any job listing that interests you.</p>
                        </div>
                        <div className="border-l-4 border-indigo-600 pl-4 py-2">
                            <h4 className="font-bold text-sm text-gray-900 mb-1">How can I track my applications?</h4>
                            <p className="text-sm text-gray-600">Visit the Applications page to see all your job applications and their current status.</p>
                        </div>
                        <div className="border-l-4 border-indigo-600 pl-4 py-2">
                            <h4 className="font-bold text-sm text-gray-900 mb-1">Can I update my profile information?</h4>
                            <p className="text-sm text-gray-600">Yes! Go to the Profile section and click "Edit Profile" to update your information.</p>
                        </div>
                        <div className="border-l-4 border-indigo-600 pl-4 py-2">
                            <h4 className="font-bold text-sm text-gray-900 mb-1">How do I save jobs for later?</h4>
                            <p className="text-sm text-gray-600">Click the bookmark icon on any job listing to save it for later review.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-sm border-gray-200 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 text-center p-6">
                    <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}>
                        <MessageSquare className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Live Chat</h3>
                    <p className="text-sm text-gray-600 mb-4">Coming Soon</p>
                    <Button disabled className="w-full bg-gray-300 text-gray-500 cursor-not-allowed">
                        Chat Support
                    </Button>
                </Card>

                <Card className="shadow-sm border-gray-200 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 text-center p-6">
                    <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                        <FileText className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Documentation</h3>
                    <p className="text-sm text-gray-600 mb-4">Coming Soon</p>
                    <Button disabled className="w-full bg-gray-300 text-gray-500 cursor-not-allowed">
                        View Docs
                    </Button>
                </Card>

                <Card className="shadow-sm border-gray-200 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 text-center p-6">
                    <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4338ca, #4f46e5)' }}>
                        <HelpCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Help Center</h3>
                    <p className="text-sm text-gray-600 mb-4">Coming Soon</p>
                    <Button disabled className="w-full bg-gray-300 text-gray-500 cursor-not-allowed">
                        Browse Articles
                    </Button>
                </Card>
            </div>
        </div>
    );
}