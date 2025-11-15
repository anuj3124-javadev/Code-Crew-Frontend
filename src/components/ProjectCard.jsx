import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/ProjectCard.css';

const ProjectCard = ({ project }) => {
  const developers = typeof project.developers === 'string' 
    ? JSON.parse(project.developers) 
    : project.developers;

  return (
    <div className="project-card">
      <div className="project-image">
        <img 
          src={project.thumbnail} 
          alt={project.name}
          className="project-thumbnail"
        />
        <div className="project-category">{project.category}</div>
      </div>
      
      <div className="project-content">
        <h3 className="project-title">{project.name}</h3>
        <p className="project-description">
          {project.description.length > 120 
            ? `${project.description.substring(0, 120)}...` 
            : project.description
          }
        </p>
        
        <div className="project-developers">
          <span className="developers-label">Developers:</span>
          <div className="developer-tags">
            {developers.slice(0, 3).map((dev, index) => (
              <span key={index} className="developer-tag">{dev}</span>
            ))}
            {developers.length > 3 && (
              <span className="developer-tag more">+{developers.length - 3} more</span>
            )}
          </div>
        </div>

        <div className="project-links">
          {project.liveUrl && (
            <a 
              href={project.liveUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="project-link live"
            >
              Live Demo
            </a>
          )}
          {project.githubUrl && (
            <a 
              href={project.githubUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="project-link github"
            >
              GitHub
            </a>
          )}
          <Link to={`/projects/${project.id}`} className="project-link details">
            Details
          </Link>
        </div>

        <div className="project-meta">
          <span className="project-type">{project.projectType}</span>
          <span className="project-date">
            {new Date(project.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;