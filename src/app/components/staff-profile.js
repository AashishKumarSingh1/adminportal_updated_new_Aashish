"use client";

import { Button, Box, Chip, Divider } from "@mui/material";
import { useSession } from "next-auth/react";
import { useStaffData } from "../../context/StaffDataContext";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { AddProfilePic } from "./profile/profilepic";
import { AddCv } from "./profile/addCv";
import Loading from "./loading";
import { EditProfile } from "./profile/staffeditprofile";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/EmailOutlined";
import BadgeIcon from "@mui/icons-material/BadgeOutlined";
import ApartmentIcon from "@mui/icons-material/ApartmentOutlined";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import LayersIcon from "@mui/icons-material/LayersOutlined";
import HomeIcon from "@mui/icons-material/HomeOutlined";
import RoomIcon from "@mui/icons-material/RoomOutlined";
import ScienceIcon from "@mui/icons-material/ScienceOutlined";
import SchoolIcon from "@mui/icons-material/SchoolOutlined";
import WorkIcon from "@mui/icons-material/WorkOutlined";
import InboxIcon from "@mui/icons-material/InboxOutlined";
import {getDeptFullName} from "@/lib/const";

const Profile = styled.div`
  font-family: "Source Sans Pro";
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
    font-family: "Source Sans Pro";
    .faculty-img-wrap {
      overflow: hidden;
      width: 150px;
      height: 150px;
      min-width: 150px;
      border-radius: 50%;
      box-shadow: 0 6px 20px rgba(131, 0, 1, 0.18);
      img {
        width: 100%;
        height: auto;
        align-self: center;
      }
    }
  }

  .faculty-details-row {
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    flex-direction: column;
    padding: 0 20px;

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
      box-shadow: 0px 4px 20px rgba(131, 0, 1, 0.08);
      border: 1px solid #f0e6e6;
      border-radius: 12px;
      padding: 28px 32px 28px 28px;
      font-family: "Source Sans Pro";

      .factable {
        overflow: hidden;
        max-width: 100%;
        overflow-x: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      .factable::-webkit-scrollbar {
        width: 0px;
        background: transparent;
      }
    }
  }

  /* --- Section header with accent bar --- */
  .section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 4px;
  }
  .section-header .accent-bar {
    width: 4px;
    height: 22px;
    background: #830001;
    border-radius: 4px;
  }
  .section-header h2 {
    margin: 0;
    font-weight: 700;
    font-size: 1.25rem;
    color: #2a2a2a;
    letter-spacing: 0.2px;
  }
  .section-header svg {
    color: #830001;
    opacity: 0.75;
  }

  /* --- Info grid of icon/label/value tiles --- */
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 18px 28px;
    margin-top: 22px;
  }
  .info-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  .info-item .icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    min-width: 36px;
    border-radius: 8px;
    background: #fdf0f0;
    color: #830001;
  }
  .info-item .icon-wrap svg {
    font-size: 20px;
  }
  .info-item .label {
    display: block;
    font-size: 0.72rem;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: #9a9a9a;
    font-weight: 600;
    margin-bottom: 2px;
  }
  .info-item .value {
    font-size: 0.95rem;
    color: #2f2f2f;
    font-weight: 500;
    word-break: break-word;
  }
  .info-item .value.muted {
    color: #b4b4b4;
    font-weight: 400;
    font-style: italic;
  }

  .badge-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 16px;
  }

  /* --- Styled data tables --- */
  table.pro-table {
    min-width: 100%;
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin-top: 18px;
    font-size: 0.9rem;
  }
  table.pro-table thead th {
    text-align: left;
    background: #fdf0f0;
    color: #830001;
    font-weight: 600;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    padding: 10px 14px;
  }
  table.pro-table thead th:first-child {
    border-radius: 8px 0 0 8px;
  }
  table.pro-table thead th:last-child {
    border-radius: 0 8px 8px 0;
  }
  table.pro-table tbody td {
    padding: 12px 14px;
    border-bottom: 1px solid #f2f2f2;
    color: #3a3a3a;
  }
  table.pro-table tbody tr:hover td {
    background: #fdfafa;
  }
  table.pro-table tbody tr:last-child td {
    border-bottom: none;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 32px 0 16px;
    color: #b4b4b4;
  }
  .empty-state svg {
    font-size: 30px;
    opacity: 0.6;
  }
  .empty-state span {
    font-size: 0.9rem;
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
`;

