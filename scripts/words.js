let RiTa = require('rita');

const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

const getNewWord = (min, max) => {

  let word = RiTa.randomWord({ minLength: min, maxLength: max });

  return scrambleWord(word);

}

const unScrambleWord = (word, num) => {
  console.log(word);
  console.log(num);
  let str = "";

  switch (parseInt(num)) {
    case 4:
      str = word.charAt(4) + "" + word.charAt(9) + "" + word.charAt(13) + "" + word.charAt(17);
      break;
    case 5:
      str = word.charAt(3) + "" + word.charAt(7) + "" + word.charAt(11) + "" + word.charAt(16) + "" + word.charAt(21);
      break;
    case 6:
      str = word.charAt(3) + "" + word.charAt(6) + "" + word.charAt(10) + "" + word.charAt(15) + "" + word.charAt(18) + "" + word.charAt(22);
      break;
    default:
      str = "incorrect";
  }

  return str;

}

const scrambleWord = (word) => {
  let str = "";
  let num = word.length;
  for (let j = letters.length - 1; j > 0; j--) {
    let rand = [Math.floor(Math.random() * letters.length)];
    [letters[j], letters[rand]] = [letters[rand], letters[j]];
  }

  for (let i = 0; i < letters.length; i++) {

    if (num === 4) {
      if (i === 4) {
        letters[i] = word.charAt(0);
      } else if (i === 9) {
        letters[i] = word.charAt(1);
      } else if (i === 13) {
        letters[i] = word.charAt(2);
      } else if (i === 17) {
        letters[i] = word.charAt(3);
      }

    } else if (num === 5) {
      if (i === 3) {
        letters[i] = word.charAt(0);
      } else if (i === 7) {
        letters[i] = word.charAt(1);
      } else if (i === 11) {
        letters[i] = word.charAt(2);
      } else if (i === 16) {
        letters[i] = word.charAt(3);
      } else if (i === 21) {
        letters[i] = word.charAt(4);
      }
    } else if (num === 6) {
      if (i === 3) {
        letters[i] = word.charAt(0);
      } else if (i === 6) {
        letters[i] = word.charAt(1);
      } else if (i === 10) {
        letters[i] = word.charAt(2);
      } else if (i === 15) {
        letters[i] = word.charAt(3);
      } else if (i === 18) {
        letters[i] = word.charAt(4);
      } else if (i === 22) {
        letters[i] = word.charAt(5);
      }
    }


  }

  letters.map((x) => {
    str += x;
  })

  return str;

}

module.exports = {
  getNewWord,
  unScrambleWord
}