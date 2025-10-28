import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectAPI, teamAPI } from '../api/authAPI';
import ProjectCard from '../components/ProjectCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ProjectModal from '../components/ProjectModal';
import TeamModal from '../components/TeamModal';
import '../styles/pages/Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    teamProjects: 0,
    individualProjects: 0
  });
  const [loading, setLoading] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [projectsResponse, teamsResponse] = await Promise.all([
        projectAPI.getProjects({}),
        user.role === 'TL' ? teamAPI.getTeams() : Promise.resolve({ data: [] })
      ]);

      const userProjects = projectsResponse.data.projects.filter(
        project => project.createdBy === user.id || project.teamId
      );

      setProjects(userProjects);
      setTeams(teamsResponse.data);

      // Calculate stats
      const totalProjects = userProjects.length;
      const teamProjects = userProjects.filter(p => p.projectType === 'team').length;
      const individualProjects = userProjects.filter(p => p.projectType === 'individual').length;

      setStats({ totalProjects, teamProjects, individualProjects });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = (newProject) => {
    setProjects(prev => [newProject, ...prev]);
    setStats(prev => ({
      ...prev,
      totalProjects: prev.totalProjects + 1,
      individualProjects: prev.individualProjects + (newProject.projectType === 'individual' ? 1 : 0),
      teamProjects: prev.teamProjects + (newProject.projectType === 'team' ? 1 : 0)
    }));
    setShowProjectModal(false);
  };

  const handleTeamCreated = (newTeam) => {
    setTeams(prev => [newTeam, ...prev]);
    setShowTeamModal(false);
  };

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." />;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user.name}!</h1>
          <p>Here's what's happening with your projects and teams.</p>
        </div>
        
        <div className="dashboard-actions">
          <button 
            onClick={() => setShowProjectModal(true)}
            className="btn btn-primary"
          >
            + New Project
          </button>
          {user.role === 'TL' && (
            <button 
              onClick={() => setShowTeamModal(true)}
              className="btn btn-secondary"
            >
              + New Team
            </button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{stats.totalProjects}</h3>
            <p>Total Projects</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-info">
            <h3>{stats.individualProjects}</h3>
            <p>Individual Projects</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{stats.teamProjects}</h3>
            <p>Team Projects</p>
          </div>
        </div>
        {user.role === 'TL' && (
          <div className="stat-card">
            <div className="stat-icon">🏢</div>
            <div className="stat-info">
              <h3>{teams.length}</h3>
              <p>Teams Managed</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          My Projects ({projects.length})
        </button>
        {user.role === 'TL' && (
          <button 
            className={`tab-btn ${activeTab === 'teams' ? 'active' : ''}`}
            onClick={() => setActiveTab('teams')}
          >
            My Teams ({teams.length})
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="recent-projects">
              <h3>Recent Projects</h3>
              {projects.length > 0 ? (
                <div className="projects-grid compact">
                  {projects.slice(0, 4).map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No projects yet. Create your first project!</p>
                </div>
              )}
            </div>

            {user.role === 'TL' && teams.length > 0 && (
              <div className="teams-overview">
                <h3>Your Teams</h3>
                <div className="teams-list">
                  {teams.slice(0, 3).map(team => (
                    <div key={team.id} className="team-item">
                      <h4>{team.name}</h4>
                      <p>{team.members?.length || 0} members</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="projects-content">
            <div className="projects-header">
              <h3>All Projects</h3>
              <div className="project-filters">
                <select className="filter-select">
                  <option value="all">All Projects</option>
                  <option value="individual">Individual</option>
                  <option value="team">Team</option>
                </select>
              </div>
            </div>
            
            {projects.length > 0 ? (
              <div className="projects-grid">
                {projects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No projects found. Create your first project!</p>
                <button 
                  onClick={() => setShowProjectModal(true)}
                  className="btn btn-primary"
                >
                  Create Project
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'teams' && user.role === 'TL' && (
          <div className="teams-content">
            <div className="teams-header">
              <h3>Managed Teams</h3>
            </div>
            
            {teams.length > 0 ? (
              <div className="teams-grid">
                {teams.map(team => (
                  <div key={team.id} className="team-card">
                    <div className="team-header">
                      <h4>{team.name}</h4>
                      <span className="team-badge">Team Leader</span>
                    </div>
                    <p className="team-description">{team.description}</p>
                    <div className="team-members">
                      <h5>Members ({team.members?.length || 0})</h5>
                      <div className="member-avatars">
                        {team.members?.slice(0, 5).map(member => (
                          <img 
                            key={member.id}
                            src={`http://localhost:5000/uploads/profiles/${member.profilePhoto}`}
                            alt={member.name}
                            className="member-avatar"
                            title={member.name}
                          />
                        ))}
                        {team.members?.length > 5 && (
                          <span className="more-members">+{team.members.length - 5}</span>
                        )}
                      </div>
                    </div>
                    <div className="team-actions">
                      <button className="btn btn-sm btn-outline">View Details</button>
                      <button className="btn btn-sm btn-primary">Manage</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No teams created yet. Create your first team!</p>
                <button 
                  onClick={() => setShowTeamModal(true)}
                  className="btn btn-primary"
                >
                  Create Team
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showProjectModal && (
        <ProjectModal 
          onClose={() => setShowProjectModal(false)}
          onProjectCreated={handleProjectCreated}
          teams={user.role === 'TL' ? teams : []}
        />
      )}

      {showTeamModal && user.role === 'TL' && (
        <TeamModal 
          onClose={() => setShowTeamModal(false)}
          onTeamCreated={handleTeamCreated}
        />
      )}
    </div>
  );
};

export default Dashboard;   