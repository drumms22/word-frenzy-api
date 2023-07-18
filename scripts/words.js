let RiTa = require('rita');
const { unScrambleWord, scrambleWord } = require('./utilities');
const { getDefinition } = require('./hints/words')
const Filter = require('bad-words');
const letters = require('../json/letters.json');

const getNewWord = async (min, max, limit) => {

  let words = Array.from({ length: limit || 3 }, () => RiTa.randomWord({ minLength: min, maxLength: max }))

  let s = scrambleWord(words[0]);

  return [s, words]
}

const checkWord = async (word) => {

  let checDef = await getDefinition(word);

  if (checDef !== "" && checDef.length > 0) {
    return true;
  }
  let checkWord = await checkRitaWord(word);
  if (checkWord) {
    return true;
  }

  return false;

}

const checkProfanity = async (word) => new Filter().isProfane(word);

const checkRitaWord = async (word) => await RiTa.hasWord(word);

const getRitaWord = async (min, max) => RiTa.randomWord({ minLength: min, maxLength: max });

const calcWordPoints = (word) => {
  const characters = word.split('');
  const letterScores = characters.map(char => {
    const letter = letters.find(l => l.letter === char.toUpperCase());
    return letter ? letter.score : 0;
  });
  console.log(letterScores);
  const totalScore = letterScores.reduce((acc, val) => acc + val, 0);
  return { totalScore, letterScores };
}

const calcWordDiffScore = (word) => {
  const totalCharacters = word.length;
  const wordScores = calcWordPoints(word);
  const averageScore = wordScores.totalScore / totalCharacters;
  const maxScore = Math.max(...wordScores.letterScores);
  return (maxScore + averageScore) / 2;
}

const calcTime = (words, challengeDiff, speed) => {
  let time = 0;

  for (let i = 0; i < words.length; i++) {
    let word = words[i].split("").join("");

    switch (challengeDiff) {
      case 0:
        time += (word.length * speed) + (Math.floor((word.length * speed) * .40) + 1);
        break;
      case 1:
        time += (word.length * speed) + (Math.floor((word.length * speed) * .25) + 1);
        break;
      case 2:
        time += (word.length * speed) - (Math.floor((word.length * speed) * .1));
        break;
      case 3:
        time += (word.length * speed) - (Math.floor((word.length * speed) * .3));
        break;
    }

    const wordDifficultyScore = calcWordDiffScore(word);
    time += wordDifficultyScore * speed;
  }

  if (time < 1) {
    time = 1;
  }

  return Math.floor(time);
}

module.exports = {
  getNewWord,
  checkWord,
  checkRitaWord,
  checkProfanity,
  getRitaWord,
  calcWordPoints,
  calcWordDiffScore,
  calcTime
}