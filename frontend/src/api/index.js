// api/index.js
const API_BASE_URL = 'http://localhost:3000'; // Replace with your backend URL

async function fetchEntities() {
  const response = await fetch(`${API_BASE_URL}/entities`);
  console.log(response);
  return response.json();
}

// Add other API functions here (fetchData, updateEntity, etc.)
export { fetchEntities }; 
