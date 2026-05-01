import API from './api';

// ── Personal Info ──────────────────────────────────────────────
export const updatePersonalInfo = async (userId, form, cvFile) => {
  const payload = new FormData();
  payload.append('name',  form.name);
  payload.append('email', form.email);
  payload.append('phone', form.phone ?? '');
  payload.append('age',   form.age   ?? '');
  if (cvFile) payload.append('cv', cvFile);

  const { data } = await API.put('/user/personal-info', payload); // ✅ no manual Content-Type
  return data.personalInfo;
};

// ── Education ──────────────────────────────────────────────────
export const addEducation    = (userId, form)        => API.post(`/user/education`,         form).then(r => r.data.education);
export const updateEducation = (userId, eduId, form) => API.put(`/user/education/${eduId}`, form).then(r => r.data.education);
export const deleteEducation = (userId, eduId)       => API.delete(`/user/education/${eduId}`);

// ── Experience ─────────────────────────────────────────────────
export const addExperience    = (userId, form)        => API.post(`/user/experience`,         form).then(r => r.data.experience);
export const updateExperience = (userId, expId, form) => API.put(`/user/experience/${expId}`, form).then(r => r.data.experience);
export const deleteExperience = (userId, expId)       => API.delete(`/user/experience/${expId}`);

// ── Skills ─────────────────────────────────────────────────────
export const addSkill    = (userId, form)    => API.post(`/user/skills`,            form).then(r => r.data.skill);
export const deleteSkill = (userId, skillId) => API.delete(`/user/skills/${skillId}`);