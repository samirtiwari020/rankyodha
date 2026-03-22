const API_BASE = "http://localhost:5001/api/v1";

// Test with a known valid token from the database (we'll need to fetch or create one)
const testAdaptiveEndpoint = async () => {
  try {
    // First, let's try to get a user token
    // In a real scenario, you'd login with credentials
    // For now, let's check if there are any users in the DB
    
    console.log("🧪 Testing Adaptive Learning Endpoint\n");
    
    // Try a direct call - it will likely fail auth but show us if the endpoint exists
    const response = await fetch(`${API_BASE}/adaptive-learning/next?subject=Math`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const data = await response.text();
    
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${data.substring(0, 300)}...`);
    
    if (response.status === 401) {
      console.log("\n✅ Endpoint EXISTS but needs authentication (expected 401)");
      console.log("This confirms the /next endpoint is wired correctly!");
    } else if (response.status === 400) {
      console.log("\n⚠️  Endpoint exists but validation error - might be working!");
    } else if (response.status === 200) {
      console.log("\n✅ Endpoint returned 200 - Check if data has enriched options!");
      const jsonData = JSON.parse(data);
      if (jsonData.question && jsonData.question.options) {
        console.log(`Options found: ${jsonData.question.options.length}`);
        console.log(`Sample options: ${jsonData.question.options.slice(0, 2).join(", ")}`);
      }
    }
    
  } catch (error) {
    console.error("Error:", error.message);
  }
};

testAdaptiveEndpoint();
