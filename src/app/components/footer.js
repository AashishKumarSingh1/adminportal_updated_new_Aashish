'use client'

import styled from 'styled-components'
import Image from 'next/image'

const StyledFooter = styled.footer`
  padding: 2rem 1rem;
  background-color: #a50003;
  color: white;
  border-top: 1px solid #ddd;
`

const FooterContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`

const FooterSection = styled.div`
  h3 {
    margin-bottom: 1.5rem;
    color: #fff;
    font-size: 1.4rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  p {
    margin: 0.8rem 0;
    line-height: 1.8;
    color: #f5f5f5;
    font-size: 0.95rem;
  }
  
  a {
    color: #ffeb3b;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;
    
    &:hover {
      color: #fff;
      text-decoration: underline;
    }
  }
`

const Logo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  
  img {
    width: 60px;
    height: 60px;
    object-fit: contain;
    margin-right: 1rem;
  }
  
  h2 {
    color: white;
    font-size: 1.6rem;
    font-weight: 700;
    line-height: 1.3;
  }
  
  @media (max-width: 768px) {
    justify-content: center;
    flex-direction: column;
    
    img {
      margin-right: 0;
      margin-bottom: 0.5rem;
    }
  }
`

const LinkList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  
  a {
    display: inline-block;
    padding: 0.3rem 0;
    border-bottom: 1px solid transparent;
    
    &:hover {
      border-bottom-color: #ffeb3b;
    }
  }
`

const Copyright = styled.div`
  text-align: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #c50005;
  color: #f0f0f0;
  font-size: 0.9rem;
`

export default function Footer() {
  return (
    <StyledFooter>
      <FooterContainer>
        <FooterSection>
          <Logo>
            <img src="/logo.jpg" alt="NIT Patna Logo" style={{ borderRadius: '50%' }} />
            <h2>National Institute of Technology Patna</h2>
          </Logo>
          <p>Ashok Rajpath, Mahendru, Patna, Bihar 800005</p>
          <p>📞 0612-2371715</p>
          <p>✉️ <a href="mailto:info@nitp.ac.in">info@nitp.ac.in</a></p>
          <p>🌐 <a href="https://www.nitp.ac.in" target="_blank" rel="noopener noreferrer">www.nitp.ac.in</a></p>
        </FooterSection>
        
        <FooterSection>
          <h3>Quick Links</h3>
          <LinkList>
            <a href="https://www.nitp.ac.in" target="_blank" rel="noopener noreferrer">
              NIT Patna Main Website
            </a>
            <a href="http://exam.nitp.ac.in/" target="_blank" rel="noopener noreferrer">
              Faculty Academic Portal
            </a>
          </LinkList>
        </FooterSection>
      </FooterContainer>
      
      <Copyright>
        <p>© {new Date().getFullYear()} National Institute of Technology Patna. All rights reserved.</p>
      </Copyright>
    </StyledFooter>
  )
}
