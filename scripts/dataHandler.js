const CyclicDb = require("@cyclic.sh/dynamodb")
const db = CyclicDb("salmon-barnacle-shoeCyclicDB");

const run = async function () {

  try {

    let animals = db.collection('animals')
    let leo = await animals.set('leo', {
      type: 'cat',
      color: 'orange'
    })

    return true;
    // get an item at key "leo" from collection animals
    // let item = await animals.get('leo')
    // console.log(item)
  } catch (error) {
    console.log(error);
    return true;
  }
}

const get = async () => {
  let animals = db.collection('animals')
  let n = await animals.list();
  console.log(n);
}
const idk = async () => {
  await run();
  await get();
}

idk()
