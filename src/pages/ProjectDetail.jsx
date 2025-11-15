import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectAPI } from '../api/authAPI';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/pages/ProjectDetail.css';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await projectAPI.getProject(id);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('Project not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading project details..." />;
  }

  if (error || !project) {
    return (
      <div className="error-page">
        <div className="container">
          <div className="error-content">
            <h2>Project Not Found</h2>
            <p>The project you're looking for doesn't exist or has been removed.</p>
            <Link to="/projects" className="btn btn-primary">
              Back to Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const developers = typeof project.developers === 'string' 
    ? JSON.parse(project.developers) 
    : project.developers;

  return (
    <div className="project-detail-page">
      <div className="container">
        {/* Project Header */}
        <div className="project-header">
          <div className="project-image">
            <img 
              src={project.thumbnail}
              alt={project.name}
              className="project-thumbnail-large"
            />
          </div>
          
          <div className="project-info">
            <div className="project-category-badge">{project.category}</div>
            <h1 className="project-title">{project.name}</h1>
            <p className="project-description-full">{project.description}</p>
            
            <div className="project-meta">
              <div className="meta-item">
                <span className="meta-label">Type:</span>
                <span className="meta-value">{project.projectType}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Created:</span>
                <span className="meta-value">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
              {project.team && (
                <div className="meta-item">
                  <span className="meta-label">Team:</span>
                  <span className="meta-value">{project.team.name}</span>
                </div>
              )}
            </div>

            <div className="project-links">
              {project.liveUrl && (
                <a 
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary project-link-btn"
                >
                  🌐 Live Demo
                </a>
              )}
              {project.githubUrl && (
                <a 
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline project-link-btn"
                >
                  💻 GitHub Code
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="project-details">
          <div className="details-section">
            <h3>Developers</h3>
            <div className="developers-list">
              {developers.map((developer, index) => (
                <div key={index} className="developer-card">
                  <div className="developer-avatar">
                    {developer.charAt(0).toUpperCase()}
                  </div>
                  <span className="developer-name">{developer}</span>
                </div>
              ))}
            </div>
          </div>

          {project.team && (
            <div className="details-section">
              <h3>Team Members</h3>
              <div className="team-members-grid">
                {project.team.members.map(member => (
                  <div key={member.id} className="team-member">
                    <img 
                      src={member.profilePhoto}
                      alt={member.name}
                      className="member-photo"
                    />
                    <div className="member-info">
                      <h4>{member.name}</h4>
                      <p>{member.position}</p>
                      <div className="member-skills">
                        {JSON.parse(member.skills || '[]').slice(0, 3).map((skill, index) => (
                          <span key={index} className="skill-tag">{skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="details-section">
            <h3>Project Creator</h3>
            <div className="creator-info">
              <img 
                src={project.creator.profilePhoto}
                alt={project.creator.name}
                className="creator-photo"
              />
              <div className="creator-details">
                <h4>{project.creator.name}</h4>
                <p>{project.creator.position || 'Team Member'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Projects */}
        <div className="back-section">
          <Link to="/projects" className="btn btn-outline">
            ← Back to All Projects
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;