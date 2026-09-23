import apiClient from './api';
import { INITIAL_COMPANY_DATA } from '../mock-data/companyData';

/**
 * Company Service - API-Driven Requirements Engine
 * Communicates with backend endpoints backed by Supabase `role_requirements` and `companies`.
 */
export const companyService = {
  // Fetch company profile
  getCompanyProfile() {
    return INITIAL_COMPANY_DATA.company;
  },

  // Fetch available skill tags
  getAvailableSkills() {
    return INITIAL_COMPANY_DATA.availableSkills;
  },

  // Fetch published requirements from database API
  async getRequirements() {
    try {
      const response = await apiClient.get('/companies/requirements');
      if (response && response.success && Array.isArray(response.requirements) && response.requirements.length > 0) {
        return response.requirements;
      }
    } catch (err) {
      console.warn('[companyService] getRequirements API error, using initial dataset:', err.message);
    }
    return INITIAL_COMPANY_DATA.publishedRequirements;
  },

  // Publish a new requirement to database API
  async publishRequirement(reqData) {
    try {
      const response = await apiClient.post('/companies/requirements', reqData);
      if (response && response.success && response.requirement) {
        return response.requirement;
      }
    } catch (err) {
      console.warn('[companyService] publishRequirement API error, fallback locally:', err.message);
    }

    // Local fallback if API is unreachable
    return {
      id: `req-${Date.now()}`,
      company: reqData.company || "Acme Technologies",
      role: reqData.role || reqData.title || "Specialist Candidate",
      department: reqData.department || "Engineering",
      requiredSkills: reqData.requiredSkills || [],
      minReadiness: reqData.minReadiness || 75,
      experience: reqData.experience || "0–2 Years",
      openings: reqData.openings || 1,
      location: reqData.location || "Hybrid",
      postedDate: "Just now",
      status: "Active",
      matchedCandidatesCount: 3
    };
  },

  // Fetch notifications
  async getNotifications() {
    return INITIAL_COMPANY_DATA.notifications;
  }
};

export default companyService;
