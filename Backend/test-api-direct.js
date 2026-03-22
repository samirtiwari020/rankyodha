const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWJmZjRkNWZjMzJkMDE1ZDY2N2NiOWEiLCJpYXQiOjE3NzQxODg1MTMsImV4cCI6MTc3NDc5MzMxM30.eSIpfir0gqkP7CYxGlKg9ndZ-aToXNUgtk5qVKJ63gc";

const options = {
  method: 'GET',
  headers: { Authorization: `Bearer ${token}` }
};

async function testTopics() {
  const topics = ["Mechanics", "Algebra", "Geometry", "Thermodynamics"];
  
  for (const topic of topics) {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/adaptive-learning/practice?topic=${encodeURIComponent(topic)}&difficulty=Hard`, options);
      const data = await response.json();
      
      console.log(`\n📚 Topic: ${topic}`);
      console.log(`   Questions: ${data.count}`);
      
      if (data.questions && data.questions.length > 0) {
        const q = data.questions[0];
        console.log(`   Sample:`);
        console.log(`     Type: ${q.questionType}`);
        console.log(`     Options: ${q.options ? q.options.length : 0}`);
        console.log(`     Q: ${(q.question || '').substring(0, 60)}...`);
      }
    } catch (err) {
      console.error(`   Error: ${err.message}`);
    }
  }
}

testTopics();
