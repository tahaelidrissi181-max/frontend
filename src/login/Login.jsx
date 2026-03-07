import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faEye, faEyeSlash, faCircleExclamation, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import api from "../api/axios";

function Login() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Input states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowError(false);
    setShowSuccess(false);
    setLoading(true);

    setTimeout(async () => {
      if (username && password) {
        try {
          const response = await api.post("/login", {
            email: username,
            password,
          });
          localStorage.setItem("token", response.data.token);
          setShowSuccess(true);

          setTimeout(() => {
            location.reload();
          }, 1000);

        } catch (error) {
          setShowError(true);
          console.error(error.response?.data || error.message);
        } finally {
          setLoading(false);
        }
      } else {
        setShowError(true);
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-purple-600 to-purple-800 text-white p-3 overflow-hidden font-poppins">
      
      {/* Animated circles */}
      <div className="absolute rounded-full bg-white/5 w-[300px] h-[300px] -top-36 -left-36 animate-[float_20s_infinite]"></div>
      <div className="absolute rounded-full bg-white/5 w-[200px] h-[140px] -bottom-24 -right-24 animate-[float_20s_infinite_5s]"></div>
      <div className="absolute rounded-full bg-white/5 w-[150px] h-[150px] top-1/2 right-[10%] animate-[float_20s_infinite_10s]"></div>

      {/* Login Form */}
      <div className="login-container w-[480px] max-w-[90%] relative z-10 animate-fadeInUp">
        <div className="login-card bg-purple-700/50 backdrop-blur-2xl rounded-[30px] p-5 shadow-2xl border border-white/20 relative">
          <div className="login-title text-center mb-4">
            <h2 className="text-[11px] font-semibold mb-2">Connexion</h2>
            <p className="text-[11px] opacity-80">Accédez à votre espace Optijob</p>
          </div>

          {/* Messages */}
          {showError && (
            <div className="error-message show bg-red-500/20 border border-red-600 text-red-400 p-3 rounded-xl mb-4 text-[11px] animate-shake flex items-center gap-2">
              <FontAwesomeIcon icon={faCircleExclamation} className="text-white text-[11px]" />
              <span>Identifiants incorrects</span>
            </div>
          )}
          {showSuccess && (
            <div className="success-message show bg-green-500/20 border border-green-500 text-green-400 p-3 rounded-xl mb-4 text-[11px] flex items-center gap-2">
              <FontAwesomeIcon icon={faCircleCheck} className="text-white text-[11px]" />
              <span>Connexion réussie!</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div className="form-group mb-4">
              <label className="block text-[11px] font-medium mb-3">Nom d'utilisateur</label>
              <div className="input-wrapper flex items-center bg-purple-200/40 rounded-full p-1.5 pl-5 border-2 border-transparent focus-within:bg-purple-200/60 focus-within:border-white/30 focus-within:translate-y-[-2px] focus-within:shadow-md">
                <div className="icon-circle w-9 h-9 bg-purple-200/70 rounded-full flex items-center justify-center mr-4 shrink-0 transition-all duration-300 ease-in-out">
                  <FontAwesomeIcon icon={faUser} className="text-white text-[11px]" />
                </div>
                <input
                  type="text"
                  placeholder="••••••••••••••••"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-white text-[11px] py-2 pr-5 font-poppins placeholder-white/60 focus:placeholder-opacity-0"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group mb-4">
              <label className="block text-[11px] font-medium mb-3">Mot de passe</label>
              <div className="input-wrapper flex items-center bg-purple-200/40 rounded-full p-1.5 pl-5 border-2 border-transparent focus-within:bg-purple-200/60 focus-within:border-white/30 focus-within:translate-y-[-2px] focus-within:shadow-md relative">
                <div className="icon-circle w-9 h-9 bg-purple-200/70 rounded-full flex items-center justify-center mr-4 shrink-0 transition-all duration-300 ease-in-out">
                  <FontAwesomeIcon icon={faLock} className="text-white text-[11px]" />
                </div>
                <input
                  type={passwordVisible ? "text" : "password"}
                  placeholder="••••••••••••••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-white text-[11px] py-2 pr-10 font-poppins placeholder-white/60 focus:placeholder-opacity-0"
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute right-5 cursor-pointer text-white/70 hover:text-white hover:scale-110 transition-all"
                >
                  <FontAwesomeIcon icon={passwordVisible ? faEye : faEyeSlash} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`btn-login w-full py-4 bg-purple-200/40 rounded-full text-white text-[12px] font-semibold mt-8 relative overflow-hidden shadow-md transition-all ${
                loading ? "pointer-events-none opacity-70" : ""
              }`}
            >
              <span className={`relative z-10 ${loading ? "opacity-0" : ""}`}>
                CONNEXION
              </span>
              {loading && (
                <span className="absolute w-5 h-5 border-2 border-white border-t-transparent rounded-full left-1/2 animate-spin"></span>
              )}
            </button>
          </form>

        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes float {
          0%,100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.1); }
        }
        .animate-float { animation: float 20s infinite; }
        .animate-float-delay-5 { animation: float 20s infinite 5s; }
        .animate-float-delay-10 { animation: float 20s infinite 10s; }

        @keyframes pulse {
          0%,100% { transform: scale(1); box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
          50% { transform: scale(1.05); box-shadow: 0 12px 30px rgba(0,0,0,0.25); }
        }
        .animate-pulse { animation: pulse 3s infinite; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.8s ease; }

        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake { animation: shake 0.5s; }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown { animation: slideDown 0.3s ease; }
      `}</style>
    </div>
  );
}

export default Login