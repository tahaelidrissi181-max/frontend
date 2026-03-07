import Login from "./login/Login";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useStateContext } from "./Context/contextproviders";
import Dashboard from "./Dashboard";
import Ouvrier from "./Ouvrier";
import Entreprise from "./Entreprise";
import Demandes from "./Demandes";
import OuvrierProfile from "./OuvrierProfile";
import ViewDemande from "./ViewDemande";
import Users from "./Users";
import Reunions from "./Reunions";
import ViewReunion from "./ViewReunion";
import Inscriptions from "./Inscriptions";
import ViewInscription from "./ViewInscription";
import Mise from "./Mise";
import ViewEntreprise from "./ViewEntreprise";
import MiseAddOuvriers from "./MiseAddOuvriers";
import MiseOuvriers from "./MiseOuvriers";
import Statistics from "./Statistics";

const App = () => {
  const { user, loading } = useStateContext();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48,
            border: '4px solid rgba(255,255,255,0.3)',
            borderTopColor: '#fff',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: '#fff', fontWeight: 600 }}>Chargement...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }


  return (
    <Router>
      {user ? (
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ouvriers" element={<Ouvrier />} />
          <Route path="/entreprises" element={<Entreprise />} />
          <Route path="/entreprise/:id" element={<ViewEntreprise/>} />
          <Route path="/demandes" element={<Demandes />} />
          <Route path="/ouvriers/:id" element={<OuvrierProfile />} />
          <Route path="/demandes/:id" element={<ViewDemande />} />
          <Route path="/utilisateurs" element={<Users />} />
          <Route path="/Statistics" element={<Statistics/>} />
          <Route path="/réunions" element={<Reunions />} />
          <Route path="/réunions/:id" element={<ViewReunion />} />
          <Route path="/insc" element={<Inscriptions/>} />
          <Route path="/insc/:id" element={<ViewInscription/>} />
          <Route path="/mise-en-place" element={<Mise/>} />
          <Route path="/mise-en-place-ajouter/:id" element={<MiseAddOuvriers/>} />
          <Route path="/mise-en-place-ouvriers/:id" element={<MiseOuvriers/>} />


          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
    </Router>
  );
};

export default App;