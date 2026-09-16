export const API_URL = "http://127.0.0.1:8000";
export const API = {
  async request(endpoint, method = "GET", body = null){
    const token = localStorage.getItem("token");
    const headers = {};

    if (token){
      headers["Authorization"] = `Bearer ${token}`;
    }
    if (body){
      headers["Content-Type"] = "application/json";
    }
    try {
      const options = {
        method: method,
        headers: headers,
      }
      if(body){
        options.body = JSON.stringify(body);
      }
      const response = await fetch(API_URL + endpoint, options);
      if (response.status === 401){
        handleSessionExpired();
        return null;
      }
      if (response.ok){
        return await response.json();
      }
      const errorData = await response.json();
      throw new Error(errorData.detail || "[Error] can't reach server.")
    } catch (error) {
      console.error(`[API ERROR] ${method} ${endpoint}: `, error);
      throw error;
    }
  }
};