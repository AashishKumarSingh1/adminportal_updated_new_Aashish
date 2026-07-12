'use client'

import Layout from '../components/layout'
import styled from 'styled-components'
import { ClubAdminDashboard } from '../components/club-admin-dashboard'
import { useSession } from 'next-auth/react'
import Loading from '../components/loading'
import Sign from '../components/signin'
import Unauthorise from '../components/unauthorise'

const Container = styled.div`
  padding: 2rem;
`

export default function ClubAdminDashboardPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <Loading />
  if (!session) return <Sign />
  if (session.user.role !== 'CLUB_ADMIN') return <Unauthorise />

  return (
    <Layout>
      <Container>
        <ClubAdminDashboard />
      </Container>
    </Layout>
  )
}
