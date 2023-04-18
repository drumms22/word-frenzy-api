const axios = require('axios');
require('dotenv').config()
const { generateHint, calculateNumHints, createHint, createSpecialHint } = require('../utilities');

const getHint = async (animal, type = "normal", previousHints) => {

  let hint = "";
  let hintsUsed = previousHints;

  let res = await fetchData(animal);

  const availableFields = Object.entries(res[0])
    .filter(([key, value]) => value !== null && value !== undefined)
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

  if (previousHints.length >= 10 && type !== "reveal") {
    return [{
      hint: "",
      hintsUsed,
      completed: true
    }];
  }

  if (type === "reveal") {
    let numHints = await calculateNumHints(animal);
    let p = createSpecialHint(animal, numHints);
    hint = p;
  } else {
    let hint1 = null;
    if (hintsUsed.length === 0) {
      hint1 = availableFields.locations.join(", ");
      hintsUsed.push("locations")
      hint += "The animals locations include " + hint1;
    } else {
      hint1 = await createHint(getFields(availableFields), hintsUsed);
      hintsUsed.push(hint1.name)
      hint += await generateHint(hint1.name, hint1.name === "color" ? hint1.value.split(/(?=[A-Z])/).join(", ") : hint1.value, "The animals");
    }

    let hint2 = await createHint(getFields(availableFields), hintsUsed);

    if (hint2) {
      hintsUsed.push(hint2.name)

      let hint2Mess = await generateHint(hint2.name, hint2.name === "color" ? hint2.value.split(/(?=[A-Z])/).join(", ") : hint2.value, "The animals");

      if (hint2Mess != "" && hint != "") {
        hint += " and " + hint2Mess.toLowerCase();
      } else {
        hint += hint2Mess;
      }
    }

  }

  if (hint === "") {
    let numHints = await calculateNumHints(animal);
    hint = createSpecialHint(animal, numHints);
  }

  return [{
    hint,
    hintsUsed,
    completed: false
  }];
}

const getFields = (animal) => {
  const fields = [];

  if (animal.taxonomy) {
    if (animal.taxonomy.kingdom) {
      fields.push({ name: 'kingdom', value: animal.taxonomy.kingdom });
    }
    if (animal.taxonomy.class) {
      fields.push({ name: 'class', value: animal.taxonomy.class });
    }
  }

  if (animal.characteristics) {
    if (animal.characteristics.temperament) {
      fields.push({ name: 'temperament', value: animal.characteristics.temperament });
    }
    if (animal.characteristics.diet) {
      fields.push({ name: 'diet', value: animal.characteristics.diet });
    }
    if (animal.characteristics.color) {
      fields.push({ name: 'color', value: animal.characteristics.color });
    }
    if (animal.characteristics.skin_type) {
      fields.push({ name: 'skin type', value: animal.characteristics.skin_type });
    }
    if (animal.characteristics.lifespan) {
      fields.push({ name: 'lifespan', value: animal.characteristics.lifespan });
    }
    if (animal.characteristics.weight) {
      fields.push({ name: 'weight', value: animal.characteristics.weight });
    }
    if (animal.characteristics.solgan) {
      fields.push({ name: 'solgan', value: animal.characteristics.solgan });
    }
    if (animal.characteristics.habitat) {
      fields.push({ name: 'habitat', value: animal.characteristics.habitat });
    }
    if (animal.characteristics.main_prey) {
      fields.push({ name: 'main prey', value: animal.characteristics.main_prey });
    }
    if (animal.characteristics.predators) {
      fields.push({ name: 'predators', value: animal.characteristics.predators });
    }
    if (animal.characteristics.group_behavior) {
      fields.push({ name: 'group behavior', value: animal.characteristics.group_behavior });
    }
    if (animal.characteristics.most_distinctive_feature) {
      fields.push({ name: 'distinctive feature', value: animal.characteristics.most_distinctive_feature });
    }
  }

  return fields;
};

const fetchData = async (animal) => {

  try {

    let req = await axios.get(`https://api.api-ninjas.com/v1/animals?name=${animal}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.T_API_KEY
      }
    })


    let x = await req.data.filter((x) => x.name.toLowerCase() === animal.toLowerCase());

    if (x.length < 1) {
      x = [req.data[0]];
    }

    return x;
  } catch (error) {
    console.log("animals error: " + error);
    return false;
  }

}



module.exports = {
  getHint
}