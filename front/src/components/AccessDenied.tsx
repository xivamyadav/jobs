import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { AlertCircle, Home } from 'lucide-react'
import { getRoleLabel, UserRole } from '@/lib/access-control'

interface AccessDeniedProps {
    role?: UserRole
    requiredRole?: string
    message?: string
}

export function AccessDenied({ role, requiredRole, message }: AccessDeniedProps) {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-gray-600">
                        {message || 'You do not have permission to access this page.'}
                    </p>
                </div>

                <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Your Role:</p>
                    <p className="text-lg font-semibold text-gray-900">
                        {role ? getRoleLabel(role) : 'Not logged in'}
                    </p>
                    {requiredRole && (
                        <>
                            <p className="text-sm text-gray-600 mt-4 mb-2">Required:</p>
                            <p className="text-lg font-semibold text-indigo-600">{requiredRole}</p>
                        </>
                    )}
                </div>

                <div className="flex gap-3">
                    <Button
                        onClick={() => router.back()}
                        variant="outline"
                        className="flex-1"
                    >
                        Go Back
                    </Button>
                    <Button
                        onClick={() => router.push('/login')}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        <Home className="w-4 h-4 mr-2" />
                        Home
                    </Button>
                </div>
            </div>
        </div>
    )
}
