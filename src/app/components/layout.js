'use client'

import Header from './header'
import Footer from './footer'
import styled from 'styled-components'
import { FacultyDataProvider } from '../../context/FacultyDataContext'

const Main = styled.main`
  padding: 2rem;
  min-height: calc(100vh - 64px);
  background: #f5f5f5;
`

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <FacultyDataProvider>
        <Main>{children}</Main>
      </FacultyDataProvider>
      <Footer />
    </>
  )
}
