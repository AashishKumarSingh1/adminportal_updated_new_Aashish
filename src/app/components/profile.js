'use client'

import {
    Button,
    Box
} from '@mui/material'
import { useSession } from 'next-auth/react'
import { useFacultyData } from '../../context/FacultyDataContext'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { EducationManagement } from './profile/education'
import { AboutYouPage } from './profile/aboutUs'
import { ExperiencePage } from './profile/experience'
import { AddProfilePic } from './profile/profilepic'
import { AddCv } from './profile/addCv'
import WorkshopConferenceManagement from './profile/workshops-conferences'
import InstituteActivityManagement from './profile/institute-activities'
import DepartmentActivityManagement from './profile/department-activities'
import InternshipManagement from './profile/internships'
import TeachingEngagementManagement from './profile/teaching-engagement'
import ProjectSupervisionManagement from './profile/project-supervision'
import TextbookManagement from './profile/textbooks'
import EditedBookManagement from './profile/edited-books'
import BookChapterManagement from './profile/book-chapters'
import SponsoredProjectManagement from './profile/sponsored-projects'
import ConsultancyProjectManagement from './profile/consultancy-projects'
import IPRManagement from './profile/ipr'
import StartupManagement from './profile/startups'
import MembershipManagement from './profile/memberships.js'
import PatentManagement from './profile/patents.js'
import PhdCandidateManagement from './profile/phd-candidates.js'
import JournalPaperManagement from './profile/journal-papers.js'
import ConferencePaperManagement from './profile/conference-papers.js'
import Loading from './loading'
import { EditProfile } from './profile/edit-profile'
import JournalReviewersPage from './profile/journalReviewerPage'
import TalksAndLecturesPage from './profile/talkAndLecture'
import ConferenceSessionChairsPage from './profile/conferenceSession'
import EditIcon from '@mui/icons-material/Edit'

const Profile = styled.div`
    font-family: 'Source Sans Pro';
    
    justify-content: space-evenly;
    .faculty-img-row {
        margin-top: 5vh;
        justify-content: center;
        text-align: center;
        .facmail {
            position: absolute;
            margin-top: -70px;
            margin-left: 60px;
        }
        h3 {
            color: #4e4e4e;
        }
        font-family: 'Source Sans Pro';
        .faculty-img-wrap {
            overflow: hidden;
            width: 150px;
            height: 150px;
            min-width: 150px;
          

            img {
                width: 100%;
                height: auto;
                align-self: center;
            }
        }
    }
    .faculty-details-row {
        width: 100%;
        display: flex;
        justify-content: center;
        flex-direction: column;
        #dir {
            line-height: 1.5;
            letter-spacing: 1px;
            padding-right: 3vw;
            padding-top: 50px;
        }
        .fac-card {
            width: 100%;
            margin-top: 3vh;
            margin-bottom: 3vh;
            background: #ffffff;
            box-shadow: 0px 0px 18px rgba(156, 156, 156, 0.38);
            border-radius: 5px;
            padding-left: 5%;
            padding-bottom: 15px;
            font-family: 'Source Sans Pro';
            list-style: disc;

            h3 {
                color: #2f2f2f;
            }
            .factable {
                overflow: hidden;
                max-width: 90%;
                overflow-x: scroll;
                scrollbar-width: none;
                -ms-overflow-style: none;
            }
            .factable:-webkit-scrollbar {
                width: 0px;
                background: transparent;
            }
            table {
                min-width: 90%;
                width: 90%;
            }
        }
    }

    .cv {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.7);
        transition: opacity 500ms;
        visibility: hidden;
        opacity: 0;
    }
    .cv:target {
        visibility: visible;
        opacity: 1;
        z-index: 1;
    }

    .popup {
        margin: 70px auto;
        padding: 20px;
        background: #fff;
        border-radius: 5px;
        width: 30%;
        position: relative;
        transition: all 5s ease-in-out;
        min-height: 70vh;
        min-width: 70vw;
    }

    .popup .close {
        position: absolute;
        top: 20px;
        right: 30px;
        transition: all 200ms;
        font-size: 30px;
        font-weight: bold;
        text-decoration: none;
        color: #333;
    }
    .popup .close:hover {
        color: #06d85f;
    }
    .popup .content {
        height: 70vh;
        width: 70vw;
        overflow: hidden;
    }
`

