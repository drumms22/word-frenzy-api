const mlb = require("../../json/mlb.json");
const nfl = require("../../json/nfl.json");
const nba = require("../../json/nba.json");
const nhl = require("../../json/nhl.json");
const sportsWords = require("../../json/sportWords.json");
const { generateHint, calculateNumHints, createHint, createSpecialHint, generateRandomNumber } = require('../utilities');

const getHint = async (sport, type, previousHints, sportC) => {

  let hint = "";
  let hintsUsed = previousHints;
  let hint1 = null;
  let hint2 = null;
  let completed = false;
  let team = null;
  if (sportC > 4) sportC = 4;
  switch (sportC) {
    case 0:
      team = mlb.filter((t) => t.name === sport)

      if (hintsUsed.length === 0) {
        hint += "This is a MLB team";
        hintsUsed.push("init")
      } else {
        hint1 = await createHint(getMLBFields(team[0]), hintsUsed, "name");
        if (hint1) {
          hintsUsed.push(hint1.name)
          hint += await generateHint(hint1.name, hint1.value, "The teams");
        } else {
          completed = true
        }
      }

      hint2 = await createHint(getMLBFields(team[0]), hintsUsed, "name");

      if (hint2) {
        hintsUsed.push(hint2.name)
        let hint2Mess = "";

        hint2Mess += await generateHint(hint2.name, hint2.value, "The teams");

        if (hint2Mess != "" && hint != "") {
          hint += " and " + hint2Mess
        } else {
          hint += hint2Mess;
        }
      } else {
        completed = true
      }
      break;
    case 1:
      team = nfl.filter((t) => t.team === sport)
      if (hintsUsed.length === 0) {
        hint += "This is a NFL team";
        hintsUsed.push("init")
      } else {
        hint1 = await createHint(getFields(team[0]), hintsUsed);
        if (hint1) {
          hintsUsed.push(hint1.name)
          hint += await generateHint(hint1.name, hint1.value, "The teams");
        } else {
          completed = true
        }
      }

      hint2 = await createHint(getFields(team[0]), hintsUsed);

      if (hint2) {
        hintsUsed.push(hint2.name)
        let hint2Mess = "";

        hint2Mess += await generateHint(hint2.name, hint2.value, "The teams");

        if (hint2Mess != "" && hint != "") {
          hint += " and " + hint2Mess
        } else {
          hint += hint2Mess;
        }
      } else {
        completed = true
      }

      break;
    case 2:

      team = nba.filter((t) => t.shortName === sport)
      if (hintsUsed.length === 0) {
        hint += "This is a NBA team";
        hintsUsed.push("init")
      } else {
        hint1 = await createHint(getFields(team[0]), hintsUsed);
        if (hint1) {
          hintsUsed.push(hint1.name)
          hint += await generateHint(hint1.name, hint1.value, "The teams");
        } else {
          completed = true
        }
      }

      hint2 = await createHint(getFields(team[0]), hintsUsed);

      if (hint2) {
        hintsUsed.push(hint2.name)
        let hint2Mess = "";

        hint2Mess += await generateHint(hint2.name, hint2.value, "The teams");

        if (hint2Mess != "" && hint != "") {
          hint += " and " + hint2Mess
        } else {
          hint += hint2Mess;
        }
      } else {
        completed = true
      }

      break;
    case 3:
      team = nhl.filter((t) => t.shortName === sport)
      if (hintsUsed.length === 0) {
        hint += "This is a NHL team";
        hintsUsed.push("init")
      } else {
        hint1 = await createHint(getFields(team[0]), hintsUsed);
        if (hint1) {
          hintsUsed.push(hint1.name)
          hint += await generateHint(hint1.name, hint1.value, "The teams");
        } else {
          completed = true
        }
      }

      hint2 = await createHint(getFields(team[0]), hintsUsed);

      if (hint2) {
        hintsUsed.push(hint2.name)
        let hint2Mess = "";

        hint2Mess += await generateHint(hint2.name, hint2.value, "The teams");

        if (hint2Mess != "" && hint != "") {
          hint += " and " + hint2Mess
        } else {
          hint += hint2Mess;
        }
      } else {
        completed = true
      }
      break;
    case 4:
      team = sportsWords.filter((t) => t.name === sport)
      hint1 = await createHint(getWordsFields(team[0]), hintsUsed);
      if (hint1) {
        hintsUsed.push(hint1.name)
        hint += hint1.value;
      } else {
        completed = true
      }
      break;
  }
  if (type === "reveal") {
    let numHints = await calculateNumHints(sport);
    let p = createSpecialHint(sport, numHints);
    hint = p;
    completed = true;
  }

  if (hint === "" && completed) {
    return [{
      hint: "",
      hintsUsed,
      completed: completed
    }];
  }
  console.log(hint);
  return [{
    hint,
    hintsUsed,
    completed: completed
  }];
}


//MLB FIELDS: division,state,city,stadium
//NFL FIELDS: conference,state,city,stadium
//NBA FIELDS: conference,state,city,stadium
//NHL FIELDS: conference,state,city,stadium
//WORDS FIELDS: hint,smallDescription

const getFields = (sport) => {
  const fields = [];
  const availableFields = Object.entries(sport)
    .filter(([key, value]) => value !== null && value !== undefined)
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  if (availableFields.conference) {
    fields.push({ name: 'conference', value: availableFields.conference });
  }
  if (availableFields.state) {
    fields.push({ name: 'state', value: availableFields.state });
  }
  if (availableFields.city) {
    fields.push({ name: 'city', value: availableFields.city });
  }
  if (availableFields.stadium) {
    fields.push({ name: 'stadium', value: availableFields.stadium });
  }

  return fields;
};

const getMLBFields = (sport) => {
  const fields = [];
  const availableFields = Object.entries(sport)
    .filter(([key, value]) => value !== null && value !== undefined)
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  if (availableFields.division) {
    fields.push({ name: 'division', value: availableFields.division });
  }
  if (availableFields.state) {
    fields.push({ name: 'state', value: availableFields.state });
  }
  if (availableFields.city) {
    fields.push({ name: 'city', value: availableFields.city });
  }
  if (availableFields.stadium) {
    fields.push({ name: 'stadium', value: availableFields.stadium });
  }

  return fields;
};

const getWordsFields = (sport) => {
  const fields = [];
  const availableFields = Object.entries(sport)
    .filter(([key, value]) => value !== null && value !== undefined)
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  if (availableFields.hint) {
    fields.push({ name: 'hint', value: availableFields.hint });
  }
  if (availableFields.smallDescription) {
    fields.push({ name: 'smallDescription', value: availableFields.smallDescription });
  }

  return fields;
};
module.exports = {
  getHint
}