import React, { useState, useEffect } from 'react';
import { projectAPI, teamAPI } from '../api/authAPI';
import ProjectCard from '../components/ProjectCard';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/pages/Projects.css';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    team: '',
    search: '',
    page: 1
  });
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  const categories = ['web', 'mobile', 'design', 'ai', 'iot', 'other'];

  useEffect(() => {
    fetchProjects();
    fetchTeams();
  }, [filters]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectAPI.getProjects(filters);
      setProjects(response.data.projects);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await teamAPI.getTeams();
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handleSearch = (e) => {
    handleFilterChange('search', e.target.value);
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      team: '',
      search: '',
      page: 1
    });
  };

  return (
    <div className="projects-page">
      <div className="page-header">
        <div className="container">
          <h1>Our Projects</h1>
          <p>Explore our portfolio of innovative projects and solutions</p>
        </div>
      </div>

      <div className="container">
        {/* Filters Section */}
        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search projects..."
              value={filters.search}
              onChange={handleSearch}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <div className="filter-group">
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={filters.team}
              onChange={(e) => handleFilterChange('team', e.target.value)}
              className="filter-select"
            >
              <option value="">All Teams</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>

            <button onClick={clearFilters} className="btn btn-outline">
              Clear Filters
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <LoadingSpinner text="Loading projects..." />
        ) : (
          <>
            <div className="projects-header">
              <h2>
                {pagination.total} Project{pagination.total !== 1 ? 's' : ''} Found
                {filters.search && ` for "${filters.search}"`}
              </h2>
            </div>

            {projects.length > 0 ? (
              <>
                <div className="projects-grid">
                  {projects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="pagination-btn"
                    >
                      Previous
                    </button>

                    <div className="pagination-pages">
                      {[...Array(pagination.totalPages)].map((_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => handlePageChange(index + 1)}
                          className={`pagination-page ${
                            pagination.currentPage === index + 1 ? 'active' : ''
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="pagination-btn"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📁</div>
                <h3>No projects found</h3>
                <p>Try adjusting your search criteria or filters</p>
                <button onClick={clearFilters} className="btn btn-primary">
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Projects;