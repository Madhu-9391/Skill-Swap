import { FaLinkedin, FaTwitter, FaInstagram } from "react-icons/fa";
import { API_BASE_URL } from "../config";

export default function ProfileCard({ user }) {
  if (!user) return null;

  const profileImage = user.profilePicture
    ? `${API_BASE_URL}/uploads/${user.profilePicture}`
    : "https://placehold.co/150x150?text=User";

  const sanitizeUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `https://${url}`;
  };

  return (
    <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-xl shadow-lg p-6 w-80 text-center text-white">
      {/* Profile Image */}
      <div className="relative">
        <img
          className="mx-auto h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
          src={profileImage}
          alt="Avatar"
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/150x150?text=User";
          }}
        />
      </div>

      {/* User Info */}
      <h3 className="mt-4 text-2xl font-semibold">
        {user.name || "Unnamed User"}
      </h3>
      <p className="mt-2 text-lg opacity-90">
        {user.status || "Active User"}
      </p>

      {/* Social Icons */}
      <div className="mt-4 flex justify-center space-x-4">
        {user.socials?.linkedin && (
          <a
            href={sanitizeUrl(user.socials.linkedin)}
            target="_blank"
            rel="noreferrer"
            className="text-2xl hover:text-blue-400 transition"
          >
            <FaLinkedin />
          </a>
        )}

        {user.socials?.twitter && (
          <a
            href={sanitizeUrl(user.socials.twitter)}
            target="_blank"
            rel="noreferrer"
            className="text-2xl hover:text-blue-400 transition"
          >
            <FaTwitter />
          </a>
        )}

        {user.socials?.instagram && (
          <a
            href={sanitizeUrl(user.socials.instagram)}
            target="_blank"
            rel="noreferrer"
            className="text-2xl hover:text-pink-400 transition"
          >
            <FaInstagram />
          </a>
        )}
      </div>
    </div>
  );
}
