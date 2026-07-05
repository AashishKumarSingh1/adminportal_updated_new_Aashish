'use client'

import Header from './header'
import Footer from './footer'
import styled from 'styled-components'
import { FacultyDataProvider } from '../../context/FacultyDataContext'
import { StaffDataProvider } from "../../context/StaffDataContext"
const Main = styled.main`
  padding: 2rem;
  min-height: calc(100vh - 64px);
  background: #f5f5f5;
`

export default function Layout({ children }) {
  return (
    <>
      <FacultyDataProvider>
        <StaffDataProvider>
        <Header />
        <Main>{children}</Main>
        </StaffDataProvider>
      </FacultyDataProvider>
      <Footer />
    </>
  )
}
