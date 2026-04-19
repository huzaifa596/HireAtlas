// mockData.js — Realistic mock data matching HireAtlas DB schema

export const mockUser = {
  userId: 1,
  name: "Ayesha Tariq",
  email: "ayesha.tariq@gmail.com",
  phone: "+92 300 1234567",
  age: 26,
  cvPath: "/uploads/cvs/ayesha_tariq_cv.pdf",
  cvFileName: "ayesha_tariq_cv.pdf",
};

export const mockEducation = [
  {
    eduId: 1,
    instituteName: "LUMS – Lahore University of Management Sciences",
    level: "Bachelor's",
    degreeName: "BS Computer Science",
    grade: "3.72 / 4.00",
    startDate: "2017-09-01",
    endDate: "2021-06-30",
  },
  {
    eduId: 2,
    instituteName: "Punjab College",
    level: "Intermediate",
    degreeName: "Pre-Engineering",
    grade: "91%",
    startDate: "2015-04-01",
    endDate: "2017-03-31",
  },
];

export const mockExperience = [
  {
    expId: 1,
    companyName: "Systems Limited",
    jobTitle: "Software Engineer",
    description:
      "Led development of microservices using Node.js and React. Reduced API response time by 40% through query optimization. Collaborated with cross-functional teams in an Agile environment.",
    startDate: "2021-08-01",
    endDate: null,
  },
  {
    expId: 2,
    companyName: "Arbisoft",
    jobTitle: "Junior Frontend Developer",
    description:
      "Built reusable React component libraries. Integrated third-party APIs and payment gateways. Participated in code reviews and pair programming sessions.",
    startDate: "2021-01-01",
    endDate: "2021-07-31",
  },
];

export const mockSkills = [
  { userSkillId: 1,  skillName: "React.js",      category: "Frontend",  proficiency: "Expert"       },
  { userSkillId: 2,  skillName: "JavaScript",     category: "Frontend",  proficiency: "Expert"       },
  { userSkillId: 3,  skillName: "TypeScript",     category: "Frontend",  proficiency: "Intermediate" },
  { userSkillId: 4,  skillName: "CSS / Tailwind", category: "Frontend",  proficiency: "Expert"       },
  { userSkillId: 5,  skillName: "Node.js",        category: "Backend",   proficiency: "Intermediate" },
  { userSkillId: 6,  skillName: "Express.js",     category: "Backend",   proficiency: "Intermediate" },
  { userSkillId: 7,  skillName: "SQL Server",     category: "Database",  proficiency: "Intermediate" },
  { userSkillId: 8,  skillName: "MongoDB",        category: "Database",  proficiency: "Beginner"     },
  { userSkillId: 9,  skillName: "Git / GitHub",   category: "Tools",     proficiency: "Expert"       },
  { userSkillId: 10, skillName: "Figma",          category: "Tools",     proficiency: "Beginner"     },
];

export const skillOptions      = ["React.js","Vue.js","Angular","JavaScript","TypeScript","HTML5","CSS / Tailwind","Node.js","Express.js","Python","Django","FastAPI","Java","Spring Boot","SQL Server","PostgreSQL","MySQL","MongoDB","Redis","Git / GitHub","Docker","Kubernetes","AWS","Azure","Figma","Jira"];
export const categoryOptions   = ["Frontend","Backend","Database","Tools","DevOps","Design","Other"];
export const proficiencyOptions = ["Beginner","Intermediate","Expert"];
export const levelOptions      = ["Matriculation","Intermediate","Bachelor's","Master's","PhD","Diploma","Other"];
