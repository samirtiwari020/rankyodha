const text1 = "JEE Main 2025 (7 April Shift 2) The dimension of is equal to that of : ( Vacuum permeability and Vacuum permittivity) (1) Voltage(2) Capacitance (3) Inductance(4) Resistance";

const text2 = "JEE Main 2025 (4 April Shift 2) Given below are two statements : Statement (I) : The dimensions of Planck's constant and angular momentum are same. Statement (II) : In Bohr's model electron revolve around the nucleus only in those orbits for which angular momentum is integral multiple of Planck's constant. In the light of the above statements, choose the most appropriate answer from the options given below : (1) Both Statement I and Statement II are correct (2) Statement I is incorrect but Statement II is correct (3) Statement I is correct but Statement II is incorrect (4) Both Statement I and Statement II are incorrect";

// Test the regex pattern
const numberOptionRegex = /\(([1-4])\)\s*([^(]*?)(?=\s*\([1-4]\)|$)/g;

console.log("Testing regex on text1:");
console.log("Text:", text1);
console.log("\nMatches:");

let match;
let count = 0;
while ((match = numberOptionRegex.exec(text1)) !== null) {
  count++;
  console.log(`Match ${count}:`);
  console.log(`  Number: ${match[1]}`);
  console.log(`  Content: "${match[2]}"`);
}
console.log(`Total matches: ${count}\n`);

// Reset regex
numberOptionRegex.lastIndex = 0;

console.log("\n\nTesting regex on text2:");
console.log("Text:", text2.substring(0, 100) + "...");
console.log("\nMatches:");

count = 0;
while ((match = numberOptionRegex.exec(text2)) !== null) {
  count++;
  console.log(`Match ${count}:`);
  console.log(`  Number: ${match[1]}`);
  console.log(`  Content: "${match[2].substring(0, 80)}..."`);
}
console.log(`Total matches: ${count}`);
