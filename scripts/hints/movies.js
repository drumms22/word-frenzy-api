const movies = require("../../movies.json");
const axios = require('axios');
require('dotenv').config()
const { generateHint, calculateNumHints, createHint, createSpecialHint } = require('../utilities');

//cast
//genre
//release_date
//similar
//directors

// {
//   "genres": "Drama",
//   "id": 33602,
//   "original_language": "English",
//   "overview": "A biopic of Temple Grandin, an autistic woman who has become one of top scientists in humane livestock handling.",
//   "popularity": 13.243,
//   "poster_path": "/gQhQ6yEkUkDDo1zugpq46PJN8xZ.jpg",
//   "release_date": "2010-02-06",
//   "runtime": 108,
//   "tagline": "Autism gave her a vision. She gave it a voice.",
//   "title": "Temple Grandin",
//   "vote_average": 7.8,
//   "vote_count": 265,
//   "external_ids": {
//     "imdb_id": "tt1278469"
//   },
//   "similar": [
//     {
//       "id": 400387,
//       "title": "Riphagen the Untouchable"
//     },
//     {
//       "id": 369192,
//       "title": "Battle of the Sexes"
//     },
//     {
//       "id": 324786,
//       "title": "Hacksaw Ridge"
//     },
//     {
//       "id": 478820,
//       "title": "The Emperor of Paris"
//     },
//     {
//       "id": 457799,
//       "title": "Extremely Wicked, Shockingly Evil and Vile"
//     },
//     {
//       "id": 448776,
//       "title": "A Prayer Before Dawn"
//     },
//     {
//       "id": 310307,
//       "title": "The Founder"
//     },
//     {
//       "id": 115782,
//       "title": "Jobs"
//     },
//     {
//       "id": 425336,
//       "title": "Loving Pablo"
//     },
//     {
//       "id": 409502,
//       "title": "I'm Not Ashamed"
//     },
//     {
//       "id": 332283,
//       "title": "Mary Shelley"
//     },
//     {
//       "id": 22683,
//       "title": "Gifted Hands: The Ben Carson Story"
//     },
//     {
//       "id": 407445,
//       "title": "Breathe"
//     },
//     {
//       "id": 11202,
//       "title": "Patton"
//     },
//     {
//       "id": 77805,
//       "title": "Lovelace"
//     },
//     {
//       "id": 48231,
//       "title": "A Dangerous Method"
//     },
//     {
//       "id": 528888,
//       "title": "Dolemite Is My Name"
//     },
//     {
//       "id": 390584,
//       "title": "King Cobra"
//     },
//     {
//       "id": 317557,
//       "title": "Queen of Katwe"
//     },
//     {
//       "id": 489,
//       "title": "Good Will Hunting"
//     }
//   ],
//   "certification": "12",
//   "directors": [
//     {
//       "id": 8843,
//       "name": "Mick Jackson"
//     }
//   ],
//   "writers": [
//     {
//       "id": 65859,
//       "name": "Christopher Monger"
//     },
//     {
//       "id": 107449,
//       "name": "Temple Grandin"
//     },
//     {
//       "id": 111044,
//       "name": "Merritt Johnson"
//     },
//     {
//       "id": 111046,
//       "name": "Margaret Scarciano"
//     }
//   ],
//   "cast": [
//     {
//       "id": 6194,
//       "name": "Claire Danes"
//     },
//     {
//       "id": 11514,
//       "name": "Catherine O'Hara"
//     },
//     {
//       "id": 15887,
//       "name": "Julia Ormond"
//     }
//   ],
//   "trailer_yt": "cpkN0JdXRpM"
// }

const getHint = async (movie, type = "normal", previousHints) => {

  let hint = "";
  let hintsUsed = previousHints;

  let res = await movies.filter((m) => m.title === movie);
  // if (previousHints.length >= 10 && type !== "reveal") {
  //   return [{
  //     hint: "",
  //     hintsUsed,
  //     completed: true
  //   }];
  // }

  if (type === "reveal") {
    let numHints = await calculateNumHints(movie);
    let p = createSpecialHint(movie, numHints);
    hint = p;
    completed = true;
  } else {
    let hint1 = null;
    if (hintsUsed.length === 0) {
      hint1 = res[0].genres;
      hintsUsed.push("genres")
      hint += "The movie's genres include " + hint1;
    } else {
      hint1 = await createHint(getFields(res[0]), hintsUsed);
      if (hint1) {
        hintsUsed.push(hint1.name)
        let mess = `The movie's ${hint1.name} include ${hint1.value}`;
        if (hint1.name === 'release date') mess = `The movie's ${hint1.name} was ${hint1.value}`;
        hint += mess;
      } else {
        completed = true;
      }
    }

    let hint2 = await createHint(getFields(res[0]), hintsUsed);

    if (hint2) {
      hintsUsed.push(hint2.name)
      hint += hint != "" ? ' and the ' : 'The ';
      let mess = `movie's ${hint2.name} include ${hint2.value}`;
      if (hint2.name === 'release date') mess = `movie's ${hint2.name} was ${hint2.value}`;
      hint += mess;
    } else {
      completed = true;
    }

  }


  if (hint === "") {

    if (completed) {
      return [{
        hint: "",
        hintsUsed,
        completed: completed
      }];
    }

    let numHints = await calculateNumHints(movie);
    let p = createSpecialHint(movie, numHints);
    hint = p;
    completed = true;
  }

  return [{
    hint,
    hintsUsed,
    completed: false
  }];
}


//cast
//genre
//release_date
//similar
//directors
const getFields = (movie) => {
  const fields = [];
  const availableFields = Object.entries(movie)
    .filter(([key, value]) => value !== null && value !== undefined && !(Array.isArray(value) && value.length === 0))
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  //This is a string
  if (availableFields.release_date) {
    fields.push({ name: 'release date', value: availableFields.release_date });
  }
  // Cast
  if (availableFields.cast) {
    const castValue = Array.isArray(availableFields.cast) ? availableFields.cast.slice(0, 3).map(cast => cast.name).join(", ") : availableFields.cast.name;
    fields.push({ name: 'cast', value: castValue });
  }

  // Genres
  if (availableFields.genres) {
    const genreValue = Array.isArray(availableFields.genres) ? availableFields.genres.slice(0, 3).join(", ") : availableFields.genres;
    fields.push({ name: 'genres', value: genreValue });
  }

  //This is an array of objects {name}
  if (availableFields.cast) {
    const castValue = Array.isArray(availableFields.cast) ? availableFields.cast.slice(0, 3).map(cast => cast.name).join(", ") : availableFields.cast.name;
    fields.push({ name: 'cast', value: castValue });
  }
  //This is an array of objects {title}
  if (availableFields.similar) {
    const similarValue = Array.isArray(availableFields.similar) ? availableFields.similar.slice(0, 3).map(similar => similar.title).join(", ") : availableFields.similar.title;
    fields.push({ name: 'similar', value: similarValue });
  }
  //This is an array of objects {name}
  if (availableFields.directors) {
    const directorsValue = Array.isArray(availableFields.directors) ? availableFields.directors.slice(0, 3).map(director => director.name).join(", ") : availableFields.directors.name;
    fields.push({ name: 'directors', value: directorsValue });
  }
  return fields;
};


module.exports = {
  getHint
}