const safeParse = (value, fallback) => {
  if (value == null) return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

// Small presentational helper — icon + label + value tile
function InfoItem({ icon, label, value }) {
  return (
    <div className="info-item">
      <div className="icon-wrap">{icon}</div>
      <div>
        <span className="label">{label}</span>
        <span className={`value${value ? "" : " muted"}`}>
          {value || "Not provided"}
        </span>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title }) {
  return (
    <div className="section-header">
      <span className="accent-bar" />
      {icon}
      <h2>{title}</h2>
    </div>
  );
}

export default function StaffProfile() {
  const { data: session, status } = useSession();
  const { staffData, loading, error, getBasicInfo } = useStaffData();
  const [detail, setDetails] = useState(null);
  const [openModals, setOpenModals] = useState({
    profilePic: false,
    cv: false,
    editProfile: false,
  });

  useEffect(() => {
    if (staffData) {
      setDetails(staffData);
    }
  }, [staffData]);

  useEffect(() => {
    if (
      session?.user?.email &&
      getBasicInfo &&
      typeof getBasicInfo === "function"
    ) {
      try {
        const basicInfo = getBasicInfo();
        if (basicInfo && Object.keys(basicInfo).length > 0) {
          setDetails((prev) => prev || { profile: basicInfo });
        }
      } catch (error) {
        console.error("Error getting basic info in profile:", error);
      }
    }
  }, [session?.user?.email, getBasicInfo, staffData]);

  useEffect(() => {
    if (staffData?.profile?.image && !detail?.profile?.image) {
      setDetails((prev) => ({
        ...prev,
        profile: {
          ...prev?.profile,
          image: staffData.profile.image,
        },
      }));
    }
  }, [staffData?.profile?.image, detail?.profile?.image]);

  const handleModalOpen = (modalName) => {
    setOpenModals((prev) => ({ ...prev, [modalName]: true }));
  };

  const handleModalClose = (modalName) => {
    setOpenModals((prev) => ({ ...prev, [modalName]: false }));
  };

  if (status === "loading") return <Loading />;
  if (!session) return null;
  if (loading) return <Loading />;

  const profile = detail?.profile;

  // /api/staff returns a single flat "name" column (no first/middle/last split)
  const fullName = profile?.name;

  const labs = safeParse(profile?.labs, []);
  const permanentAddress = safeParse(profile?.permanent_address, {});
  const currentAddress = safeParse(profile?.current_address, {});
  const education = detail?.profile?.education ?? [];
  const workExperience = detail?.profile?.work_experience ?? [];

  const formatAddress = (addr) => {
    const parts = [addr?.place, addr?.district, addr?.state].filter(Boolean);
    return parts.length ? parts.join(", ") : "";
  };

  const formatDate = (value) => (value ? value.toString().split("T")[0] : "");

  return (
    <Profile>
      {/* Header */}
      <div
        className="faculty-img-row"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "2rem",
          textAlign: "center",
        }}
      >
        <div className="faculty-img-wrap">
          <img
            src={profile?.image || "/faculty.png"}
            alt="faculty"
            style={{
              width: "150px",
              height: "150px",
              objectFit: "cover",
              borderRadius: "50%",
              border: "3px solid #830001",
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/faculty.png";
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <h2
            style={{
              margin: "0",
              fontSize: "1.6rem",
              fontWeight: "bold",
              color: "#222",
            }}
          >
            {fullName}
          </h2>
          <h3
            style={{
              margin: "0",
              fontSize: "1.1rem",
              color: "#830001",
              fontWeight: 500,
            }}
          >
            {profile?.designation}
          </h3>
          {getDeptFullName(profile?.department) && (
            <span style={{ fontSize: "0.9rem", color: "#888" }}>
              {getDeptFullName(profile?.department)}
            </span>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              alignItems: "center",
              marginTop: "1.5rem",
            }}
          >
            <Button
              variant="contained"
              style={{
                backgroundColor: "#8b000088",
                color: "#ffffffff",
                padding: "4px 10px",
                fontSize: "1rem",
                minWidth: "180px",
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(178, 34, 34, 0.3)",
                transition: "background-color 0.3s ease, box-shadow 0.3s ease",
                fontWeight: "semibold",
              }}
              onClick={() => handleModalOpen("profilePic")}
            >
              {profile?.image ? "UPDATE PHOTO" : "UPLOAD PHOTO"}
            </Button>

            <AddProfilePic
              handleClose={() => handleModalClose("profilePic")}
              modal={openModals.profilePic}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "1rem",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {profile?.cv && (
                <Button
                  variant="outlined"
                  style={{
                    backgroundColor: "white",
                    border: "2px solid #830001",
                    color: "#830001",
                    padding: "4px 15px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    fontSize: "0.9rem",
                  }}
                  component="a"
                  href={profile?.cv}
                  target="_blank"
                >
                  VIEW CV
                </Button>
              )}

              <Button
                variant="contained"
                style={{
                  backgroundColor: "#ffb7b7ff",
                  color: "#830001",
                  padding: "4px 10px",
                  fontSize: "1rem",
                  minWidth: "180px",
                  borderRadius: "8px",
                  boxShadow: "0 4px 8px rgba(178, 34, 34, 0.3)",
                  transition:
                    "background-color 0.3s ease, box-shadow 0.3s ease",
                }}
                onClick={() => handleModalOpen("cv")}
              >
                {profile?.cv ? "UPDATE CV" : "UPLOAD CV"}
              </Button>
            </div>

            <AddCv
              handleClose={() => handleModalClose("cv")}
              modal={openModals.cv}
            />
          </div>
        </div>
      </div>

      <div className="faculty-details-row">
        {/* Profile Details */}
        <div className="fac-card">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <SectionHeader icon={<BadgeIcon />} title="Profile Details" />
            <Button
              variant="contained"
              style={{ backgroundColor: "#830001", color: "white" }}
              onClick={() => handleModalOpen("editProfile")}
              startIcon={<EditIcon />}
            >
              Edit Details
            </Button>
          </Box>

          <div className="badge-row">
            {profile?.category && (
              <Chip
                label={profile.category}
                size="small"
                sx={{
                  backgroundColor: "#fdf0f0",
                  color: "#830001",
                  fontWeight: 600,
                }}
              />
            )}
            {profile?.gender && (
              <Chip
                label={profile.gender}
                size="small"
                sx={{
                  backgroundColor: "#f5f5f5",
                  color: "#555",
                  fontWeight: 600,
                }}
              />
            )}
            {profile?.cadre && (
              <Chip
                label={profile.cadre}
                size="small"
                sx={{
                  backgroundColor: "#f5f5f5",
                  color: "#555",
                  fontWeight: 600,
                }}
              />
            )}
          </div>

          <div className="info-grid">
            <InfoItem
              icon={<BadgeIcon />}
              label="Employee Code"
              value={profile?.employee_code}
            />
            <InfoItem
              icon={<ApartmentIcon />}
              label="Department"
              value={getDeptFullName(profile?.department)}
            />
            <InfoItem
              icon={<LayersIcon />}
              label="Pay Level"
              value={profile?.pay_level}
            />
            <InfoItem
              icon={<WorkspacePremiumIcon />}
              label="Expertise"
              value={profile?.research_interest}
            />
            <InfoItem
              icon={<EmailIcon />}
              label="Email"
              value={profile?.email}
            />
            <InfoItem
              icon={<BadgeIcon />}
              label="Mobile Number"
              value={profile?.mobile_number}
            />
          </div>

          <Divider sx={{ my: 3 }} />

          <div className="info-grid">
            <InfoItem
              icon={<HomeIcon />}
              label="Permanent Address"
              value={formatAddress(permanentAddress)}
            />
            <InfoItem
              icon={<RoomIcon />}
              label="Current Address"
              value={formatAddress(currentAddress)}
            />
          </div>

          <EditProfile
            handleClose={() => handleModalClose("editProfile")}
            modal={openModals.editProfile}
            currentProfile={profile}
          />
        </div>

        {/* Education */}
        <div className="fac-card">
          <SectionHeader icon={<SchoolIcon />} title="Education" />

          {education.length ? (
            <div className="factable">
              <table className="pro-table">
                <thead>
                  <tr>
                    <th>Certification</th>
                    <th>Institution</th>
                    <th>Specialization</th>
                    <th>Passing Year</th>
                  </tr>
                </thead>
                <tbody>
                  {education.map((edu, index) => (
                    <tr key={edu.id ?? index}>
                      <td>{edu.certification}</td>
                      <td>{edu.institution}</td>
                      <td>{edu.specialization}</td>
                      <td>{edu.passing_year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <InboxIcon />
              <span>No education added yet</span>
            </div>
          )}
        </div>
        {/* Work Experience */}
        <div className="fac-card">
          <SectionHeader icon={<WorkIcon />} title="Work Experience" />

          {workExperience.length ? (
            <div className="factable">
              <table className="pro-table">
                <thead>
                  <tr>
                    <th>Role / Description</th>
                    <th>Institute</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {workExperience.map((we, index) => (
                    <tr key={we.id ?? index}>
                      <td>{we.work_experiences}</td>
                      <td>{we.institute}</td>
                      <td>{formatDate(we.start_date)}</td>
                      <td>{formatDate(we.end_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <InboxIcon />
              <span>No work experience added yet</span>
            </div>
          )}
        </div>

        {/* Labs */}
        <div className="fac-card">
          <SectionHeader icon={<ScienceIcon />} title="Labs" />

          {labs.length ? (
            <div className="factable">
              <table className="pro-table">
                <thead>
                  <tr>
                    <th>Lab Name</th>
                    <th>Course code</th>
                    <th>Level</th>
                    <th>Semester</th>
                    <th>Batch</th>
                    <th>No. of Students</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {labs.map((lab, index) => (
                    <tr key={lab.id ?? index}>
                      <td>{lab.lab_name}</td>
                      <td>{lab.course_code}</td>
                      <td>{lab.level}</td>
                      <td>{lab.semester}</td>
                      <td>{lab.batch}</td>
                      <td>{lab.no_of_students}</td>
                      <td>{formatDate(lab.start_date)}</td>
                      <td>{formatDate(lab.end_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <InboxIcon />
              <span>No labs added yet</span>
            </div>
          )}
        </div>
      </div>
    </Profile>
  );
}
