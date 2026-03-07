import { useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

const SidePopup = ({ show, type = "success", message, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const types = {
    success: {
      icon: <CheckCircle className="w-5 h-5" />,
      color: "bg-emerald-500",
      light: "bg-emerald-50 text-emerald-700",
    },
    error: {
      icon: <XCircle className="w-5 h-5" />,
      color: "bg-red-500",
      light: "bg-red-50 text-red-700",
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5" />,
      color: "bg-amber-500",
      light: "bg-amber-50 text-amber-700",
    },
    info: {
      icon: <Info className="w-5 h-5" />,
      color: "bg-blue-500",
      light: "bg-blue-50 text-blue-700",
    },
  };

  return (
    <div
      className={`  duration-500 ease-out transform ${
        show ? " fixed translate-x-0 " : "hidden translate-x-20 "
      } top-6 right-6 z-[999] transition-all` }
    >
      <div className="relative w-80 backdrop-blur-xl bg-white/80 border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">

        {/* Content */}
        <div className="flex items-start gap-3 p-5">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-xl text-white ${types[type].color}`}
          >
            {types[type].icon}
          </div>

          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">
              {message}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        {show && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-100">
            <div
              className={`h-full ${types[type].color}`}
              style={{
                width: "100%",
                animation: `toast-progress ${duration}ms linear forwards`,
              }}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};



export default SidePopup;
