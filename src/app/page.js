import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import Sign from './components/signin'
import ClientLayout from './components/layout'
import Profilepage from './components/profile'

export default async function Page() {
    const session = await getServerSession(authOptions)
    
    if (!session) {
        return <Sign />
    }

    // Fetch faculty data using server-side fetch
    let result = null
    try {
        const res = await fetch(
            `${process.env.URL}/api/faculty?type=${session.user.email}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store'
            }
        )
        if (!res.ok) {
            throw new Error('Failed to fetch faculty data')
        }
        result = await res.json()
    } catch (e) {
        console.error('Error fetching faculty data:', e)
    }

    return (
        <ClientLayout>
            <Profilepage details={result} />
        </ClientLayout>
    )
}
