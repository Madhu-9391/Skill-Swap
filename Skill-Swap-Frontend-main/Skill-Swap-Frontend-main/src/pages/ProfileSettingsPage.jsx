// src/pages/ProfileSettingsPage.jsx
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/slices/profileSlice";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar/Navbar";
import { FaEdit } from "react-icons/fa";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import defaultAvatar from "../assets/avatar.jpeg";
import Background from "../components/background/Background";
import "../components/background/Background.css";
import Footer from "../components/footer/Footer";
import { API_BASE_URL } from "../config";

const ProfileSettingsPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    profilePicture: "",
    status: "",
    socials: { linkedin: "", facebook: "", twitter: "" },
    skillsToTeach: "",
    skillsToLearn: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    currentPasswordVisible: false,
    newPasswordVisible: false,
    confirmNewPasswordVisible: false,
  });

  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(`${API_BASE_URL}/api/users/profile`, {
          headers: { "x-auth-token": token },
        });

        const data = res.data;

        setFormData({
          name: data.name || "",
          profilePicture: data.profilePicture || "",
          status: data.status || "",
          socials: data.socials || {
            linkedin: "",
            facebook: "",
            twitter: "",
          },
          skillsToTeach: data.skillsToTeach
            ? data.skillsToTeach.join(", ")
            : "",
          skillsToLearn: data.skillsToLearn
            ? data.skillsToLearn.join(", ")
            : "",
        });

        if (data.profilePicture) {
          setImagePreview(
            `${API_BASE_URL}/uploads/profile-pictures/${data.profilePicture}`
          );
        }
      } catch {
        setMessage("Failed to load profile data.");
      }
    };

    fetchProfile();
  }, []);

  const avatarSrc = imagePreview
    ? imagePreview
    : formData.profilePicture
    ? `${API_BASE_URL}/uploads/profile-pictures/${formData.profilePicture}`
    : defaultAvatar;

  // Handle update profile
  const handleUpdate = async () => {
    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("status", formData.status);

    const teachArr = formData.skillsToTeach
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const learnArr = formData.skillsToLearn
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    teachArr.forEach((skill) => payload.append("skillsToTeach[]", skill));
    learnArr.forEach((skill) => payload.append("skillsToLearn[]", skill));

    payload.append("socials[linkedin]", formData.socials.linkedin);
    payload.append("socials[facebook]", formData.socials.facebook);
    payload.append("socials[twitter]", formData.socials.twitter);

    if (formData.profilePicture instanceof File) {
      payload.append("profilePicture", formData.profilePicture);
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${API_BASE_URL}/api/users/profile`, payload, {
        headers: {
          "x-auth-token": token,
          "Content-Type": "multipart/form-data",
        },
      });

      dispatch(setUser(res.data));
      setMessage("Profile updated successfully!");
      navigate("/profile");
    } catch {
      setMessage("Update failed. Please try again.");
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      setMessage("Passwords don't match!");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API_BASE_URL}/api/users/change-password`,
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        },
        { headers: { "x-auth-token": token } }
      );

      setMessage("Password updated successfully!");
    } catch {
      setMessage("Password update failed. Please try again.");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, profilePicture: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen relative">
      <Background />

      <div className="relative z-10 bg-transparent">
        <Navbar />

        <div className="bg-gradient-to-br from-blue-400 via-blue-300 to-blue-200 max-w-xl mx-auto p-6 shadow-lg rounded-xl mt-6">
          <h2 className="text-2xl font-bold mb-4 text-white">Edit Profile</h2>
          {message && <div className="mb-4 text-green-600">{message}</div>}

          {/* Avatar */}
          <div className="mb-6 flex justify-center">
            <label htmlFor="profilePicture" className="cursor-pointer">
              <div className="w-32 h-32 rounded-full overflow-hidden relative">
                <img
                  src={avatarSrc}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 right-0 bg-gray-700 p-2 rounded-full">
                  <FaEdit className="text-white" />
                </div>
              </div>
            </label>
            <input
              type="file"
              id="profilePicture"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          {/* Form Inputs */}
          <div className="space-y-6">
            <div>
              <label className="font-semibold text-gray-700">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full p-3 border rounded-lg bg-gray-100"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700">Status</label>
              <input
                type="text"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full p-3 border rounded-lg bg-gray-100"
              />
            </div>

            {/* Socials */}
            {["linkedin", "facebook", "twitter"].map((key) => (
              <div key={key}>
                <label className="font-semibold text-gray-700">
                  {key.charAt(0).toUpperCase() + key.slice(1)} URL
                </label>
                <input
                  type="text"
                  value={formData.socials[key]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socials: {
                        ...formData.socials,
                        [key]: e.target.value,
                      },
                    })
                  }
                  className="w-full p-3 border rounded-lg bg-gray-100"
                />
              </div>
            ))}

            {/* Skills */}
            <div>
              <label className="font-semibold text-gray-700">
                Skills You Can Teach
              </label>
              <input
                type="text"
                value={formData.skillsToTeach}
                onChange={(e) =>
                  setFormData({ ...formData, skillsToTeach: e.target.value })
                }
                className="w-full p-3 border rounded-lg bg-gray-100"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700">
                Skills You Want to Learn
              </label>
              <input
                type="text"
                value={formData.skillsToLearn}
                onChange={(e) =>
                  setFormData({ ...formData, skillsToLearn: e.target.value })
                }
                className="w-full p-3 border rounded-lg bg-gray-100"
              />
            </div>
          </div>

          {/* Save Changes */}
          <button
            onClick={handleUpdate}
            className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Save Changes
          </button>

          {/* Change Password */}
          <div className="mt-8 border-t pt-6 space-y-6">
            {[
              {
                key: "currentPassword",
                label: "Current Password",
                visible: "currentPasswordVisible",
              },
              {
                key: "newPassword",
                label: "New Password",
                visible: "newPasswordVisible",
              },
              {
                key: "confirmNewPassword",
                label: "Confirm New Password",
                visible: "confirmNewPasswordVisible",
              },
            ].map(({ key, label, visible }) => (
              <div key={key} className="relative">
                <label className="font-semibold text-gray-700">{label}</label>
                <input
                  type={passwords[visible] ? "text" : "password"}
                  value={passwords[key]}
                  onChange={(e) =>
                    setPasswords({ ...passwords, [key]: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg bg-gray-100"
                />
                <span
                  className="absolute right-3 top-10 cursor-pointer"
                  onClick={() =>
                    setPasswords({
                      ...passwords,
                      [visible]: !passwords[visible],
                    })
                  }
                >
                  {passwords[visible] ? (
                    <AiOutlineEyeInvisible />
                  ) : (
                    <AiOutlineEye />
                  )}
                </span>
              </div>
            ))}

            <button
              onClick={handlePasswordChange}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition"
            >
              Change Password
            </button>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
