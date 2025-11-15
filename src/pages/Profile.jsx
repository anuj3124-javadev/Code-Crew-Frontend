import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, projectAPI } from '../api/authAPI';
import LoadingSpinner from '../components/LoadingSpinner';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebaseConfig"
import '../styles/pages/Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [userProjects, setUserProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    position: '',
    skills: []
  });
  const [newSkill, setNewSkill] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [profileResponse, projectsResponse] = await Promise.all([
        userAPI.getProfile(user.id),
        projectAPI.getProjects({})
      ]);

      const profileData = profileResponse.data;
      setProfile(profileData);
      setFormData({
        name: profileData.name,
        bio: profileData.bio || '',
        position: profileData.position || '',
        skills: JSON.parse(profileData.skills || '[]')
      });

      // Filter user's projects
      const userProjects = projectsResponse.data.projects.filter(
        project => project.createdBy === user.id
      );
      setUserProjects(userProjects);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleFileChange = (e) => {
    setProfilePhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('bio', formData.bio);
      submitData.append('position', formData.position);
      submitData.append('skills', JSON.stringify(formData.skills));
      
      if (profilePhoto) {
      let imageUrl = null;
      const safeName = profilePhoto.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const imageRef = ref(storage, `profile_photos/${Date.now()}-${safeName}`);
      await uploadBytes(imageRef, profilePhoto);
      imageUrl = await getDownloadURL(imageRef);
      submitData.append('profilePhoto', imageUrl);
    }

      const response = await userAPI.updateProfile(submitData);
      updateUser(response.data.user);
      setProfile(response.data.user);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setFormData({
      name: profile.name,
      bio: profile.bio || '',
      position: profile.position || '',
      skills: JSON.parse(profile.skills || '[]')
    });
    setEditing(false);
    setProfilePhoto(null);
  };

  if (loading) {
    return <LoadingSpinner text="Loading your profile..." />;
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <h1>Your Profile</h1>
          <p>Manage your personal information and preferences</p>
        </div>

        <div className="profile-content">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-header-section">
              <div className="profile-photo-section">
                <img 
                  src={
                    profilePhoto 
                      ? URL.createObjectURL(profilePhoto)
                      : profile.profilePhoto
                  }
                  alt={profile.name}
                  className="profile-photo-large"
                />
                {editing && (
                  <div className="photo-upload">
                    <label htmlFor="profilePhoto" className="btn btn-sm btn-outline">
                      Change Photo
                    </label>
                    <input
                      type="file"
                      id="profilePhoto"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                )}
              </div>

              <div className="profile-basic-info">
                {editing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input profile-name-input"
                    placeholder="Your name"
                  />
                ) : (
                  <h2 className="profile-name">{profile.name}</h2>
                )}
                <p className="profile-email">{profile.email}</p>
                <div className="profile-role-badge">{profile.role}</div>

                {!editing && (
                  <button 
                    onClick={() => setEditing(true)}
                    className="btn btn-primary"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {editing ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                  <label className="form-label">Position/Role</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g., Frontend Developer"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="form-input"
                    rows="4"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Skills</label>
                  <div className="skills-input-group">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="form-input"
                      placeholder="Add a skill"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="btn btn-sm btn-primary"
                    >
                      Add
                    </button>
                  </div>
                  <div className="skills-list">
                    {formData.skills.map((skill, index) => (
                      <span key={index} className="skill-tag editable">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="remove-skill"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-details">
                <div className="detail-item">
                  <strong>Position:</strong>
                  <span>{profile.position || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <strong>Bio:</strong>
                  <p>{profile.bio || 'No bio provided yet.'}</p>
                </div>
                <div className="detail-item">
                  <strong>Skills:</strong>
                  <div className="skills-list">
                    {JSON.parse(profile.skills || '[]').map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                    {(!profile.skills || JSON.parse(profile.skills).length === 0) && (
                      <p>No skills listed</p>
                    )}
                  </div>
                </div>
                <div className="detail-item">
                  <strong>Member Since:</strong>
                  <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* User Projects */}
          <div className="user-projects">
            <h3>Your Projects ({userProjects.length})</h3>
            {userProjects.length > 0 ? (
              <div className="projects-list-mini">
                {userProjects.slice(0, 5).map(project => (
                  <div key={project.id} className="project-item-mini">
                    <img 
                      src={project.thumbnail}
                      alt={project.name}
                      className="project-thumbnail-mini"
                    />
                    <div className="project-info-mini">
                      <h4>{project.name}</h4>
                      <p className="project-category">{project.category}</p>
                      <span className="project-date">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
                {userProjects.length > 5 && (
                  <div className="view-all-projects">
                    <button className="btn btn-outline btn-sm">
                      View All Projects
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <p>You haven't created any projects yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;