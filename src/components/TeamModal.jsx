import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { teamAPI, userAPI } from '../api/authAPI';
import '../styles/components/Modal.css';

const TeamModal = ({ onClose, onTeamCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [members, setMembers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch available users when component mounts
  React.useEffect(() => {
    fetchAvailableUsers();
  }, []);

  const fetchAvailableUsers = async () => {
    try {
      const response = await userAPI.getAllUsers();
      setAvailableUsers(response.data.filter(u => u.id !== user.id));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddMember = () => {
    if (selectedUser && !members.find(m => m.id === selectedUser)) {
      const userToAdd = availableUsers.find(u => u.id === parseInt(selectedUser));
      if (userToAdd) {
        setMembers(prev => [...prev, { ...userToAdd, role: 'Member' }]);
        setSelectedUser('');
      }
    }
  };

  const handleRemoveMember = (userId) => {
    setMembers(prev => prev.filter(m => m.id !== userId));
  };

  const handleRoleChange = (userId, newRole) => {
    setMembers(prev => prev.map(m => 
      m.id === userId ? { ...m, role: newRole } : m
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First create the team
      const teamResponse = await teamAPI.createTeam(formData);
      const team = teamResponse.data.team;

      // Then add members
      for (const member of members) {
        await teamAPI.addTeamMember({
          teamId: team.id,
          userId: member.id,
          role: member.role
        });
      }

      onTeamCreated(team);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create New Team</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Team Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter team name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-input"
              rows="3"
              placeholder="Describe the team's purpose..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Add Team Members</label>
            <div className="member-input-group">
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="form-input"
              >
                <option value="">Select a user to add</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddMember}
                className="btn btn-primary btn-sm"
                disabled={!selectedUser}
              >
                Add Member
              </button>
            </div>
          </div>

          {members.length > 0 && (
            <div className="form-group">
              <label className="form-label">Team Members ({members.length})</label>
              <div className="members-list">
                {members.map(member => (
                  <div key={member.id} className="member-item">
                    <div className="member-info">
                      <img 
                        src={member.profilePhoto}
                        alt={member.name}
                        className="member-avatar"
                      />
                      <div className="member-details">
                        <span className="member-name">{member.name}</span>
                        <span className="member-email">{member.email}</span>
                      </div>
                    </div>
                    <div className="member-actions">
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                        className="role-select"
                      >
                        <option value="Member">Member</option>
                        <option value="Lead">Lead</option>
                        <option value="Developer">Developer</option>
                        <option value="Designer">Designer</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        className="btn btn-sm btn-danger"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
              {loading ? 'Creating Team...' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamModal;