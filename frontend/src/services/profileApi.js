// services/profileApi.js — API service layer for HireAtlas Profile

const BASE_URL = process.env.VITE_API_URL || "http://localhost:3000/api";

const handleResponse = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
};

// ─── Personal Info ────────────────────────────────────────────────────────────
export const getUserProfile = (userId) =>
  fetch(`${BASE_URL}/user/${userId}`).then(handleResponse);

/**
 * updateUserProfile — sends multipart/form-data so a new CV file can be
 * included alongside the regular text fields.
 *
 * @param {number} userId
 * @param {object} data   - { name, email, phone, age }
 * @param {File|null} cvFile - new CV file, or null to keep existing
 */
export const updateUserProfile = (userId, data, cvFile = null) => {
  const payload = new FormData();
  Object.entries(data).forEach(([key, val]) => {
    if (val !== undefined && val !== null) payload.append(key, val);
  });
  if (cvFile) payload.append("cv", cvFile);

  return fetch(`${BASE_URL}/user/${userId}`, {
    method: "PUT",
    // Do NOT set Content-Type header — browser sets it with boundary automatically
    body: payload,
  }).then(handleResponse);
};

// ─── Education ────────────────────────────────────────────────────────────────
export const getEducation = (userId) =>
  fetch(`${BASE_URL}/education?userId=${userId}`).then(handleResponse);

export const addEducation = (data) =>
  fetch(`${BASE_URL}/education`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(handleResponse);

export const updateEducation = (eduId, data) =>
  fetch(`${BASE_URL}/education/${eduId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(handleResponse);

export const deleteEducation = (eduId) =>
  fetch(`${BASE_URL}/education/${eduId}`, { method: "DELETE" }).then(handleResponse);

// ─── Experience ───────────────────────────────────────────────────────────────
export const getExperience = (userId) =>
  fetch(`${BASE_URL}/experience?userId=${userId}`).then(handleResponse);

export const addExperience = (data) =>
  fetch(`${BASE_URL}/experience`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(handleResponse);

export const updateExperience = (expId, data) =>
  fetch(`${BASE_URL}/experience/${expId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(handleResponse);

export const deleteExperience = (expId) =>
  fetch(`${BASE_URL}/experience/${expId}`, { method: "DELETE" }).then(handleResponse);

// ─── Skills ───────────────────────────────────────────────────────────────────
export const getSkills = (userId) =>
  fetch(`${BASE_URL}/skill?userId=${userId}`).then(handleResponse);

export const addSkill = (data) =>
  fetch(`${BASE_URL}/skill`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(handleResponse);

export const updateSkill = (userSkillId, data) =>
  fetch(`${BASE_URL}/skill/${userSkillId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(handleResponse);

export const deleteSkill = (userSkillId) =>
  fetch(`${BASE_URL}/skill/${userSkillId}`, { method: "DELETE" }).then(handleResponse);
