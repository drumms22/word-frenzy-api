const { checkWord } = require('./words');
const { checkAnimal } = require('./animals');
const { checkSport } = require('./sports');
const { checkCity } = require('./cities');
const { checkMovie } = require('./movies');
const { checkCar } = require('./cars');


const checkGuess = (word, guess) => {

  const matchedIndexes = [];
  const notMatchedIndexes = [];
  const incorrectLetters = [];
  const outOfPlaceLetters = [];
  const correctLetters = [];
  const outOfPlaceIndexes = [];

  const wordLetters = word.split('');
  const guessLetters = guess.split('');
  for (let i = 0; i < wordLetters.length; i++) {

    if (wordLetters[i] === guessLetters[i]) {
      if (wordLetters[i] != " ") {
        matchedIndexes.push(i);
        correctLetters.push(wordLetters[i]);
      }
    } else {
      if (wordLetters[i] != " ") {
        notMatchedIndexes.push(i);
      }
    }

  }

  let newMatchInd = [];
  console.log(notMatchedIndexes);;
  for (let i = 0; i < notMatchedIndexes.length; i++) {
    if (wordLetters.includes(guessLetters[notMatchedIndexes[i]]) && checkOOP(guessLetters[notMatchedIndexes[i]], wordLetters, correctLetters, outOfPlaceLetters)) {
      outOfPlaceIndexes.push(notMatchedIndexes[i]);
      outOfPlaceLetters.push(guessLetters[notMatchedIndexes[i]])
    } else {
      incorrectLetters.push(guessLetters[notMatchedIndexes[i]]);
      newMatchInd.push(notMatchedIndexes[i])
    }
  }

  return {
    matchedIndexes,
    notMatchedIndexes: newMatchInd,
    outOfPlaceIndexes,
    incorrectLetters,
    outOfPlaceLetters,
    correctLetters,
  };
};

const checkOOP = (letter, wordArr, correctLetters, OOPLetters) => {

  const wordIndexes = wordArr.reduce((acc, el, index) => {
    if (el === letter) {
      acc.push(index);
    }
    return acc;
  }, []);


  const correctIndexes = correctLetters.reduce((acc, el, index) => {
    if (el === letter) {
      acc.push(index);
    }
    return acc;
  }, []);

  const oopIndexes = OOPLetters.reduce((acc, el, index) => {
    if (el === letter) {
      acc.push(index);
    }
    return acc;
  }, []);

  if (correctIndexes.length < wordIndexes.length) {
    console.log(true);
    return true;
  } else {
    console.log(false);
    return false;
  }

}

const validateGuess = async (guess, selCat, correctLetters, word) => {
  let regex = /Lobby/;
  let isValid = false;
  //handleHint(hintsTrigger, selectedCategory.replace(regex, ""));
  switch (selCat.replace(regex, "")) {
    case "wordsItem":
      isValid = await checkWord(guess);
      break;
    case "animalsItem":
      isValid = await checkAnimal(guess);
      break;
    case "carsItem":
      isValid = await checkCar(guess);
      break;
    case "citiesItem":
      isValid = await checkCity(guess);
      break;
    case "sportsItem":
      isValid = await checkSport(guess);
      break;
    case "moviesItem":
      isValid = await checkMovie(guess);
      break;
    default:
      isValid = false;
      break;
  }

  if (!isValid) {
    isValid = await continueCheck(word, guess, correctLetters)
  }

  return isValid;


}
const joinWord = (word) => word.includes(" ") ? word.split(" ").join("") : word;
const continueCheck = (word, guess, correctLetters) => {
  let check = true;
  let score = getSimilarityScore(guess, word);

  let tooManyChar = hasTooManyOfOneChar(joinWord(word), joinWord(guess), correctLetters);

  if (tooManyChar) check = false;
  if (!guess.search(/[aeiou]/g)) check = false;
  if (!guess.search(/^[A-Za-z ]+$/)) check = false;
  check = score < 50 ? false : true;

  if (!check) {

    return false;
  }

  return true;
}

const getSimilarityScore = (input, validWord) => {
  const inputLength = input.length;
  const validWordLength = validWord.length;

  // Initialize the Levenshtein distance matrix
  const distanceMatrix = Array(inputLength + 1).fill(null).map(() => Array(validWordLength + 1).fill(null));

  // Fill the first row and column of the matrix with distance values
  for (let i = 0; i <= inputLength; i++) {
    distanceMatrix[i][0] = i;
  }

  for (let j = 0; j <= validWordLength; j++) {
    distanceMatrix[0][j] = j;
  }

  // Fill in the rest of the matrix with minimum distance values
  for (let i = 1; i <= inputLength; i++) {
    for (let j = 1; j <= validWordLength; j++) {
      const substitutionCost = input[i - 1] === validWord[j - 1] ? 0 : 1;

      distanceMatrix[i][j] = Math.min(
        distanceMatrix[i - 1][j] + 1, // Deletion
        distanceMatrix[i][j - 1] + 1, // Insertion
        distanceMatrix[i - 1][j - 1] + substitutionCost // Substitution
      );
    }
  }

  // Calculate the similarity score as a percentage of the length of the valid word
  const similarityScore = 1 - (distanceMatrix[inputLength][validWordLength] / validWordLength);

  return Math.floor(similarityScore * 100);
};

const hasTooManyOfOneChar = (word, guess, correctGuesses) => {
  const charCounts = {};
  for (const char of word) {
    charCounts[char] = (charCounts[char] || 0) + 1;
  }

  // Remove positions of correctly guessed letters from word and guess
  const correctIndices = new Set(correctGuesses);
  let filteredWord = '';
  let filteredGuess = '';
  for (let i = 0; i < word.length; i++) {
    if (!correctIndices.has(i)) {
      filteredWord += word[i];
      filteredGuess += guess[i] || ''; // Account for partial guesses
    }
  }

  const maxAllowed = Math.ceil(filteredWord.length / Object.keys(charCounts).length * 1.5);

  let totalCharCount = filteredGuess.length;
  const charCountInGuess = {};
  for (const char of filteredGuess) {
    charCountInGuess[char] = (charCountInGuess[char] || 0) + 1;
  }

  for (const char in charCounts) {
    const countInWord = filteredWord.split(char).length - 1;
    const countInGuess = charCountInGuess[char] || 0;
    const maxAllowedCount = Math.ceil(maxAllowed * countInWord / filteredWord.length);
    if (countInGuess > maxAllowedCount) {
      return true;
    }
    totalCharCount -= countInGuess;
  }

  const remainingMaxAllowed = Math.ceil(maxAllowed * (filteredWord.length - totalCharCount) / filteredWord.length);
  if (remainingMaxAllowed < 1) {
    return true;
  }

  return false;
};


module.exports = {
  checkGuess,
  validateGuess
}