const axios = require('axios');
require('dotenv').config()
const { generateHint, calculateNumHints, createHint, createSpecialHint, titleCase } = require('../utilities');
const cars = require('../../json/cars.json');
const getHint = async (car, type = "normal", previousHints) => {

  let hint = "";
  let hintsUsed = previousHints;

  let res = await cars.filter((c) => c.model === car);

  const availableFields = Object.entries(res[0])
    .filter(([key, value]) => value !== null && value !== undefined)
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

  if (previousHints.length >= 7 && type !== "reveal") {
    return [{
      hint: "",
      hintsUsed,
      completed: true
    }];
  }

  if (type === "reveal") {
    let numHints = await calculateNumHints(car);
    let p = createSpecialHint(car, numHints);
    hint = p;
  } else {
    let hint1 = null;
    if (hintsUsed.length === 0) {
      hint1 = titleCase(availableFields.make);
      hintsUsed.push("make");
      hint += "The cars make is " + hint1;
    } else {
      hint1 = await createHint(getFields(availableFields), hintsUsed);
      hintsUsed.push(hint1.name)
      hint += await generateHint(hint1.name, hint1.value, "The cars");
      console.log("Hint1: " + hint);
    }

    let hint2 = await createHint(getFields(availableFields), hintsUsed);
    if (hint2) {
      hintsUsed.push(hint2.name)

      let hint2Mess = await generateHint(hint2.name, hint2.value, "The cars");
      if (hint2Mess != "" && hint != "") {
        hint += " and " + hint2Mess.toLowerCase();
      } else {
        hint += hint2Mess;
      }

    }

  }

  if (hint === "") {
    let numHints = await calculateNumHints(car);
    hint = createSpecialHint(car, numHints);
  }

  console.log(hint);

  return [{
    hint,
    hintsUsed,
    completed: false
  }];
}

const getFields = (car) => {
  const fields = [];

  if (car.make) {
    fields.push({ name: 'make', value: car.make });
  }
  if (car.year) {
    fields.push({ name: 'year', value: car.year });
  }
  if (car.cylinders) {
    fields.push({ name: 'cylinders', value: car.cylinders });
  }
  if (car.transmission) {
    fields.push({ name: 'transmission', value: car.transmission });
  }
  if (car.drive_train) {
    fields.push({ name: 'drive train', value: car.drive_train });
  }
  if (car.class) {
    fields.push({ name: 'class', value: car.class });
  }
  if (car.combination_mpg) {
    fields.push({ name: 'combined MPG', value: car.combination_mpg });
  }


  return fields;
};


module.exports = {
  getHint
}