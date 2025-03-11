'use client'

import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material'
import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import styled from 'styled-components'
import MenuIcon from '@mui/icons-material/Menu'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import DashboardIcon from '@mui/icons-material/Dashboard'
import NotificationsIcon from '@mui/icons-material/Notifications'
import EventIcon from '@mui/icons-material/Event'
import NewspaperIcon from '@mui/icons-material/Newspaper'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import GroupIcon from '@mui/icons-material/Group'
import { ROLES } from '@/lib/roles'

const StyledHeader = styled.header`
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 2rem;
  }

  .logo-section {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .title {
    color: white;
    font-size: 1.2rem;
  }

  .drawer-list {
    width: 250px;
  }
`

const menuItems = {
  [ROLES.SUPER_ADMIN]: [
    { text: 'Profile', href: '/', icon: <AccountCircleIcon /> },
    { text: 'Events', href: '/events', icon: <EventIcon /> },
    { text: 'Notice', href: '/notice', icon: <NotificationsIcon /> },
    { text: 'News', href: '/news', icon: <NewspaperIcon /> },
    { text: 'Innovation', href: '/innovation', icon: <LightbulbIcon /> },
    { text: 'Faculty Management', href: '/faculty-management', icon: <GroupIcon /> }
  ],
  [ROLES.ACADEMIC_ADMIN]: [
    { text: 'Profile', href: '/', icon: <AccountCircleIcon /> },
    { text: 'Notice', href: '/notice', icon: <NotificationsIcon /> }
  ],
  [ROLES.DEPT_ADMIN]: [
    { text: 'Profile', href: '/', icon: <AccountCircleIcon /> },
    { text: 'Notice', href: '/notice', icon: <NotificationsIcon /> }
  ],
  [ROLES.FACULTY]: [
    { text: 'Profile', href: '/', icon: <AccountCircleIcon /> }
  ],
  [ROLES.OFFICER]: [
    { text: 'Profile', href: '/', icon: <AccountCircleIcon /> },
    { text: 'Notice', href: '/notice', icon: <NotificationsIcon /> }
  ],
  [ROLES.STAFF]: [
    { text: 'Profile', href: '/', icon: <AccountCircleIcon /> }
  ]
}

export default function Header() {
  const { data: session } = useSession()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }
    setDrawerOpen(open)
  }

  const getMenuItems = () => {
    if (!session?.user?.numericRole) return []
    return menuItems[session.user.numericRole] || []
  }

  const drawerList = () => (
    <div className="drawer-list" role="presentation" onClick={toggleDrawer(false)}>
            <List>
        {session?.user && (
          <ListItem>
                        <ListItemIcon>
              <AccountCircleIcon />
                        </ListItemIcon>
            <ListItemText 
              primary={session.user.name}
              secondary={session.user.role}
            />
                    </ListItem>
                )}
            <Divider />
        {getMenuItems().map((item) => (
          <Link href={item.href} key={item.text} style={{ textDecoration: 'none', color: 'inherit' }}>
            <ListItem button>
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
                    </ListItem>
                                      </Link>
        ))}
        <Divider />
        <ListItem button onClick={() => signOut()}>
                    <ListItemIcon>
                        <ExitToAppIcon />
                    </ListItemIcon>
          <ListItemText primary="Sign Out" />
                </ListItem>
            </List>
        </div>
    )

    return (
    <StyledHeader>
      <AppBar position="static" style={{backgroundColor:"#2563EB"}}>
        <Toolbar className="toolbar">
          <div className="logo-section">
                    <IconButton
              color="inherit"
              onClick={toggleDrawer(true)}
                        edge="start"
                    >
              <MenuIcon style={{color:"white"}} />
                    </IconButton>
            <Image 
              src="/logo.jpg" 
              alt="NITP Logo" 
              width={40} 
              height={40} 
            />
            <Typography variant="h6" className="title">
              NITP Admin Portal
                    </Typography>
          </div>
          {session && (
            <Button 
              color="inherit" 
              onClick={() => signOut()}
              style={{color:"white"}}
            >
              Sign Out
            </Button>
          )}
                </Toolbar>
            </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawerList()}
      </Drawer>
    </StyledHeader>
    )
}