export default function Profilepage() {
    const { data: session, status } = useSession()
    const { facultyData, loading, error, getBasicInfo } = useFacultyData()
    const [detail, setDetails] = useState(null)
    const [openModals, setOpenModals] = useState({
        education: false,
        work: false,
        journalPaper: false,
        conferencePaper: false,
        textbook: false,
        editedBook: false,
        bookChapter: false,
        sponsoredProject: false,
        consultancyProject: false,
        ipr: false,
        startup: false,
        internship: false,
        workshopConference: false,
        instituteActivity: false,
        departmentActivity: false,
        teachingEngagement: false,
        projectSupervision: false,
        profilePic: false,
        cv: false,
        editProfile: false,
        // ... other modal states
    })

    // Update state when context data changes
    useEffect(() => {
        if (facultyData) {
            setDetails(facultyData)
        }
    }, [facultyData])

    const handleModalOpen = (modalName) => {
        setOpenModals(prev => ({
            ...prev,
            [modalName]: true
        }))
    }

    const handleModalClose = (modalName) => {
        setOpenModals(prev => ({
            ...prev,
            [modalName]: false
        }))
    }

    if (status === "loading") return <Loading />
    if (!session) return null

    return (
                <Profile>
            {/* Profile Image Section */}
                    <div className="faculty-img-row" style={{ 
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: 'center',
    gap: '2rem',
   
    textAlign: 'center'
}}>
    <div className="faculty-img-wrap">
        <img
            src={detail?.profile?.image || '/faculty.png'}
            alt="faculty"
            style={{ 
                width: '150px', 
                height: '150px', 
                objectFit: 'cover', 
                borderRadius: '50%',
                border: '3px solid #830001'
            }}
            onError={(e) => {
                e.target.onerror = null
                e.target.src = '/faculty.png'
            }}
        />
    </div>
    
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <h2 style={{ margin: '0', fontSize: '1.5rem', fontWeight: 'bold' }}>
            {detail?.profile?.name}
        </h2>
        <h3 style={{ margin: '0', fontSize: '1.2rem', color: '#666', fontWeight: 'normal' }}>
            {detail?.profile?.designation}
        </h3>

        {/* Profile Image & CV Upload Buttons */}
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem', 
            alignItems: 'center',
            marginTop: '1.5rem'
        }}>
            <Button
                variant="contained"
                style={{ 
                    backgroundColor: '#8b000088',
                            color: '#ffffffff',
                            padding: '4px 10px',
                            fontSize: '1rem',
                            minWidth: '180px',
                            borderRadius: '8px',
                            boxShadow: '0 4px 8px rgba(178, 34, 34, 0.3)',  // subtle shadow for depth
                            transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                            '&:hover': {
                                backgroundColor: '#8B1A1A',  // darker shade on hover
                                boxShadow: '0 6px 12px rgba(178, 34, 34, 0.4)'
                            },
                            fontWeight: 'semibold',
                }}
                onClick={() => handleModalOpen('profilePic')}
            >
                {detail?.profile?.image ? 'UPDATE PHOTO' : 'UPLOAD PHOTO'}
            </Button>
            
            <AddProfilePic
                handleClose={() => handleModalClose('profilePic')}
                modal={openModals.profilePic}
            />
            
            <div style={{ 
                display: 'flex', 
                flexDirection: 'row', 
                gap: '1rem', 
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {detail?.profile?.cv && (
                    <Button
                        variant="outlined"
                        style={{
                            backgroundColor: 'white',
                            border: '2px solid #830001',
                            color: '#830001',
                            padding: '4px 15px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontSize: '0.9rem'
                        }}
                        component="a"
                        href={detail?.profile?.cv}
                        target="_blank"
                    >
                        VIEW CV
                    </Button>
                )}
                
                <Button
                    variant="contained"
                    style={{ 
                            backgroundColor: '#ffb7b7ff',
                            color: '#830001',
                            padding: '4px 10px',
                            fontSize: '1rem',
                            minWidth: '180px',
                            borderRadius: '8px',
                            boxShadow: '0 4px 8px rgba(178, 34, 34, 0.3)',  // subtle shadow for depth
                            transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                            '&:hover': {
                                backgroundColor: '#8B1A1A',  // darker shade on hover
                                boxShadow: '0 6px 12px rgba(178, 34, 34, 0.4)'
                            }
                        }}

                    onClick={() => handleModalOpen('cv')}
                >
                    {detail?.profile?.cv ? 'UPDATE CV' : 'UPLOAD CV'}
                </Button>
            </div>
            
            <AddCv
                handleClose={() => handleModalClose('cv')}
                modal={openModals.cv}
            />
        </div>
    </div>
</div>

            

                    <div className="faculty-details-row">
            <div className="fac-card">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <div>
                            <h2 style={{marginTop: '10px',fontWeight:'bold',fontSize:'1.5rem'}}>Profile Details</h2>
                            <div style={{ marginTop: '20px' }}>
                                <h4 style={{marginTop: '10px',fontWeight:'bold'}}>Research Interest:</h4>
                                <p>{detail?.profile?.research_interest}</p>

                                <h4 style={{marginTop: '10px',fontWeight:'bold'}}>Contact:</h4>
                                <p>Email: {detail?.profile?.email}</p>
                                <p>Phone: {detail?.profile?.ext_no}</p>

                                <h4 style={{marginTop: '10px',fontWeight:'bold'}}>Social Media & Academic Links:</h4>
                                {detail?.profile?.linkedin && (
                                    <p>LinkedIn: <a href={detail.profile.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#00456aff' }}>{detail.profile.linkedin}🪪</a></p>
                                )}
                                {detail?.profile?.google_scholar && (
                                    <p>Google Scholar: <a href={detail.profile.google_scholar} target="_blank" rel="noopener noreferrer" style={{ color: '#00456aff' }}>View Profile🪪</a></p>
                                )}
                                {detail?.profile?.personal_webpage && (
                                    <p>Personal Webpage: <a href={detail.profile.personal_webpage} target="_blank" rel="noopener noreferrer" style={{ color: '#00456aff' }}>Visit Website🪪</a></p>
                                )}
                                {detail?.profile?.scopus && (
                                    <p>Scopus: <a href={detail.profile.scopus} target="_blank" rel="noopener noreferrer" style={{ color: '#00456aff' }}>View Profile🪪</a></p>
                                )}
                                {detail?.profile?.vidwan && (
                                    <p>Vidwan: <a href={detail.profile.vidwan} target="_blank" rel="noopener noreferrer" style={{ color: '#00456aff' }}>View Profile🪪</a></p>
                                )}
                                {detail?.profile?.orcid && (
                                    <p>ORCID: <a href={detail.profile.orcid} target="_blank" rel="noopener noreferrer" style={{ color: '#00456aff' }}>{detail.profile.orcid}🪪</a></p>
                                )}
                            </div>
                        </div>
                            <Button
                                variant="contained"
                                style={{ backgroundColor: '#830001', color: 'white', marginRight: '20px' }}
                            onClick={() => handleModalOpen('editProfile')}
                            sx={{ m: 2 }}
                             startIcon={<EditIcon />}
                        >
                             Edit Details
                            </Button>
                    </Box>
                    <EditProfile
                        handleClose={() => handleModalClose('editProfile')}
                        modal={openModals.editProfile}
                        currentProfile={detail?.profile}
                            />
                        </div>

                <div className="fac-card">
                    <AboutYouPage />
                                    </div>
                
                                    <div className="fac-card">
                    <ExperiencePage />
                        </div>

               
                <div className="fac-card">
                    <EducationManagement />
                            </div>
                                    <div className="fac-card">
                <TeachingEngagementManagement/>
                        </div>
                            <div className="fac-card">
                <MembershipManagement/>
                            </div>
                        <div className="fac-card">
                <PhdCandidateManagement/>
                        </div>
                        <div className="fac-card">
                <ProjectSupervisionManagement/>
                            </div>
                        <div className="fac-card">
                <SponsoredProjectManagement/>
                        </div>
                        <div className="fac-card">
                <ConsultancyProjectManagement/>
                            </div>
                            <div className="fac-card">
                    <InternshipManagement/>
                        </div>
                        <div className="fac-card">
                <StartupManagement/>
                            </div>
                        <div className="fac-card">
                <IPRManagement/>
                        </div>
                        {/* <div className="fac-card">
                <PatentManagement/>
            </div> */}
                            <div className="fac-card">
                <JournalPaperManagement/>
                            </div>

                            <div className="fac-card">
                <JournalReviewersPage/>
                            </div>

                            <div className="fac-card">
                <ConferencePaperManagement/>
                        </div>
                        <div className='fac-card'>
                            <ConferenceSessionChairsPage />
                        </div>
                        <div className='fac-card'>
                        <TalksAndLecturesPage />
                        </div>
                        
                        <div className="fac-card">
                <BookChapterManagement/>
                        </div>
                            <div className="fac-card">
                <TextbookManagement/>
                            </div>
                            <div className="fac-card">
                <EditedBookManagement/>
                        </div>
                <div className="fac-card">
                    <WorkshopConferenceManagement/>
                        </div>
               
                                <div className="fac-card">
                    <InstituteActivityManagement/>
                            </div>
                <div className="fac-card">
                    <DepartmentActivityManagement/>
                        </div>

                
              
                
               
                
               
                
               
               
              
               
               
                



                            </div>

          

                </Profile>
    )
}
