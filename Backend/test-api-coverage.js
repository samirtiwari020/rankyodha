const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWJmZjRkNWZjMzJkMDE1ZDY2N2NiOWEiLCJpYXQiOjE3NzQxODg1MTMsImV4cCI6MTc3NDc5MzMxM30.eSIpfir0gqkP7CYxGlKg9ndZ-aToXNUgtk5qVKJ63gc";
const headers = { Authorization: `Bearer ${token}` };

const topics = ["Math", "Algebra", "Geometry", "Mechanics", "Thermodynamics", "Physics", "Chemistry"];
const difficulties = ["Easy", "Medium", "Hard"];

for (const topic of topics) {
  for (const difficulty of difficulties) {
    const url = `http://localhost:5000/api/v1/adaptive-learning/practice?topic=${encodeURIComponent(topic)}&difficulty=${difficulty}`;
    try {
      const res = await fetch(url, { headers });
      const data = await res.json();
      const mcqWithOptions = (data.questions || []).filter(
        (q) => q.questionType === "MCQ" && Array.isArray(q.options) && q.options.length >= 2
      ).length;
      process.stdout.write(`${topic}/${difficulty} => count=${data.count}, mcqWithOptions=${mcqWithOptions}\n`);
    } catch (error) {
      process.stdout.write(`${topic}/${difficulty} => error=${error.message}\n`);
    }
  }
}
