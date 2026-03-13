import { useStateContext } from "./Context/contextproviders";
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useStateContext();
  const dashboardCards = [
    { id: 1, href: 'statistics', color: 'bg-blue-600', icon: 'fa-chart-line', label: 'Tableau de bord' },
    { id: 9, href: 'Insc', color: 'bg-orange-600', icon: 'fa-user-clock', label: 'Insc limité' },
    { id: 2, href: 'entreprises', color: 'bg-green-600', icon: 'fa-building', label: 'Entreprises Gerer' },
    
    { id: 3, href: 'ouvriers', color: 'bg-red-500', icon: 'fa-hard-hat', label: 'Ouvrie Gerer' },
    { id: 4, href: 'demandes', color: 'bg-yellow-600', icon: 'fa-file-alt', label: 'Demandes' },
    { id: 5, href: 'réunions', color: 'bg-purple-600', icon: 'fa-handshake', label: 'Réunions' },
    { id: 6, href: 'mise-en-place', color: 'bg-pink-600', icon: 'fa-tools', label: 'Mise en place' },
    
    
    { id: 12, href: 'utilisateurs', color: 'bg-red-600', icon: 'fa-users-cog', label: 'Gestion users' }
  ];



  return (
    <div className="min-h-screen bg-gradient-to-t from-purple-600  to-purple-700  text-white p-3 sm:p-4 md:p-6">
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      {/* Header Section */}
      <div className="flex justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 pr-0 sm:pr-32 animate-fadeIn">
        <div className="welcome-text">
          <h1 className="text-base sm:text-lg md:text-xl font-medium mb-1">Bienvenue <span className="font-bold">
  {user[0].name.charAt(0).toUpperCase() + user[0].name.slice(1)}
</span></h1>
          <p className="text-xs sm:text-sm opacity-85">Gérez votre plateforme Optijob</p>
        </div>
        
        <div className="flex items-center gap-2 notification-container">
          <button 
            onClick={() => {
    localStorage.removeItem("token"); // remove auth token
    window.location.href = "/";  // redirect to login page
  }}
            className="bg-white/15 backdrop-blur-md px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-white/25 text-white font-medium flex items-center gap-2 transition-all hover:bg-[#ff4757] hover:-translate-y-0.5 text-xs sm:text-sm"
          >
            <i className="fa-solid fa-power-off"></i>
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      
     

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-7xl mx-auto animate-slideUp">
        {dashboardCards.map((card, index) => (
          <Link
            key={card.id}
            to={card.href}
            className={`h-28 sm:h-32 md:h-36 rounded-2xl sm:rounded-3xl flex items-center justify-center relative overflow-hidden transition-all  shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-100 duration-300 ${card.color} group`}
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r rounded-2xl sm:rounded-3xl from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
            
            <div className="bg-white/20 backdrop-blur-md px-6 sm:px-8 py-3 sm:py-3.5 rounded-full flex items-center gap-2 sm:gap-3 border border-white/25 transition-all group-hover:bg-white/30 group-hover:scale-105 relative z-10">
              <i className={`fa-solid ${card.icon} text-xs sm:text-sm`}></i>
              <span className="font-medium text-xs sm:text-sm">{card.label}</span>
            </div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        * {
          font-family: 'Poppins', sans-serif;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease;
        }

        .animate-slideUp {
          animation: slideUp 0.7s ease;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease;
        }

        @keyframes pulse {
          0%, 100% { 
            transform: scale(1); 
            box-shadow: 0 0 0 0 rgba(255,71,87,0.7); 
          }
          50% { 
            transform: scale(1.1); 
            box-shadow: 0 0 0 10px rgba(255,71,87,0); 
          }
        }

        .animate-pulse {
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;