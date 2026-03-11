// ---------------------------------
// Boilerplate Code to Set Up Server
// ---------------------------------

// importing our Node modules
import express from "express"; // the framework that lets us build a web server
import pg from "pg";
import config from "./config.js"; 

// connect to our PostgreSQL database, or db for short
const db = new pg.Pool({
  connectionString: config.databaseUrl,
  ssl: true
})

const app = express(); // creating an instance of the express module

app.use(express.json()); // This server will receive and respond in JSON format

const port = 3000; // Setting which port to listen to to receive requests

//defining our port, then turning on our server to listen for requests
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

// ---------------------------------
// Helper Functions
// ---------------------------------

// 1. getAllAnimals()

async function getAllAnimals() {
  const result = await db.query("SELECT * FROM animals")
  return result.rows
}

// 2. getOneAnimalByName(name)

async function getOneAnimalByName(name) {
    const result = await db.query("SELECT * FROM animals WHERE name = $1", [name])
    return result.rows[0]
}

// 3. getOneAnimalById(id)

async function getOneAnimalById(id) {
    const result = await db.query("SELECT * FROM animals WHERE id = $1", [id])
    return result.rows[0]
}

// 4. getNewestAnimal()

async function getNewestAnimal() {
    const result = await db.query("SELECT * FROM animals ORDER BY id DESC LIMIT 1");
  return result.rows[0]
}

// 5. 🌟 BONUS CHALLENGE — getAllMammals()

async function getAllMammals() {
    const result = await db.query("SELECT * FROM animals WHERE category = 'mammal'");
    return result.rows;
}

// 6. 🌟 BONUS CHALLENGE — getAnimalsByCategory(category)

async function getAnimalsByCategory(category) {
    const result = await db.query("SELECT * FROM animals WHERE category = $1", [category]);
    return result.rows;
}

// 7. deleteOneAnimal(id)

async function deleteOneAnimal(id) {
    await db.query("DELETE FROM animals WHERE id = $1", [id])
}

// 8. addOneAnimal(name, category, can_fly, lives_in)

async function addOneAnimal(name, category, can_fly, lives_in) {
  await db.query(
    "INSERT INTO animals (name, category, can_fly, lives_in) VALUES ($1, $2, $3, $4)",
    [name, category, can_fly, lives_in],
  );
}

// 9. updateOneAnimalName(id, newName)

async function updateOneAnimalName(id, newName) {
    await db.query("UPDATE animals SET name = $1 WHERE id = $2", [newName, id])
}

// 10. updateOneAnimalCategory(id, newCategory)

async function updateOneAnimalCategory(id, newCategory) {
    await db.query("UPDATE animals SET category = $1 WHERE id = $2", [newCategory, id])
}

// 11. 🌟 BONUS CHALLENGE — addManyAnimals(animals)

async function addManyAnimals(animals) {
    for (const animal of animals) {
        await addOneAnimal(animal.name, animal.category,animal.can_fly,animal.lives_in)
    }
}

// ---------------------------------
// API Endpoints
// ---------------------------------

// 1. GET /get-all-animals

app.get("/get-all-animals", async (req, res) => {
    try {
        const animals = await getAllAnimals();
        res.send(animals)
    } catch (error) {
        res.status(500).send("Something went wrong!")
    }
});

// 2. GET /get-one-animal-by-name/:name

app.get("/get-one-animal-by-name/:name", async (req, res) => {
    try {
        const name = req.params.name;
        const animal = await getOneAnimalByName(name);
        res.json(animal);
    } catch (error) {
        res.status(500).send("Animal not found!")
    }
});

// 3. GET /get-one-animal-by-id/:id

app.get("/get-one-animal-by-id/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const animal = await getOneAnimalById(id);
        res.json(animal);
    } catch (error) {
        res.status(500).send("Animal not found!")
    }
});

// 4. GET /get-newest-animal

app.get("/get-newest-animal", async (req, res) => {
    try {
        const animal = await getNewestAnimal();
        res.json(animal);
    } catch (error) {
        res.status(500).send("Something went wrong!")
    }
});

// 5. 🌟 BONUS CHALLENGE — GET /get-all-mammals

app.get("/get-all-mammals", async (req, res) => {
    try { const mammals = await getAllMammals();
    res.json(mammals);
    } catch (error) {
        res.status(500).send("Something went wrong!")
}
});


// 6. 🌟 BONUS CHALLENGE — GET /get-animals-by-category/:category

app.get("/get-animals-by-category/:category", async (req, res) => {
    try {
        const category = req.params.category;
        const animals = await getAnimalsByCategory(category);
        res.json(animals);
    } catch (error) {
        res.status(500).send("Animals not found!")
    }
});

// 7. POST /delete-one-animal/:id


app.post("/delete-one-animal/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const animal = await getOneAnimalById(id);
        await deleteOneAnimal(id);
        res.send(`Success! ${animal.name} was deleted!`)
    } catch (error) {
        res.status(500).send("Something went wrong!")
    }
})


// 8. POST /add-one-animal

app.post("/add-one-animal", async (req, res) => {
    try {
        const { name, category, can_fly, lives_in } = req.body;
        await addOneAnimal(name, category, can_fly, lives_in);
        res.send(`Success! ${req.body.name} was added! yay!`)
    } catch (error) {
        res.status(500).send("Something went wrong!")
    }
})

// 9. POST /update-one-animal-name

app.post("/update-one-animal-name", async (req, res) => {
    try {
        const { id, newName } = req.body;
        await updateOneAnimalName(id, newName);
        res.send("Success, the animal's name was changed!");
    } catch (error) {
        res.status(500).send("Something went wrong!")
    }
})

// 10. POST /update-one-animal-category

app.post("/update-one-animal-category", async (req, res) => {
    try {
        const { id, newCategory } = req.body;
        await updateOneAnimalCategory(id, newCategory);
        res.send("Success! The animal's category was updated!");
    } catch (error) {
        res.status(500).send("Something went wrong!")
    }
})

// 11. 🌟 BONUS CHALLENGE — POST /add-many-animals

app.post("/add-many-animals", async (req,res) => {
    try {
        const { animals } = req.body;
        await addManyAnimals(animals);
        res.send("Success! The animals were added!")
    } catch (error) {
        res.status(500).send("Something went wrong!")
    }
})
