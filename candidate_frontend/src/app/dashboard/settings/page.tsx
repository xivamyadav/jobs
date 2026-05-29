// "use client";

// import React from 'react';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { User, Bell, Lock, Globe, Eye, Shield, Mail, Smartphone } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Switch } from '@/components/ui/switch';

// export default function SettingsPage() {
//     return (
//         <div className="space-y-8">
//             <header className="bg-white rounded-xl p-6 shadow-sm border border-gray-100/50">
//                 <h1 className="text-3xl font-bold tracking-tight text-gray-900">
//                     Settings
//                 </h1>
//                 <p className="text-gray-600 mt-1 font-light">Manage your account preferences and settings.</p>
//             </header>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 <Card className="shadow-sm border-gray-200 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 overflow-hidden group">
//                     <div style={{ height: 3, background: '#4f46e5', width: '100%' }} />
//                     <CardHeader>
//                         <div className="flex items-center gap-4">
//                             <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}>
//                                 <User className="w-6 h-6 text-white" />
//                             </div>
//                             <div>
//                                 <CardTitle className="text-lg">Profile Settings</CardTitle>
//                                 <CardDescription>Manage your personal information</CardDescription>
//                             </div>
//                         </div>
//                     </CardHeader>
//                     <CardContent className="space-y-4">
//                         <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
//                             <div>
//                                 <p className="font-semibold text-sm text-gray-900">Edit Profile</p>
//                                 <p className="text-xs text-gray-600">Update your personal details</p>
//                             </div>
//                             <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white">
//                                 Edit
//                             </Button>
//                         </div>
//                         <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
//                             <div>
//                                 <p className="font-semibold text-sm text-gray-900">Profile Picture</p>
//                                 <p className="text-xs text-gray-600">Change your avatar</p>
//                             </div>
//                             <Button size="sm" variant="outline" className="border-indigo-600 text-indigo-600">
//                                 Upload
//                             </Button>
//                         </div>
//                         <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
//                             <div>
//                                 <p className="font-semibold text-sm text-gray-900">Resume/CV</p>
//                                 <p className="text-xs text-gray-600">Update your resume</p>
//                             </div>
//                             <Button size="sm" variant="outline" className="border-indigo-600 text-indigo-600">
//                                 Upload
//                             </Button>
//                         </div>
//                     </CardContent>
//                 </Card>

//                 <Card className="shadow-sm border-gray-200 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 overflow-hidden group">
//                     <div style={{ height: 3, background: '#6366f1', width: '100%' }} />
//                     <CardHeader>
//                         <div className="flex items-center gap-4">
//                             <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
//                                 <Bell className="w-6 h-6 text-white" />
//                             </div>
//                             <div>
//                                 <CardTitle className="text-lg">Notifications</CardTitle>
//                                 <CardDescription>Manage how you receive updates</CardDescription>
//                             </div>
//                         </div>
//                     </CardHeader>
//                     <CardContent className="space-y-4">
//                         <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
//                             <div className="flex items-center gap-3">
//                                 <Mail className="w-5 h-5 text-indigo-600" />
//                                 <div>
//                                     <p className="font-semibold text-sm text-gray-900">Email Notifications</p>
//                                     <p className="text-xs text-gray-600">Receive updates via email</p>
//                                 </div>
//                             </div>
//                             <Switch defaultChecked />
//                         </div>
//                         <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
//                             <div className="flex items-center gap-3">
//                                 <Smartphone className="w-5 h-5 text-indigo-600" />
//                                 <div>
//                                     <p className="font-semibold text-sm text-gray-900">Push Notifications</p>
//                                     <p className="text-xs text-gray-600">Get mobile alerts</p>
//                                 </div>
//                             </div>
//                             <Switch />
//                         </div>
//                         <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
//                             <div className="flex items-center gap-3">
//                                 <Bell className="w-5 h-5 text-indigo-600" />
//                                 <div>
//                                     <p className="font-semibold text-sm text-gray-900">Job Alerts</p>
//                                     <p className="text-xs text-gray-600">New job recommendations</p>
//                                 </div>
//                             </div>
//                             <Switch defaultChecked />
//                         </div>
//                     </CardContent>
//                 </Card>

