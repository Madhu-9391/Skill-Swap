import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/navbar/Navbar";
import Background from "../components/background/Background";
import "../components/background/Background.css";
import { FaPaperPlane, FaSearch } from "react-icons/fa";
import Footer from "../components/footer/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { API_BASE_URL } from "../config";

const SkillMatchingPage = () => {
  const [matches, setMatches] = useState([]);
  const [ratings, setRatings] = useState({});
  const [sessionDetails, setSessionDetails] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessages, setErrorMessages] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      if (!token || !user) return navigate("/login");

      try {
        const res = await axios.get(`${API_BASE_URL}/api/matches`, {
          headers: { "x-auth-token": token },
        });

        setMatches(res.data);

        // Fetch all ratings
        const ratingsPromises = res.data.map(async (match) => {
          const id = match.user._id;

          const ratingRes = await axios.get(
            `${API_BASE_URL}/api/sessions/ratings/${id}`,
            { headers: { "x-auth-token": token } }
          );

          return { id, rating: ratingRes.data.averageRating };
        });

        const ratingsList = await Promise.all(ratingsPromises);

        const mappedRatings = ratingsList.reduce((acc, r) => {
          acc[r.id] = r.rating;
          return acc;
        }, {});

        setRatings(mappedRatings);
      } catch (err) {
        console.error("Error fetching matches:", err);
      }
    };

    fetchMatches();
  }, [navigate]);

  const sendSessionRequest = async (userId) => {
    const token = localStorage.getItem("token");
    const { date, time } = sessionDetails[userId] || {};

    const skill = matches.find((m) => m.user._id === userId)?.teachSkill;

    const newErrors = {};

    // Date validations
    if (!date) newErrors.date = "Please select a date";
    else {
      const today = new Date();
      const selected = new Date(date + "T00:00:00");
      if (selected < today.setHours(0, 0, 0, 0))
        newErrors.date = "Selected date is in the past";
    }

    // Time validations
    if (!time) newErrors.time = "Please select a time";
    else {
      const now = new Date();
      const sessionTime = new Date(`${date}T${time}`);
      if (sessionTime < now) newErrors.time = "Selected time is in the past";
    }

    setErrorMessages((prev) => ({ ...prev, [userId]: newErrors }));

    if (Object.keys(newErrors).length > 0) return;

    try {
      await axios.post(
        `${API_BASE_URL}/api/sessions/request`,
        { userId2: userId, sessionDate: date, sessionTime: time, skill },
        { headers: { "x-auth-token": token } }
      );

      await axios.post(
        `${API_BASE_URL}/api/notifications/send`,
        {
          userId,
          message: `You have a new session request for ${skill} on ${date} at ${time}`,
          type: "session_request",
        },
        { headers: { "x-auth-token": token } }
      );

      toast.success("Session request sent!", {
        autoClose: 1800,
      });

      // Reset fields
      setSessionDetails((prev) => ({
        ...prev,
        [userId]: { date: "", time: "" },
      }));
    } catch (err) {
      console.error("Error sending session request:", err);
      toast.error("Unable to send session request.");
    }
  };

  return (
    <div className="min-h-screen relative">
      <Background />

      <div className="relative z-10">
        <Navbar />

        <div className="container mx-auto px-4 md:px-8 py-10">
          <h1 className="text-4xl font-bold text-center text-white mb-4">
            Skill Matching
          </h1>

          <p className="text-center text-white mb-8 italic">
            Browse your matches and schedule a learning session.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto mb-10">
            <input
              type="text"
              placeholder="Search by name or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 pl-12 pr-4 rounded-xl bg-white/10 text-white placeholder-white/70 backdrop-blur-md border border-white/30 focus:ring-2 focus:ring-[#4361ee]"
            />
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-200" />
          </div>

          {/* Matches */}
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {matches.length > 0 ? (
              matches
                .filter((m) =>
                  `${m.user.name} ${m.teachSkill}`
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
                )
                .map((match) => {
                  const id = match.user._id;

                  return (
                    <div
                      key={id}
                      className="bg-gradient-to-br from-blue-400 to-blue-200 rounded-2xl shadow-lg p-6"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          className="w-14 h-14 rounded-full border border-white/20"
                          src={
                            match.user.profilePicture
                              ? `${API_BASE_URL}/uploads/profile-pictures/${match.user.profilePicture}`
                              : "/default-avatar.png"
                          }
                          alt="Profile"
                        />

                        <div className="w-full">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">
                              {match.user.name}
                            </h3>
                            <span className="text-white font-bold uppercase">
                              {match.teachSkill}
                            </span>
                          </div>

                          <div className="flex justify-between mt-1">
                            <span className="text-white/80 text-sm">
                              {match.user.status || ""}
                            </span>
                            <span className="text-yellow-300 text-sm">
                              {ratings[id] || "N/A"} ⭐
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Date */}
                      <label className="block text-white text-sm">
                        Date:
                        <input
                          type="date"
                          value={sessionDetails[id]?.date || ""}
                          onChange={(e) =>
                            setSessionDetails((prev) => ({
                              ...prev,
                              [id]: {
                                ...prev[id],
                                date: e.target.value,
                              },
                            }))
                          }
                          className="w-full mt-1 px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30"
                        />
                        {errorMessages[id]?.date && (
                          <p className="text-red-500 text-xs">
                            {errorMessages[id].date}
                          </p>
                        )}
                      </label>

                      {/* Time */}
                      <label className="block mt-3 text-white text-sm">
                        Time:
                        <input
                          type="time"
                          value={sessionDetails[id]?.time || ""}
                          onChange={(e) =>
                            setSessionDetails((prev) => ({
                              ...prev,
                              [id]: {
                                ...prev[id],
                                time: e.target.value,
                              },
                            }))
                          }
                          className="w-full mt-1 px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30"
                        />
                        {errorMessages[id]?.time && (
                          <p className="text-red-500 text-xs">
                            {errorMessages[id].time}
                          </p>
                        )}
                      </label>

                      <button
                        onClick={() => sendSessionRequest(id)}
                        className="mt-4 w-full py-2 bg-white text-[#4361ee] font-bold rounded-xl flex justify-center items-center gap-2"
                      >
                        <FaPaperPlane /> Send Session Request
                      </button>
                    </div>
                  );
                })
            ) : (
              <div className="text-center text-white font-bold">
                No Matches Found
              </div>
            )}
          </div>

          <ToastContainer />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SkillMatchingPage;
