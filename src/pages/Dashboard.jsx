import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectAPI, teamAPI } from '../api/authAPI';
import ProjectCard from '../components/ProjectCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ProjectModal from '../components/ProjectModal';
import TeamModal from '../components/TeamModal';
import { Link } from 'react-router-dom';
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
            <>
            <button 
              onClick={() => setShowTeamModal(true)}
              className="btn btn-secondary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
    <path d="M12 7.5C12 9.433 10.433 11 8.5 11C6.567 11 5 9.433 5 7.5C5 5.567 6.567 4 8.5 4C10.433 4 12 5.567 12 7.5Z" stroke="#141B34" stroke-width="1.5" />
    <path d="M13.5 11C15.433 11 17 9.433 17 7.5C17 5.567 15.433 4 13.5 4" stroke="#141B34" stroke-width="1.5" stroke-linecap="round" />
    <path d="M13.1429 20H3.85714C2.83147 20 2 19.2325 2 18.2857C2 15.9188 4.07868 14 6.64286 14H10.3571C11.4023 14 12.3669 14.3188 13.1429 14.8568" stroke="#141B34" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M19 14V20M22 17L16 17" stroke="#141B34" stroke-width="1.5" stroke-linecap="round" />
</svg>
            </button>
            <Link 
                            to="/register" 
                            className="btn btn-secondary"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
    <path d="M14 8.5C14 5.73858 11.7614 3.5 9 3.5C6.23858 3.5 4 5.73858 4 8.5C4 11.2614 6.23858 13.5 9 13.5C11.7614 13.5 14 11.2614 14 8.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M16 20.5C16 16.634 12.866 13.5 9 13.5C5.13401 13.5 2 16.634 2 20.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M19 9V15M22 12L16 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
</svg>
                          </Link>
            </>
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
                            src={member.profilePhoto}
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