import React, { useState, useEffect } from 'react';
import { teamAPI } from '../api/authAPI';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/pages/Team.css';

const Team = () => {
  const [teams, setTeams] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('members');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await teamAPI.getTeams();
      setTeams(response.data);
      
      // Extract all unique members
      const membersMap = new Map();
      response.data.forEach(team => {
        team.members.forEach(member => {
          if (!membersMap.has(member.id)) {
            membersMap.set(member.id, member);
          }
        });
      });
      setAllMembers(Array.from(membersMap.values()));
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading team information..." />;
  }

  return (
    <div className="team-page">
      <div className="page-header">
        <div className="container">
          <h1>Our Team</h1>
          <p>Meet the talented individuals behind our amazing projects</p>
        </div>
      </div>

      <div className="container">
        {/* Tabs */}
        <div className="team-tabs">
          <button 
            className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            All Members ({allMembers.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'teams' ? 'active' : ''}`}
            onClick={() => setActiveTab('teams')}
          >
            Teams ({teams.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'members' && (
            <div className="members-section">
              <h2>Team Members</h2>
              {allMembers.length > 0 ? (
                <div className="members-grid">
                  {allMembers.map(member => (
                    <div key={member.id} className="member-card">
                      <div className="member-header">
                        <img 
                          src={member.profilePhoto}
                          alt={member.name}
                          className="member-photo"
                        />
                        <div className="member-basic-info">
                          <h3 className="member-name">{member.name}</h3>
                          <p className="member-role">{member.position}</p>
                        </div>
                      </div>
                      
                      <div className="member-details">
                        <p className="member-bio">
                          {member.bio || 'No bio available yet.'}
                        </p>
                        
                        <div className="member-skills">
                          <h4>Skills</h4>
                          <div className="skills-list">
                            {JSON.parse(member.skills || '[]').map((skill, index) => (
                              <span key={index} className="skill-tag">{skill}</span>
                            ))}
                            {(!member.skills || JSON.parse(member.skills).length === 0) && (
                              <p className="no-skills">No skills listed</p>
                            )}
                          </div>
                        </div>

                        <div className="member-teams">
                          <h4>Teams</h4>
                          <div className="teams-list">
                            {teams
                              .filter(team => team.members.some(m => m.id === member.id))
                              .map(team => (
                                <span key={team.id} className="team-tag">
                                  {team.name}
                                </span>
                              ))
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No team members found.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="teams-section">
              <h2>Our Teams</h2>
              {teams.length > 0 ? (
                <div className="teams-grid">
                  {teams.map(team => (
                    <div key={team.id} className="team-card-large">
                      <div className="team-header">
                        <h3 className="team-name">{team.name}</h3>
                        <div className="team-leader">
                          <img 
                            src={team.teamLeader.profilePhoto}
                            alt={team.teamLeader.name}
                            className="leader-photo"
                          />
                          <span>Led by {team.teamLeader.name}</span>
                        </div>
                      </div>
                      
                      <p className="team-description">
                        {team.description || 'No description available.'}
                      </p>

                      <div className="team-members">
                        <h4>Team Members ({team.members.length})</h4>
                        <div className="members-list">
                          {team.members.map(member => (
                            <div key={member.id} className="team-member-item">
                              <img 
                                src={member.profilePhoto}
                                alt={member.name}
                                className="member-thumbnail"
                              />
                              <div className="member-info">
                                <span className="member-name">{member.name}</span>
                                <span className="member-role">{member.position}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="team-actions">
                        <button className="btn btn-outline btn-sm">
                          View Projects
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No teams created yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Team;