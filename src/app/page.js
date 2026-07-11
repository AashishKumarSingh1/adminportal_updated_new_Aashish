import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import Sign from './components/signin'
import ClientLayout from './components/layout'
import Profilepage from './components/profile'
import StaffProfile from './components/staff-profile'

export default async function Page() {
    const session = await getServerSession(authOptions)
    
    // 2. If no session exists, render the sign-in page
    if (!session) {
        return <Sign />
    }

    // 3. Check if the user role matches your "staff" identifier
    const isStaff = session.user?.role === 'STAFF'

    return (
        <ClientLayout>
            {isStaff ? <StaffProfile /> : <Profilepage />}
        </ClientLayout>
    )
}
