import axios from "axios";

const api = axios.create({
  baseURL: "https://backend-production-36f5.up.railway.app", 
  headers: {
    "Content-Type": "application/json",
  },
});



export default api;
