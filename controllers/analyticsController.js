const Candidate = require("../models/Candidate");

exports.getDashboardAnalytics = async (req, res) => {
  try {

    // Get all candidates
    const candidates = await Candidate.find();

    // =========================
    // TOTAL PROFILES
    // =========================

    const totalProfiles = candidates.length;

    // =========================
    // AVG EXPERIENCE
    // =========================

    const totalExperience = candidates.reduce(
      (acc, curr) => acc + (curr.experience || 0),
      0
    );

    const avgExperience =
      totalProfiles > 0
        ? (totalExperience / totalProfiles).toFixed(1)
        : 0;

    // =========================
    // SKILL COUNTS
    // =========================

    const skillMap = {};

    candidates.forEach((candidate) => {
      candidate.skills?.forEach((skill) => {
        skillMap[skill] = (skillMap[skill] || 0) + 1;
      });
    });

    // Sort skills
    const sortedSkills = Object.entries(skillMap).sort(
      (a, b) => b[1] - a[1]
    );

    // Most Popular Skill
    const mostPopularSkill =
      sortedSkills.length > 0
        ? sortedSkills[0][0]
        : "N/A";

    // =========================
    // TOP HIRING DOMAIN
    // =========================

    const domainMap = {
      Frontend: [
        "React",
        "Vue.js",
        "Angular",
        "Next.js",
        "Tailwind CSS",
        "UI/UX",
      ],

      Backend: [
        "Node.js",
        "Express",
        "Java",
        "Spring Boot",
        "REST APIs",
      ],

      Cloud: [
        "AWS",
        "Docker",
        "Kubernetes",
        "Azure",
      ],

      AI_ML: [
        "Python",
        "Machine Learning",
        "TensorFlow",
        "NLP",
      ],
    };

    const domainCounts = {
      Frontend: 0,
      Backend: 0,
      Cloud: 0,
      AI_ML: 0,
    };

    candidates.forEach((candidate) => {
      candidate.skills?.forEach((skill) => {

        Object.keys(domainMap).forEach((domain) => {

          if (domainMap[domain].includes(skill)) {
            domainCounts[domain]++;
          }

        });
      });
    });

    // Find top domain
    const topHiringDomain = Object.entries(domainCounts).sort(
      (a, b) => b[1] - a[1]
    )[0][0];

    // =========================
    // RESPONSE
    // =========================

    res.json({
      totalProfiles,
      avgExperience,
      mostPopularSkill,
      topHiringDomain,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Analytics fetch failed",
    });
  }
};