import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI, teamAPI } from '../api/authAPI';
import ProjectCard from '../components/ProjectCard';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/pages/Home.css';

const Home = () => {
  const [latestProjects, setLatestProjects] = useState([]);
  const [featuredMembers, setFeaturedMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [projectsResponse, teamsResponse] = await Promise.all([
          projectAPI.getLatestProjects(),
          teamAPI.getTeams()
        ]);

        setLatestProjects(projectsResponse.data);
        
        // Extract featured members from teams
        const members = teamsResponse.data.flatMap(team => 
          team.members.slice(0, 2) // Take first 2 members from each team
        );
        setFeaturedMembers(members.slice(0, 6)); // Limit to 6 members
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading company portfolio..." />;
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to Our 
            <span className="highlight"> Innovation Hub</span>
          </h1>
          <p className="hero-description">
            We build amazing digital experiences with talented teams. 
            Explore our projects, meet our team, and join us in creating 
            the future of technology.
          </p>
          <div className="hero-actions">
            <Link to="/projects" className="btn btn-primary">
              View Projects
            </Link>
            <Link to="/team" className="btn btn-secondary">
              Meet Our Team
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-cards">
            <div className="card card-1">🚀</div>
            <div className="card card-2">💡</div>
            <div className="card card-3">👥</div>
          </div>
        </div>
      </section>

      {/* Latest Projects Section */}
      <section className="projects-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Latest Projects</h2>
            <p className="section-subtitle">Check out our most recent work</p>
          </div>
          
          {latestProjects.length > 0 ? (
            <div className="projects-grid">
              {latestProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No projects yet. Check back soon!</p>
            </div>
          )}
          
          <div className="section-actions">
            <Link to="/projects" className="btn btn-outline">
              View All Projects
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Team Members */}
      <section className="team-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Team Members</h2>
            <p className="section-subtitle">Meet some of our talented team members</p>
          </div>
          
          {featuredMembers.length > 0 ? (
            <div className="team-grid">
              {featuredMembers.map(member => (
                <div key={member.id} className="team-member-card">
                  <img 
                    src={`http://localhost:5000/uploads/profiles/${member.profilePhoto}`}
                    alt={member.name}
                    className="member-photo"
                  />
                  <h3 className="member-name">{member.name}</h3>
                  <p className="member-role">{member.position}</p>
                  <div className="member-skills">
                    {JSON.parse(member.skills || '[]').slice(0, 3).map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No team members to display.</p>
            </div>
          )}
          
          <div className="section-actions">
            <Link to="/team" className="btn btn-outline">
              View Full Team
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3 className="stat-number">{latestProjects.length}+</h3>
              <p className="stat-label">Projects Completed</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-number">{featuredMembers.length}+</h3>
              <p className="stat-label">Team Members</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-number">5+</h3>
              <p className="stat-label">Technologies</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-number">100%</h3>
              <p className="stat-label">Client Satisfaction</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;