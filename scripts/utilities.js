
const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
const scrambleWord = (word) => {

  let s = 3;

  let m = (word.length * s) + (word.length * 2);

  let ws = word.split("");

  let str = "";
  let counter = 0;
  let p = 0;
  for (let i = 0; i < m; i++) {

    if (counter < s || p >= word.length) {
      let r = Math.floor(Math.random() * letters.length);

      str += letters[r];
      counter++;
    } else if (p < word.length) {

      str += ws[p];
      p++;
      counter = 0;
    }
  }


  return str;
}

const unScrambleWord = (word) => {

  let s = 3;

  let counter = 0;

  let str = "";

  let p = 0;

  let c = word.length / 5;


  for (let i = 0; i < word.length; i++) {

    if (counter < s) {
      counter++;
    } else if (p < c) {
      str += word.charAt(i);
      counter = 0;
      p++;
    }
  }

  return str;

}

const generateHint = (field, val, strStart) => {
  const hintMessage = `${strStart || "The entities"} ${field} is `;
  return hintMessage + val;
};

const titleCase = (string) => string[0].toUpperCase() + string.slice(1).toLowerCase();



const generateRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const createSpecialHint = (word, numChars) => {
  // Calculate the number of characters to reveal
  const len = word.replace(/ /g, '').length;
  const revealCount = Math.min(len, numChars);

  // Create an array of indexes to reveal
  const indexes = [];
  while (indexes.length < revealCount) {
    const index = Math.floor(Math.random() * len);
    if (!indexes.includes(index)) {
      indexes.push(index);
    }
  }

  // Build the hint by revealing the characters at the selected indexes
  let hint = '';
  let revealIndex = 0;
  for (let i = 0; i < word.length; i++) {
    if (word[i] === ' ') {
      hint += ' ';
    } else if (indexes.includes(revealIndex)) {
      hint += word[i];
      revealIndex++;
    } else {
      hint += '*';
      revealIndex++;
    }
  }

  return hint;
};


const calculateNumHints = (word) => {
  // Count the number of spaces in the word
  const numSpaces = (word.match(/ /g) || []).length;

  // Subtract the number of spaces from the length of the word
  const numChars = word.length - numSpaces;

  // Determine the number of hints based on the number of characters
  if (numChars <= 4) {
    return 1;
  } else if (numChars <= 6) {
    return 2;
  } else if (numChars <= 10) {
    return 3;
  } else {
    return 4;
  }
};

const createHint = (fields, previousHints, propToCheck) => {
  // Filter out previous hints
  const remainingFields = fields.filter(field => {
    return !previousHints.includes(field["name"]);
  });

  // Check if all fields have been used
  if (remainingFields.length === 0) {
    return null;
  }

  // Choose a random field from remaining fields
  const hintIndex = Math.floor(Math.random() * remainingFields.length);
  const hint = remainingFields[hintIndex];

  return hint;
};


module.exports = {
  scrambleWord,
  unScrambleWord,
  generateRandomNumber,
  letters,
  generateHint,
  titleCase,
  createHint,
  calculateNumHints,
  createSpecialHint
}