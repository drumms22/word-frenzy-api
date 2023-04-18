let RiTa = require('rita');
const { unScrambleWord, scrambleWord, letters } = require('./utilities');
const { getDefinition } = require('./hints/words')
var Filter = require('bad-words');

const getNewWord = async (min, max) => {

  let word = RiTa.randomWord({ minLength: min, maxLength: max });

  let s = await scrambleWord(word);
  //let u = await unScrambleWord(s);

  return s
}

const checkWord = async (word) => {

  let checDef = await getDefinition(word);

  if (checDef.length > 0) {
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


module.exports = {
  getNewWord,
  checkWord,
  checkRitaWord,
  checkProfanity,
  getRitaWord
}