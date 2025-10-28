import axiosInstance from './axiosInstance';

export const authAPI = {
  register: (userData) => axiosInstance.post('/auth/register', userData),
  login: (credentials) => axiosInstance.post('/auth/login', credentials),
};

export const userAPI = {
  getProfile: (userId) => axiosInstance.get(`/users/${userId}`),
  updateProfile: (formData) => axiosInstance.put('/users/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAllUsers: () => axiosInstance.get('/users'),
};

export const projectAPI = {
  getProjects: (params) => axiosInstance.get('/projects', { params }),
  getLatestProjects: () => axiosInstance.get('/projects/latest'),
  getProject: (id) => axiosInstance.get(`/projects/${id}`),
  createProject: (formData) => axiosInstance.post('/projects', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateProject: (id, formData) => axiosInstance.put(`/projects/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteProject: (id) => axiosInstance.delete(`/projects/${id}`),
};

export const teamAPI = {
  getTeams: () => axiosInstance.get('/teams'),
  createTeam: (teamData) => axiosInstance.post('/teams', teamData),
  addTeamMember: (memberData) => axiosInstance.post('/teams/add-member', memberData),
  removeTeamMember: (memberData) => axiosInstance.post('/teams/remove-member', memberData),
  getTeamProjects: (teamId) => axiosInstance.get(`/teams/${teamId}/projects`),
};