//                 <Card className="shadow-sm border-gray-200 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 overflow-hidden group">
//                     <div style={{ height: 3, background: '#4338ca', width: '100%' }} />
//                     <CardHeader>
//                         <div className="flex items-center gap-4">
//                             <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #4338ca, #4f46e5)' }}>
//                                 <Lock className="w-6 h-6 text-white" />
//                             </div>
//                             <div>
//                                 <CardTitle className="text-lg">Security</CardTitle>
//                                 <CardDescription>Manage your account security</CardDescription>
//                             </div>
//                         </div>
//                     </CardHeader>
//                     <CardContent className="space-y-4">
//                         <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
//                             <div className="flex items-center gap-3">
//                                 <Lock className="w-5 h-5 text-indigo-600" />
//                                 <div>
//                                     <p className="font-semibold text-sm text-gray-900">Change Password</p>
//                                     <p className="text-xs text-gray-600">Update your password</p>
//                                 </div>
//                             </div>
//                             <Button size="sm" variant="outline" className="border-indigo-600 text-indigo-600">
//                                 Change
//                             </Button>
//                         </div>
//                         <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
//                             <div className="flex items-center gap-3">
//                                 <Shield className="w-5 h-5 text-indigo-600" />
//                                 <div>
//                                     <p className="font-semibold text-sm text-gray-900">Two-Factor Auth</p>
//                                     <p className="text-xs text-gray-600">Add extra security</p>
//                                 </div>
//                             </div>
//                             <Switch />
//                         </div>
//                         <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
//                             <div className="flex items-center gap-3">
//                                 <Eye className="w-5 h-5 text-indigo-600" />
//                                 <div>
//                                     <p className="font-semibold text-sm text-gray-900">Login Activity</p>
//                                     <p className="text-xs text-gray-600">View recent logins</p>
//                                 </div>
//                             </div>
//                             <Button size="sm" variant="outline" className="border-indigo-600 text-indigo-600">
//                                 View
//                             </Button>
//                         </div>
//                     </CardContent>
//                 </Card>

//                 <Card className="shadow-sm border-gray-200 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 overflow-hidden group">
//                     <div style={{ height: 3, background: '#4f46e5', width: '100%' }} />
//                     <CardHeader>
//                         <div className="flex items-center gap-4">
//                             <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}>
//                                 <Globe className="w-6 h-6 text-white" />
//                             </div>
//                             <div>
//                                 <CardTitle className="text-lg">Preferences</CardTitle>
//                                 <CardDescription>Customize your experience</CardDescription>
//                             </div>
//                         </div>
//                     </CardHeader>
//                     <CardContent className="space-y-4">
//                         <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
//                             <div>
//                                 <p className="font-semibold text-sm text-gray-900">Language</p>
//                                 <p className="text-xs text-gray-600">English (US)</p>
//                             </div>
//                             <Button size="sm" variant="outline" className="border-indigo-600 text-indigo-600">
//                                 Change
//                             </Button>
//                         </div>
//                         <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
//                             <div>
//                                 <p className="font-semibold text-sm text-gray-900">Time Zone</p>
//                                 <p className="text-xs text-gray-600">UTC +5:30 (IST)</p>
//                             </div>
//                             <Button size="sm" variant="outline" className="border-indigo-600 text-indigo-600">
//                                 Change
//                             </Button>
//                         </div>
//                         <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
//                             <div>
//                                 <p className="font-semibold text-sm text-gray-900">Dark Mode</p>
//                                 <p className="text-xs text-gray-600">Coming soon</p>
//                             </div>
//                             <Switch disabled />
//                         </div>
//                     </CardContent>
//                 </Card>
//             </div>

//             <Card className="shadow-sm border-gray-200 hover:shadow-lg hover:border-red-200 transition-all duration-300 overflow-hidden">
//                 <div style={{ height: 3, background: '#dc2626', width: '100%' }} />
//                 <CardHeader>
//                     <CardTitle className="text-lg text-red-600">Danger Zone</CardTitle>
//                     <CardDescription>Irreversible actions for your account</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                     <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border-2 border-red-200">
//                         <div>
//                             <p className="font-semibold text-sm text-gray-900">Deactivate Account</p>
//                             <p className="text-xs text-gray-600">Temporarily disable your account</p>
//                         </div>
//                         <Button size="sm" variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
//                             Deactivate
//                         </Button>
//                     </div>
//                     <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border-2 border-red-200">
//                         <div>
//                             <p className="font-semibold text-sm text-gray-900">Delete Account</p>
//                             <p className="text-xs text-gray-600">Permanently delete your account and data</p>
//                         </div>
//                         <Button size="sm" className="bg-red-600 text-white hover:bg-red-700">
//                             Delete
//                         </Button>
//                     </div>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// }
export default function SettingsPage() {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Settings</h1>
            <p className="text-gray-600">Manage your account preferences and settings.</p>
        </div>
    );
}