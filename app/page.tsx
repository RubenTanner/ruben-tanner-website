"use client";

import { useEffect, useState, useRef } from "react";
import SocialIcon from "./SocialIcon";
import StockfishChess from "@/components/stockfish-chess";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [greeting, setGreeting] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [experienceTab, setExperienceTab] = useState<"work" | "education">(
    "work",
  );
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineContainerRef = useRef<HTMLElement>(null);

  // GitHub state
  const [githubStats, setGithubStats] = useState<{
    publicRepos: number;
    followers: number;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme");
    const systemDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    if (savedTheme === "dark" || (!savedTheme && systemDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }

    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      setCurrentTime(
        now.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
      if (hours < 12) setGreeting("Good morning");
      else if (hours < 18) setGreeting("Good afternoon");
      else setGreeting("Good evening");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Fetch GitHub stats
    const fetchGitHub = async () => {
      try {
        const userRes = await fetch("https://api.github.com/users/RubenTanner");
        const userData = await userRes.json();

        setGithubStats({
          publicRepos: userData.public_repos || 0,
          followers: userData.followers || 0,
        });
      } catch (error) {
        console.error("Failed to fetch GitHub stats");
      }
    };
    fetchGitHub();

    return () => clearInterval(interval);
  }, []);

  // scroll on vertical scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!timelineContainerRef.current || !timelineRef.current) return;

      const container = timelineContainerRef.current;
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const containerHeight = container.offsetHeight;

      const start = rect.top;
      const end = rect.bottom - windowHeight;

      if (start <= 0 && end >= 0) {
        const progress = Math.abs(start) / (containerHeight - windowHeight);
        setScrollProgress(Math.min(Math.max(progress, 0), 1));
      } else if (start > 0) {
        setScrollProgress(0);
      } else {
        setScrollProgress(1);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", !isDark ? "dark" : "light");
  };

  if (!mounted) return null;

  const workExperience = [
    {
      period: "2025 - Present",
      role: "Technology Programme Graduate",
      company: "Tesco",
      description:
        "Rotating through technology teams, gaining experience in software development, project management, and digital transformation across one of the UK's largest retailers.",
      tags: [
        "Project Management",
        "Agile",
        "Programme Management",
        "Enterprise",
        "Digital Transformation",
      ],
    },
    {
      period: "2025 - present",
      role: "Co-Founder & CTO",
      company: "GoTutor",
      description:
        "Built and scaled an online tutoring platform from the ground up. Led technical architecture, managed development sprints, and shipped a production-ready MVP.",
      tags: ["JavaScript", "PHP", "MySQL", "Stripe", "AWS", "Leadership"],
    },
    {
      period: "Summer 2024",
      role: "Technology Intern",
      company: "Tesco",
      description:
        "Summer internship focused on internal tooling and automation projects. Worked with cross-functional teams to deliver efficiency improvements.",
      tags: ["JavaScript", "Automation", "Internal Tools"],
    },
    {
      period: "2023 - 2025",
      role: "IT Help Desk Assistant",
      company: "University of Portsmouth",
      description:
        "Provided first-line technical support to students and staff. Developed documentation and troubleshooting guides.",
      tags: ["Technical Support", "Documentation", "Customer Service"],
    },
    {
      period: "2020 - 2022",
      role: "Junior Software Engineer",
      company: "Sustainable Garden Technology Solutions (SGTS)",
      description:
        "Worked on development with the startup, creating two bespoke apps for the business.",
      tags: [
        "Web Development",
        "Laravel",
        "php",
        "JavaScript",
        "VUE.js",
        "Agile",
      ],
    },
  ];

  const education = [
    {
      period: "2022 - 2025",
      role: "BSc Software Engineering",
      company: "University of Portsmouth",
      description:
        "Second Class Higher Division with Honours in Software engineering, web development, and project management.",
      tags: [
        "Software Engineering",
        "Second Class Higher Division with Honours",
        "Software Engineering",
      ],
    },
    // Add future courses here
  ];

  const projects = [
    {
      name: "GoTutor",
      description:
        "Online tutoring platform connecting students with qualified tutors. Built with Vue.js and Node.js.",
      tags: ["JavaScript", "Node.js", "PostgreSQL"],
      link: "https://beta.gotutor.uk",
      featured: true,
      status: "live",
    },
    {
      name: "Spinwise",
      description:
        "AI-powered music recommendation app that learns your taste and creates personalized playlists.",
      tags: ["React", "Next.js", "ML"],
      link: "https://github.com/RubenTanner/Spinwise",
      status: "archived",
    },
    {
      name: "ARYAN Bot",
      description:
        "Discord moderation bot with custom commands, auto-moderation, and server analytics.",
      link: "https://github.com/RubenTanner/ARYAN",
      tags: ["Node.js", "Discord.js"],
      status: "archived",
    },
    {
      name: "Destroyers Tracker",
      description:
        "Team management and stats tracking app for my American Football team.",
      tags: ["HTML"],
      link: "https://github.com/RubenTanner/Destroyers-Strength-Tracker",
      status: "archived",
    },
  ];

  const socials = [
    { icon: "github", href: "https://github.com/RubenTanner", label: "GitHub" },
    {
      icon: "linkedin",
      href: "https://www.linkedin.com/in/ruben-tanner-75a03321a",
      label: "LinkedIn",
    },
    {
      icon: "instagram",
      href: "https://www.instagram.com/phat.yikes_31",
      label: "Instagram",
    },
    {
      icon: "discord",
      href: "https://discordapp.com/users/758775356848078848",
      label: "Discord",
    },
  ];
  const activeExperience =
    experienceTab === "work" ? workExperience : education;
  const timelineTranslate =
    scrollProgress *
    (activeExperience.length * 420 -
      (typeof window !== "undefined" ? window.innerWidth - 100 : 800));

  return (
    <div className={isDark ? "dark" : ""}>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@500;600;700&display=swap");

        :root {
          --bg: #fafafa;
          --bg-alt: #ffffff;
          --text: #0a0a0a;
          --text-secondary: #525252;
          --text-muted: #a3a3a3;
          --accent: #467ceb;
          --accent-hover: #3b6fd9;
          --border: #e5e5e5;
          --card-bg: #ffffff;
        }

        .dark {
          --bg: #0a0a0a;
          --bg-alt: #141414;
          --text: #fafafa;
          --text-secondary: #a3a3a3;
          --text-muted: #525252;
          --accent: #5b8ff7;
          --accent-hover: #7aa3f9;
          --border: #262626;
          --card-bg: #141414;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        html {
          scroll-behavior: smooth;
        }
        body {
          font-family:
            "Inter",
            -apple-system,
            sans-serif;
          background: var(--bg);
          color: var(--text);
          line-height: 1.6;
          overflow-x: hidden;
        }
        ::selection {
          background: var(--accent);
          color: white;
        }

        .display-font {
          font-family: "Space Grotesk", sans-serif;
        }
      `}</style>

      {/* Navigation */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: "var(--bg)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "0 32px",
            height: "80px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <a
            href="#"
            className="display-font"
            style={{
              fontWeight: 700,
              fontSize: "28px",
              color: "var(--text)",
              textDecoration: "none",
              letterSpacing: "-1px",
            }}
          >
            RT<span style={{ color: "var(--accent)" }}>.</span>
          </a>

          <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
            <div style={{ display: "flex", gap: "40px" }}>
              {[
                "About",
                "Experience",
                "Projects",
                "GitHub",
                "Chess",
                "Contact",
              ].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--accent)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--text-secondary)")
                  }
                >
                  {item}
                </a>
              ))}
            </div>

            <button
              onClick={toggleTheme}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                border: "2px solid var(--border)",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text)",
                fontSize: "20px",
                transition: "all 0.2s",
              }}
              aria-label="Toggle theme"
            >
              {isDark ? "☀" : "☾"}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          padding: "120px 32px 80px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <div style={{ width: "100%" }}>
          {/* Time Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 20px",
              background: "var(--bg-alt)",
              border: "1px solid var(--border)",
              borderRadius: "100px",
              marginBottom: "40px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#22c55e",
                animation: "pulse 2s infinite",
              }}
            />
            <span
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--text-secondary)",
              }}
            >
              {greeting}
            </span>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--accent)",
                background: "rgba(70, 124, 235, 0.1)",
                padding: "4px 12px",
                borderRadius: "6px",
              }}
            >
              {currentTime}
            </span>
          </div>

          {/* Main Title */}
          <h1
            className="display-font"
            style={{
              fontSize: "clamp(48px, 10vw, 120px)",
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: "-3px",
              marginBottom: "24px",
            }}
          >
            Ruben Tanner
          </h1>

          <p
            style={{
              fontSize: "clamp(20px, 3vw, 28px)",
              color: "var(--text-secondary)",
              marginBottom: "16px",
              fontWeight: 500,
            }}
          >
            Technology Programme Graduate @{" "}
            <span style={{ color: "var(--accent)", fontWeight: 700 }}>
              Tesco
            </span>
          </p>

          <p
            style={{
              fontSize: "18px",
              color: "var(--text-muted)",
              maxWidth: "600px",
              marginBottom: "48px",
              lineHeight: 1.7,
            }}
          >
            Building digital experiences. Co-founder of GoTutor. Portsmouth
            Software Engineering grad. American Football coach. Occasional chess
            enthusiast.
          </p>

          {/* Social Buttons - Big and Bold */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "16px 28px",
                  background: "var(--card-bg)",
                  border: "2px solid var(--border)",
                  borderRadius: "16px",
                  textDecoration: "none",
                  color: "var(--text)",
                  fontWeight: 600,
                  fontSize: "16px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.background = "var(--accent)";
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.background = "var(--card-bg)";
                  e.currentTarget.style.color = "var(--text)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <SocialIcon name={social.icon} size={24} />
                {social.label}
              </a>
            ))}

            {/* Sponsor Button - Pink */}
            <a
              href="https://github.com/sponsors/RubenTanner"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px 28px",
                background: "linear-gradient(135deg, #ea4aaa 0%, #f472b6 100%)",
                border: "none",
                borderRadius: "16px",
                textDecoration: "none",
                color: "white",
                fontWeight: 600,
                fontSize: "16px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 24px rgba(234, 74, 170, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <svg
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              Sponsor
            </a>
          </div>
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        style={{
          padding: "120px 32px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: "80px",
            alignItems: "start",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--accent)",
                textTransform: "uppercase",
                letterSpacing: "2px",
                marginBottom: "8px",
              }}
            >
              01 / About
            </p>
            <h2
              className="display-font"
              style={{
                fontSize: "48px",
                fontWeight: 700,
                letterSpacing: "-1px",
              }}
            >
              Who I am
            </h2>
          </div>

          <div
            style={{
              fontSize: "18px",
              color: "var(--text-secondary)",
              lineHeight: 1.8,
            }}
          >
            <p style={{ marginBottom: "24px" }}>
              I'm a technology professional currently on the{" "}
              <strong style={{ color: "var(--text)" }}>
                Graduate Technology Programme at Tesco
              </strong>
              , where I'm rotating through different technology teams and
              learning to deliver solutions at enterprise scale.
            </p>
            <p style={{ marginBottom: "24px" }}>
              In 2025, I co-founded{" "}
              <strong style={{ color: "var(--text)" }}>GoTutor</strong>, an
              online tutoring platform. As Co-Founder and CTO, I built the
              platform from scratch using Next.js, handling everything from
              database architecture to payment integration with Stripe. And I'm
              still developing it to this day in my free time.
            </p>
            <p>
              Outside of tech, I coach American Football for the{" "}
              <strong style={{ color: "var(--text)" }}>
                KCL Regents (Kings College London)
              </strong>
              . I also enjoy a good game of chess — feel free to challenge me
              below.
            </p>
          </div>
        </div>
      </section>

      {/* Experience - Horizontal Scroll Timeline */}
      <section
        id="experience"
        ref={timelineContainerRef}
        style={{
          minHeight: "250vh",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            overflow: "hidden",
            background: "var(--bg)",
          }}
        >
          {/* Section Header */}
          <div
            style={{
              padding: "0 32px 40px",
              maxWidth: "1400px",
              margin: "0 auto",
              width: "100%",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--accent)",
                textTransform: "uppercase",
                letterSpacing: "2px",
                marginBottom: "8px",
              }}
            >
              02 / Experience
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <h2
                className="display-font"
                style={{
                  fontSize: "48px",
                  fontWeight: 700,
                  letterSpacing: "-1px",
                }}
              >
                My Journey
              </h2>
              <div
                style={{ display: "flex", alignItems: "center", gap: "24px" }}
              >
                <div
                  style={{
                    display: "flex",
                    background: "var(--card-bg)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    padding: "4px",
                  }}
                >
                  <button
                    onClick={() => setExperienceTab("work")}
                    style={{
                      padding: "8px 20px",
                      borderRadius: "8px",
                      border: "none",
                      background:
                        experienceTab === "work"
                          ? "var(--accent)"
                          : "transparent",
                      color:
                        experienceTab === "work"
                          ? "white"
                          : "var(--text-muted)",
                      fontWeight: 600,
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    Work
                  </button>
                  <button
                    onClick={() => setExperienceTab("education")}
                    style={{
                      padding: "8px 20px",
                      borderRadius: "8px",
                      border: "none",
                      background:
                        experienceTab === "education"
                          ? "var(--accent)"
                          : "transparent",
                      color:
                        experienceTab === "education"
                          ? "white"
                          : "var(--text-muted)",
                      fontWeight: 600,
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    Education
                  </button>
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                  Scroll to explore
                </p>
              </div>
            </div>
          </div>

          {/* Timeline Cards */}
          <div
            ref={timelineRef}
            style={{
              display: "flex",
              gap: "24px",
              padding: "0 32px",
              transform: `translateX(-${timelineTranslate}px)`,
              transition: "transform 0.1s ease-out",
            }}
          >
            {activeExperience.map((exp, index) => (
              <div
                key={index}
                style={{
                  minWidth: "400px",
                  background: "var(--card-bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "24px",
                  padding: "40px",
                  transition: "all 0.3s",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.transform = "translateY(-8px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "24px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "48px",
                      fontWeight: 800,
                      color: "var(--accent)",
                      opacity: 0.3,
                      fontFamily: "'Space Grotesk'",
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "var(--text-muted)",
                      fontWeight: 500,
                    }}
                  >
                    {exp.period}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    marginBottom: "8px",
                    color: "var(--text)",
                  }}
                >
                  {exp.role}
                </h3>

                <p
                  style={{
                    fontSize: "16px",
                    color: "var(--accent)",
                    fontWeight: 600,
                    marginBottom: "16px",
                  }}
                >
                  {exp.company}
                </p>

                <p
                  style={{
                    fontSize: "15px",
                    color: "var(--text-secondary)",
                    marginBottom: "24px",
                    lineHeight: 1.6,
                  }}
                >
                  {exp.description}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {exp.tags.map((tag, tagIndex) => (
                    <span
                      key={`${tag}-${tagIndex}`}
                      style={{
                        padding: "6px 14px",
                        background: "rgba(70, 124, 235, 0.1)",
                        color: "var(--accent)",
                        borderRadius: "100px",
                        fontSize: "13px",
                        fontWeight: 500,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div
            style={{
              padding: "40px 32px 0",
              maxWidth: "1400px",
              margin: "0 auto",
              width: "100%",
            }}
          >
            <div
              style={{
                height: "4px",
                background: "var(--border)",
                borderRadius: "100px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${scrollProgress * 100}%`,
                  background: "var(--accent)",
                  borderRadius: "100px",
                  transition: "width 0.1s ease-out",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section
        id="projects"
        style={{
          padding: "120px 32px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: "60px" }}>
          <p
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "var(--accent)",
              textTransform: "uppercase",
              letterSpacing: "2px",
              marginBottom: "8px",
            }}
          >
            03 / Projects
          </p>
          <h2
            className="display-font"
            style={{
              fontSize: "48px",
              fontWeight: 700,
              letterSpacing: "-1px",
            }}
          >
            What I've Built
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "24px",
          }}
        >
          {projects.map((project) => (
            <a
              key={project.name}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                borderRadius: "24px",
                padding: "40px",
                textDecoration: "none",
                color: "var(--text)",
                transition: "all 0.3s",
                gridColumn: project.featured ? "span 2" : "span 1",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <h3 style={{ fontSize: "24px", fontWeight: 700 }}>
                    {project.name}
                  </h3>
                  {project.status === "live" && (
                    <span
                      style={{
                        padding: "4px 12px",
                        background: "#10b981",
                        color: "white",
                        borderRadius: "100px",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      Live
                    </span>
                  )}
                  {project.featured && (
                    <span
                      style={{
                        padding: "4px 12px",
                        background: "var(--accent)",
                        color: "white",
                        borderRadius: "100px",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      Featured
                    </span>
                  )}
                  {project.status === "archived" && (
                    <span
                      style={{
                        padding: "4px 12px",
                        background: "var(--border)",
                        color: "var(--text-muted)",
                        borderRadius: "100px",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      Archived
                    </span>
                  )}
                </div>
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: "var(--text-muted)" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 17L17 7M17 7H7M17 7v10"
                  />
                </svg>
              </div>

              <p
                style={{
                  fontSize: "16px",
                  color: "var(--text-secondary)",
                  marginBottom: "24px",
                  lineHeight: 1.6,
                }}
              >
                {project.description}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: "6px 14px",
                      background: "rgba(70, 124, 235, 0.1)",
                      color: "var(--accent)",
                      borderRadius: "100px",
                      fontSize: "13px",
                      fontWeight: 500,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* GitHub */}
      <section
        id="github"
        style={{
          padding: "80px 32px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: "48px" }}>
          <h2
            style={{
              fontSize: "clamp(36px, 5vw, 56px)",
              fontWeight: 800,
              marginBottom: "16px",
              letterSpacing: "-1px",
            }}
          >
            GitHub Activity
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "18px" }}>
            Open source contributions and coding activity
          </p>
        </div>

        <div
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
            borderRadius: "24px",
            padding: "40px",
            marginBottom: "32px",
          }}
        >
          {githubStats && (
            <>
              <div
                style={{
                  display: "flex",
                  gap: "48px",
                  marginBottom: "32px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "48px",
                      fontWeight: 800,
                      color: "var(--accent)",
                      lineHeight: 1,
                    }}
                  >
                    {githubStats.publicRepos}
                  </p>
                  <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
                    Public Repos
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "48px",
                      fontWeight: 800,
                      color: "var(--accent)",
                      lineHeight: 1,
                    }}
                  >
                    {githubStats.followers}
                  </p>
                  <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
                    Followers
                  </p>
                </div>
              </div>

              <p
                style={{
                  fontWeight: 600,
                  marginBottom: "16px",
                  color: "var(--text)",
                }}
              >
                Contribution Graph
              </p>
              <div
                style={{
                  overflowX: "auto",
                  paddingBottom: "8px",
                }}
              >
                <img
                  src={`https://ghchart.rshah.org/467ceb/RubenTanner`}
                  alt="Ruben Tanner's GitHub Contribution Graph"
                  style={{
                    width: "100%",
                    minWidth: "700px",
                    height: "auto",
                    filter: isDark ? "invert(1) hue-rotate(180deg)" : "none",
                  }}
                />
              </div>
            </>
          )}

          {!githubStats && (
            <p style={{ color: "var(--text-muted)" }}>
              Loading GitHub activity...
            </p>
          )}
        </div>

        <a
          href="https://github.com/RubenTanner"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "14px 24px",
            background: "var(--text)",
            color: "var(--bg)",
            borderRadius: "12px",
            fontWeight: 600,
            textDecoration: "none",
            transition: "all 0.2s",
          }}
        >
          <SocialIcon name="github" size={20} />
          View GitHub Profile
        </a>
      </section>

      {/* Chess */}
      <section
        id="chess"
        style={{
          padding: "80px 32px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: "48px" }}>
          <h2
            style={{
              fontSize: "clamp(36px, 5vw, 56px)",
              fontWeight: 800,
              marginBottom: "16px",
              letterSpacing: "-1px",
            }}
          >
            Play Chess
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "18px" }}>
            Challenge me to a game - powered by Stockfish
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              borderRadius: "24px",
              padding: "40px",
            }}
          >
            <StockfishChess isDark={isDark} />
          </div>
        </div>
      </section>

      {/* Contact */}
      <section
        id="contact"
        style={{
          padding: "120px 32px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "80px",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--accent)",
                textTransform: "uppercase",
                letterSpacing: "2px",
                marginBottom: "8px",
              }}
            >
              04 / Contact
            </p>
            <h2
              className="display-font"
              style={{
                fontSize: "48px",
                fontWeight: 700,
                letterSpacing: "-1px",
                marginBottom: "24px",
              }}
            >
              Let's Talk
            </h2>
            <p
              style={{
                fontSize: "18px",
                color: "var(--text-secondary)",
                marginBottom: "40px",
                lineHeight: 1.7,
              }}
            >
              Have a project in mind or just want to chat? I'm always open to
              discussing new opportunities and ideas.
            </p>

            <a
              href="mailto:hello@ruben-tanner.uk"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
                padding: "20px 32px",
                background: "var(--accent)",
                color: "white",
                borderRadius: "16px",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "18px",
                transition: "all 0.2s",
              }}
            >
              hello@ruben-tanner.uk
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>

            <div style={{ display: "flex", gap: "16px", marginTop: "40px" }}>
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: "56px",
                    height: "56px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid var(--border)",
                    borderRadius: "50%",
                    color: "var(--text)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent)";
                    e.currentTarget.style.background = "var(--accent)";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--text)";
                  }}
                  aria-label={social.label}
                >
                  <SocialIcon name={social.icon} size={24} />
                </a>
              ))}
            </div>
          </div>

          <div
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              borderRadius: "24px",
              padding: "40px",
            }}
          >
            {/* Replace YOUR_FORM_ID with your Formspree form ID from https://formspree.io */}
            <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 600,
                    marginBottom: "8px",
                    color: "var(--text)",
                  }}
                >
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  style={{
                    width: "100%",
                    padding: "16px",
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    fontSize: "16px",
                    color: "var(--text)",
                    outline: "none",
                  }}
                  placeholder="Your name"
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 600,
                    marginBottom: "8px",
                    color: "var(--text)",
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  style={{
                    width: "100%",
                    padding: "16px",
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    fontSize: "16px",
                    color: "var(--text)",
                    outline: "none",
                  }}
                  placeholder="your@email.com"
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 600,
                    marginBottom: "8px",
                    color: "var(--text)",
                  }}
                >
                  Message
                </label>
                <textarea
                  name="message"
                  rows={4}
                  required
                  style={{
                    width: "100%",
                    padding: "16px",
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    fontSize: "16px",
                    color: "var(--text)",
                    outline: "none",
                    resize: "none",
                  }}
                  placeholder="What's on your mind?"
                />
              </div>

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "18px",
                  background: "var(--text)",
                  color: "var(--bg)",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "40px 32px",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            <p>{new Date().getFullYear()} Ruben Tanner</p>
            <p style={{ marginTop: "8px" }}>
              Made with <span style={{ color: "#ef4444" }}>❤️</span> by{" "}
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                Ruben Tanner
              </span>
            </p>
          </div>
          <div style={{ display: "flex", gap: "32px" }}>
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "14px",
                  color: "var(--text-muted)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--accent)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--text-muted)")
                }
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
