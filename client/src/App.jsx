import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
const api = axios.create({ baseURL: API_BASE_URL });
const navItems = ["Overview", "Projects", "Tasks", "Members"];

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "", role: "member" });
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [projectForm, setProjectForm] = useState({ name: "", description: "", members: "" });
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    project: "",
    assignedTo: "",
    dueDate: "",
    status: "todo",
  });
  const [error, setError] = useState("");

  const isAdmin = useMemo(() => user?.role === "admin", [user]);
  const dashboardLabelMap = {
    total: "Total",
    todo: "Todo",
    inProgress: "In Progress",
    done: "Done",
    overdue: "Overdue",
  };

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const logout = useCallback(() => {
    setToken("");
    setUser(null);
    setProjects([]);
    setTasks([]);
    setUsers([]);
    setDashboard(null);
    localStorage.removeItem("token");
    delete api.defaults.headers.common.Authorization;
  }, []);

  const hydrateData = useCallback(async () => {
    try {
      setError("");
      const meRes = await api.get("/auth/me");
      setUser(meRes.data);
      const [projectRes, taskRes, dashboardRes] = await Promise.all([
        api.get("/projects"),
        api.get("/tasks"),
        api.get("/dashboard"),
      ]);
      setProjects(projectRes.data);
      setTasks(taskRes.data);
      setDashboard(dashboardRes.data);

      if (meRes.data.role === "admin") {
        const usersRes = await api.get("/auth/users");
        setUsers(usersRes.data);
      } else {
        const userMap = new Map();
        projectRes.data.forEach((project) => {
          project.members?.forEach((member) => userMap.set(member._id, member));
          if (project.createdBy?._id) userMap.set(project.createdBy._id, project.createdBy);
        });
        setUsers(Array.from(userMap.values()));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data");
      logout();
    }
  }, [logout]);

  useEffect(() => {
    if (!token) return;
    localStorage.setItem("token", token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    Promise.resolve().then(hydrateData);
  }, [token, hydrateData]);

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      setError("");
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/signup";
      const payload = authMode === "login" ? { email: authForm.email, password: authForm.password } : authForm;
      const res = await api.post(endpoint, payload);
      setToken(res.data.token);
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed");
    }
  };

  const createProject = async (e) => {
    e.preventDefault();
    try {
      const members = projectForm.members.split(",").map((v) => v.trim()).filter(Boolean);
      await api.post("/projects", { ...projectForm, members });
      setProjectForm({ name: "", description: "", members: "" });
      hydrateData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    try {
      await api.post("/tasks", taskForm);
      setTaskForm({ title: "", description: "", project: "", assignedTo: "", dueDate: "", status: "todo" });
      hydrateData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      hydrateData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update task");
    }
  };

  const scrollToSection = (sectionName) => {
    document.getElementById(sectionName.toLowerCase())?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const deleteProject = async (projectId) => {
    if (!window.confirm("Delete this project and all of its tasks?")) return;
    try {
      setError("");
      await api.delete(`/projects/${projectId}`);
      hydrateData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete project");
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      setError("");
      await api.delete(`/tasks/${taskId}`);
      hydrateData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete task");
    }
  };

  if (!token) {
    return (
      <div className="auth-shell">
        <div className="card auth-card fade-in">
          <div className="auth-heading">
            <h1>Team Task Manager</h1>
            <p className="muted">
              {authMode === "login" ? "Welcome back. Please login." : "Create your account"}
            </p>
          </div>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleAuth} className="grid">
            {authMode === "signup" && (
              <>
                <div className="field">
                  <label>Name</label>
                  <input
                    placeholder="Enter full name"
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label>Role</label>
                  <select value={authForm.role} onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </>
            )}
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                placeholder="name@company.com"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                required
              />
            </div>
            <button type="submit">{authMode === "login" ? "Login" : "Sign up"}</button>
          </form>
          <button className="secondary" onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}>
            {authMode === "login" ? "Need an account? Sign up" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand-button" type="button" onClick={() => scrollToSection("Overview")}>
          <span className="brand-dot" />
          <span>Team Task Manager</span>
        </button>
        <nav className="top-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <button key={item} className="nav-item" type="button" onClick={() => scrollToSection(item)}>
              {item}
            </button>
          ))}
        </nav>
        <div className="top-actions">
          <button className="secondary" type="button" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            {theme === "light" ? "Dark" : "Light"}
          </button>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <main className="content-area">
        <section id="overview" className="header-row card fade-in">
          <div>
            <h1>Dashboard</h1>
            <p className="muted">
              Logged in as <strong>{user?.name}</strong> ({user?.role})
            </p>
          </div>
          <p className="role-pill">Role: {user?.role}</p>
        </section>

        {error && <p className="error">{error}</p>}

        {dashboard && (
          <section className="grid grid-5">
            {Object.entries(dashboard).map(([key, value], index) => (
              <article className="card stat-card fade-in-up" style={{ animationDelay: `${index * 80}ms` }} key={key}>
                <h3>{dashboardLabelMap[key] || key}</h3>
                <p>{value}</p>
              </article>
            ))}
          </section>
        )}

        {isAdmin && (
          <section className="card fade-in-up">
            <h2>Create Project</h2>
            <form className="grid" onSubmit={createProject}>
              <div className="field">
                <label>Project Name</label>
                <input
                  placeholder="Enter project name"
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label>Description</label>
                <input
                  placeholder="Optional details"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Member Emails</label>
                <input
                  placeholder="Comma-separated emails"
                  value={projectForm.members}
                  onChange={(e) => setProjectForm({ ...projectForm, members: e.target.value })}
                />
              </div>
              <button type="submit">Create Project</button>
            </form>
          </section>
        )}

        <section id="projects" className="card fade-in-up">
          <div className="section-head">
            <h2>Projects</h2>
            <span className="muted">{projects.length} total</span>
          </div>
          <div className="project-list">
            {projects.map((project) => (
              <article key={project._id} className="project-card">
                <div className="item-head">
                  <h3>{project.name}</h3>
                  {isAdmin && (
                    <button className="danger small-button" type="button" onClick={() => deleteProject(project._id)}>
                      Delete
                    </button>
                  )}
                </div>
                <p>{project.description || "No description"}</p>
                <div className="project-meta muted">
                  <span>Members: {project.members?.length || 0}</span>
                  <span>Owner: {project.createdBy?.name || "N/A"}</span>
                </div>
              </article>
            ))}
            {projects.length === 0 && <p className="muted">No projects found.</p>}
          </div>
        </section>

        {isAdmin ? (
          <section className="card fade-in-up">
            <h2>Create Task</h2>
            <form className="grid grid-2" onSubmit={createTask}>
              <div className="field full">
                <label>Task Title</label>
                <input
                  placeholder="Enter task title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="field full">
                <label>Description</label>
                <input
                  placeholder="Optional details"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Project</label>
                <select value={taskForm.project} onChange={(e) => setTaskForm({ ...taskForm, project: e.target.value })} required>
                  <option value="">Select project</option>
                  {projects.map((project) => (
                    <option value={project._id} key={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Assign To</label>
                <select value={taskForm.assignedTo} onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })} required>
                  <option value="">Select member</option>
                  {users.map((member) => (
                    <option value={member._id} key={member._id}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Due Date</label>
                <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} required />
              </div>
              <div className="field">
                <label>Status</label>
                <select value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}>
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <button type="submit" className="full">
                Create Task
              </button>
            </form>
          </section>
        ) : (
          <section className="card fade-in-up">
            <h2>Member Panel</h2>
            <p className="muted">
              Tasks are assigned by admins. You can update your task status from the list below.
            </p>
          </section>
        )}

        <section id="tasks" className="card fade-in-up">
          <div className="section-head">
            <h2>Tasks</h2>
            <span className="muted">{tasks.length} total</span>
          </div>
          <div className="task-list">
            {tasks.map((task) => (
              <article key={task._id} className="task-item">
                <div>
                  <h3>{task.title}</h3>
                  <p>{task.description || "No description"}</p>
                  <div className="task-meta">
                    <p>Project: {task.project?.name}</p>
                    <p>Assigned To: {task.assignedTo?.name}</p>
                    <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                  </div>
                  <span className={`status-chip status-${task.status}`}>{task.status}</span>
                </div>
                <div className="task-actions">
                  <label>Status</label>
                  <select value={task.status} onChange={(e) => updateTaskStatus(task._id, e.target.value)}>
                    <option value="todo">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                  {isAdmin && (
                    <button className="danger" type="button" onClick={() => deleteTask(task._id)}>
                      Delete
                    </button>
                  )}
                </div>
              </article>
            ))}
            {tasks.length === 0 && <p className="muted">No tasks yet.</p>}
          </div>
        </section>

        <section id="members" className="card fade-in-up">
          <div className="section-head">
            <h2>Members</h2>
            <span className="muted">{users.length} total</span>
          </div>
          <div className="member-list">
            {users.map((member) => (
              <article className="member-card" key={member._id}>
                <h3>{member.name}</h3>
                <p className="muted">{member.email}</p>
                <span className="role-pill">{member.role}</span>
              </article>
            ))}
            {users.length === 0 && <p className="muted">No members found.</p>}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
