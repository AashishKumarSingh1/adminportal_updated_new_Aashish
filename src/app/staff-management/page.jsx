"use client"

import Layout from '../components/layout'
import styled from 'styled-components'
import { StaffTable } from '../components/staff-table'
import { useSession } from 'next-auth/react'
import Loading from '../components/loading'
import Sign from '../components/signin'
import Unauthorise from '../components/unauthorise'

const Container = styled.div`
  padding: 2rem;
  
  h1 {
    margin-bottom: 2rem;
  }
`

export default function FacultyManagement() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <Loading />
  }

  if (!session) {
    return <Sign />
  }

  if (session.user.role !== 'SUPER_ADMIN') {
    return <Unauthorise />
  }

  return (
    <Layout>
      <Container>
        <StaffTable />
      </Container>
    </Layout>
  )
}
