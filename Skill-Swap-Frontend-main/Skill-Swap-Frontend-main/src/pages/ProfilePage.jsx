// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/navbar/Navbar";
import NotificationBell from "../components/NotificationBell";
import defaultAvatar from "../assets/avatar.jpeg";

import { FaLinkedin, FaGithub, FaTwitter, FaInstagram } from "react-icons/fa";
import { FiEdit, FiCalendar, FiClock } from "react-icons/fi";

import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { setNotifications } from "../redux/slices/notificationSlice";

import Background from "../components/background/Background";
import Footer from "../components/footer/Footer";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import { API_BASE_URL } from "../config";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [skillsToTeach, setSkillsToTeach] = useState([]);
  const [skillsToLearn, setSkillsToLearn] = useState([]);
  const [modalTeach, setModalTeach] = useState("");
  const [modalLearn, setModalLearn] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [pendingSessions, setPendingSessions] = useState([]);
  const [acceptedSessions, setAcceptedSessions] = useState([]);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [canceledSessions, setCanceledSessions] = useState([]);

  const [activeTab, setActiveTab] = useState("pending");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Date/time helpers
  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });

  // ----------------------------
  // Fetch profile + notifications
  // ----------------------------
  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/users/profile`, {
          headers: { "x-auth-token": token },
        });

        setUser(data);
        setSkillsToTeach(data.skillsToTeach || []);
        setSkillsToLearn(data.skillsToLearn || []);

        const notif = await axios.get(
          `${API_BASE_URL}/api/notifications/${data._id}`,
          { headers: { "x-auth-token": token } }
        );
        dispatch(setNotifications(notif.data));
      } catch {
        setError("Failed to load profile.");
      }
    };

    loadProfile();
  }, [dispatch, navigate]);

  // ----------------------------
  // Fetch sessions
  // ----------------------------
  useEffect(() => {
    const loadSessions = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const [pending, accepted, completed, canceled] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/sessions/pending`, {
            headers: { "x-auth-token": token },
          }),
          axios.get(`${API_BASE_URL}/api/sessions/accepted`, {
            headers: { "x-auth-token": token },
          }),
          axios.get(`${API_BASE_URL}/api/sessions/completed`, {
            headers: { "x-auth-token": token },
          }),
          axios.get(`${API_BASE_URL}/api/sessions/canceled`, {
            headers: { "x-auth-token": token },
          }),
        ]);

        setPendingSessions(pending.data);
        setAcceptedSessions(accepted.data);
        setCompletedSessions(completed.data);
        setCanceledSessions(canceled.data);
      } catch {
        setError("Failed to fetch sessions.");
      }
    };

    loadSessions();
  }, []);

  // ----------------------------
  // Modal handlers
  // ----------------------------
  const openModal = () => {
    setModalTeach(skillsToTeach.join(", "));
    setModalLearn(skillsToLearn.join(", "));
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError("");
    setSuccess("");
  };

  // ----------------------------
  // Update profile skills
  // ----------------------------
  const handleUpdateProfile = async () => {
    const token = localStorage.getItem("token");

    try {
      const { data } = await axios.put(
        `${API_BASE_URL}/api/users/profile`,
        {
          name: user.name, // keep name
          status: user.status,
          socials: user.socials,
          skillsToTeach: modalTeach.split(",").map((s) => s.trim()),
          skillsToLearn: modalLearn.split(",").map((s) => s.trim()),
        },
        { headers: { "x-auth-token": token } }
      );

      setUser(data);
      setSkillsToTeach(data.skillsToTeach);
      setSkillsToLearn(data.skillsToLearn);
      setSuccess("Profile updated!");
      closeModal();
    } catch {
      setError("Failed to update profile.");
    }
  };

  // ----------------------------
  // Accept session
  // ----------------------------
  const handleAccept = async (id) => {
    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/sessions/accept`,
        { sessionId: id },
        { headers: { "x-auth-token": token } }
      );

      setPendingSessions((ps) => ps.filter((s) => s._id !== id));
      setAcceptedSessions((as) => [...as, res.data.session]);
      setSuccess("Session accepted!");
    } catch {
      setError("Failed to accept session.");
    }
  };

  const handleStartChat = (id) => navigate(`/chat/${id}`);

  const getPartnerName = (session) => {
    const partner =
      session.userId1?._id === user?._id
        ? session.userId2
        : session.userId1;
    return partner?.name || "Unknown";
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen relative">
      <Background />

      <div className="relative z-10">
        <Navbar />

        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
            {/* Profile Card */}
            <div className="bg-gradient-to-br from-blue-400 via-blue-300 to-blue-200 rounded-xl shadow-lg p-6 relative flex flex-col md:flex-row items-center gap-6">
              {/* Controls */}
              <div className="absolute top-4 right-4 flex items-center gap-3">
                <NotificationBell />
                <button
                  onClick={() => navigate("/profile-settings")}
                  className="bg-blue-600 p-3 rounded-full text-white hover:bg-blue-700 transition"
                >
                  <FiEdit size={20} />
                </button>
              </div>

              {/* Avatar */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white">
                <img
                  src={
                    user.profilePicture
                      ? `${API_BASE_URL}/uploads/profile-pictures/${user.profilePicture}`
                      : defaultAvatar
                  }
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* User Info */}
              <div>
                <h2 className="text-3xl font-bold text-white">{user.name}</h2>
                {user.status && (
                  <p className="text-white opacity-90 mt-1">
                    <span className="font-semibold">Status:</span>{" "}
                    {user.status}
                  </p>
                )}

                {/* Socials */}
                <div className="flex gap-4 mt-3">
                  {user.socials?.linkedin && (
                    <a href={user.socials.linkedin} target="_blank">
                      <FaLinkedin className="text-blue-700" size={22} />
                    </a>
                  )}
                  {user.socials?.facebook && (
                    <a href={user.socials.facebook} target="_blank">
                      <i className="fab fa-facebook text-blue-700 text-xl"></i>
                    </a>
                  )}
                  {user.socials?.twitter && (
                    <a href={user.socials.twitter} target="_blank">
                      <FaInstagram className="text-pink-500" size={22} />
                    </a>
                  )}
                </div>
              </div>

              {/* Session Stats */}
              <div className="flex gap-6 ml-auto">
                {/* Completed */}
                <div className="w-20 h-20">
                  <CircularProgressbar
                    value={
                      (completedSessions.length /
                        (pendingSessions.length +
                          acceptedSessions.length +
                          completedSessions.length +
                          canceledSessions.length)) *
                        100 || 0
                    }
                    text={`${completedSessions.length}`}
                    styles={buildStyles({
                      textColor: "#fff",
                      pathColor: "#4caf50",
                      trailColor: "#ffffff55",
                    })}
                  />
                </div>

                {/* Pending */}
                <div className="w-20 h-20">
                  <CircularProgressbar
                    value={
                      (pendingSessions.length /
                        (pendingSessions.length +
                          acceptedSessions.length +
                          completedSessions.length +
                          canceledSessions.length)) *
                        100 || 0
                    }
                    text={`${pendingSessions.length}`}
                    styles={buildStyles({
                      textColor: "#fff",
                      pathColor: "#ff9800",
                      trailColor: "#ffffff55",
                    })}
                  />
                </div>

                {/* Accepted */}
                <div className="w-20 h-20">
                  <CircularProgressbar
                    value={
                      (acceptedSessions.length /
                        (pendingSessions.length +
                          acceptedSessions.length +
                          completedSessions.length +
                          canceledSessions.length)) *
                        100 || 0
                    }
                    text={`${acceptedSessions.length}`}
                    styles={buildStyles({
                      textColor: "#fff",
                      pathColor: "#2196f3",
                      trailColor: "#ffffff55",
                    })}
                  />
                </div>

                {/* Canceled */}
                <div className="w-20 h-20">
                  <CircularProgressbar
                    value={
                      (canceledSessions.length /
                        (pendingSessions.length +
                          acceptedSessions.length +
                          completedSessions.length +
                          canceledSessions.length)) *
                        100 || 0
                    }
                    text={`${canceledSessions.length}`}
                    styles={buildStyles({
                      textColor: "#fff",
                      pathColor: "#f44336",
                      trailColor: "#ffffff55",
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Skills + Sessions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skills Card */}
              <div className="bg-gradient-to-br from-blue-300 to-blue-200 rounded-lg shadow p-6">
                <div className="flex justify-between mb-4">
                  <h3 className="text-2xl font-semibold text-gray-800">
                    Your Skills
                  </h3>
                  <button
                    onClick={openModal}
                    className="bg-blue-600 text-white px-3 py-1 rounded-full"
                  >
                    <FiEdit size={18} />
                  </button>
                </div>

                <p className="font-semibold text-gray-700">
                  Skills You Can Teach:
                </p>
                <div className="flex gap-2 flex-wrap mt-2">
                  {skillsToTeach.length > 0 ? (
                    skillsToTeach.map((s, i) => (
                      <span
                        key={i}
                        className="bg-blue-200 text-blue-900 px-3 py-1 rounded-full"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">None</span>
                  )}
                </div>

                <p className="font-semibold text-gray-700 mt-4">
                  Skills You Want to Learn:
                </p>
                <div className="flex gap-2 flex-wrap mt-2">
                  {skillsToLearn.length > 0 ? (
                    skillsToLearn.map((s, i) => (
                      <span
                        key={i}
                        className="bg-green-200 text-green-900 px-3 py-1 rounded-full"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">None</span>
                  )}
                </div>
              </div>

              {/* Sessions Card */}
              <div className="bg-gradient-to-br from-blue-300 to-blue-200 rounded-lg shadow p-6">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  Your Sessions
                </h3>

                {/* Tabs */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  {["pending", "upcoming", "completed", "canceled"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        activeTab === tab
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Sessions list */}
                <div className="overflow-y-auto h-64 space-y-3 pr-2">
                  {(
                    activeTab === "pending"
                      ? pendingSessions
                      : activeTab === "upcoming"
                      ? acceptedSessions
                      : activeTab === "completed"
                      ? completedSessions
                      : canceledSessions
                  ).map((s) => (
                    <div
                      key={s._id}
                      className="bg-white p-3 rounded-lg shadow flex flex-col"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">
                          {getPartnerName(s)}
                        </span>
                        <span className="text-gray-600">{s.skill}</span>
                      </div>

                      <div className="flex gap-3 text-gray-600 text-sm mt-2">
                        <div className="flex items-center gap-1">
                          <FiCalendar /> {formatDate(s.sessionDate)}
                        </div>
                        <div className="flex items-center gap-1">
                          <FiClock /> {formatTime(s.sessionDate)}
                        </div>
                      </div>

                      <div className="mt-3">
                        {activeTab === "pending" ? (
                          <button
                            onClick={() => handleAccept(s._id)}
                            className="bg-green-600 px-3 py-1 text-white rounded-lg"
                          >
                            Accept
                          </button>
                        ) : activeTab === "upcoming" ? (
                          <button
                            onClick={() => handleStartChat(s._id)}
                            className="bg-blue-600 px-3 py-1 text-white rounded-lg"
                          >
                            Start Chat
                          </button>
                        ) : (
                          <span className="text-gray-500 text-sm">
                            No actions
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
                initial={{ y: 300 }}
                animate={{ y: 0 }}
                exit={{ y: 300 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <h3 className="text-xl font-semibold mb-4">
                  Update Your Skills
                </h3>

                <input
                  className="w-full p-2 border rounded mb-3"
                  value={modalTeach}
                  onChange={(e) => setModalTeach(e.target.value)}
                />

                <input
                  className="w-full p-2 border rounded mb-3"
                  value={modalLearn}
                  onChange={(e) => setModalLearn(e.target.value)}
                />

                <div className="flex justify-end gap-3">
                  <button
                    onClick={closeModal}
                    className="bg-gray-300 px-4 py-1 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateProfile}
                    className="bg-blue-600 text-white px-4 py-1 rounded"
                  >
                    Save
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Footer />
      </div>
    </div>
  );
};

export default ProfilePage;
