import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectAPI } from '../api/authAPI';
import '../styles/components/Modal.css';

const ProjectModal = ({ onClose, onProjectCreated, teams = [] }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    category: 'web',
    description: '',
    liveUrl: '',
    githubUrl: '',
    developers: [''],
    projectType: 'individual',
    teamId: ''
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeveloperChange = (index, value) => {
    const newDevelopers = [...formData.developers];
    newDevelopers[index] = value;
    setFormData(prev => ({
      ...prev,
      developers: newDevelopers
    }));
  };

  const addDeveloper = () => {
    setFormData(prev => ({
      ...prev,
      developers: [...prev.developers, '']
    }));
  };

  const removeDeveloper = (index) => {
    if (formData.developers.length > 1) {
      const newDevelopers = formData.developers.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        developers: newDevelopers
      }));
    }
  };

  const handleFileChange = (e) => {
    setThumbnail(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      
      // Append form data
      Object.keys(formData).forEach(key => {
        if (key === 'developers') {
          const validDevelopers = formData[key].filter(dev => dev.trim() !== '');
          submitData.append(key, JSON.stringify(validDevelopers));
        } else {
          submitData.append(key, formData[key]);
        }
      });

      // Append thumbnail if selected
      if (thumbnail) {
        submitData.append('thumbnail', thumbnail);
      }

      const response = await projectAPI.createProject(submitData);
      onProjectCreated(response.data.project);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create New Project</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Project Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="web">Web Development</option>
                <option value="mobile">Mobile App</option>
                <option value="design">UI/UX Design</option>
                <option value="ai">AI/ML</option>
                <option value="iot">IoT</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-input"
              rows="4"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Live URL</label>
              <input
                type="url"
                name="liveUrl"
                value={formData.liveUrl}
                onChange={handleChange}
                className="form-input"
                placeholder="https://"
              />
            </div>

            <div className="form-group">
              <label className="form-label">GitHub URL</label>
              <input
                type="url"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
                className="form-input"
                placeholder="https://"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Project Type *</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="projectType"
                  value="individual"
                  checked={formData.projectType === 'individual'}
                  onChange={handleChange}
                />
                Individual Project
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="projectType"
                  value="team"
                  checked={formData.projectType === 'team'}
                  onChange={handleChange}
                  disabled={user.role !== 'TL'}
                />
                Team Project {user.role !== 'TL' && '(Team Leaders Only)'}
              </label>
            </div>
          </div>

          {formData.projectType === 'team' && user.role === 'TL' && (
            <div className="form-group">
              <label className="form-label">Select Team</label>
              <select
                name="teamId"
                value={formData.teamId}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Choose a team</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Developers</label>
            {formData.developers.map((developer, index) => (
              <div key={index} className="developer-input-group">
                <input
                  type="text"
                  value={developer}
                  onChange={(e) => handleDeveloperChange(index, e.target.value)}
                  className="form-input"
                  placeholder="Developer name"
                />
                {formData.developers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDeveloper(index)}
                    className="btn btn-sm btn-danger"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addDeveloper}
              className="btn btn-sm btn-outline"
            >
              + Add Developer
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Project Thumbnail</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="form-input"
            />
            <small>Recommended: 400x300px, max 5MB</small>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;