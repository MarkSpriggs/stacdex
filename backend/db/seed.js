import db from "./client.js";
import { createUser } from "./queries/users.js";
import { createItem } from "./queries/items.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

await db.connect();
await seed();
console.log("🌱 Database seeded.");
await db.end();

async function seed() {
  const SALT_ROUNDS = 10;
  const hashedPassword = await bcrypt.hash("password123", SALT_ROUNDS);

// Create sample users
const kyle = await createUser({
  name: "Kyle",
  email: "kyle@example.com",
  hashedPassword,
});

const mark = await createUser({
  name: "Mark",
  email: "mark@example.com",
  hashedPassword,
});

const john = await createUser({
  name: "John",
  email: "john@example.com",
  hashedPassword,
});

console.log("Created users:", kyle.name, mark.name, john.name);

  // 🏈 Items (Football = category_id 1, Baseball = 2, Basketball = 3, Hockey = 4)
  // Status IDs: 1=Unlisted, 2=Listed, 3=Sold, 4=Shipping, 5=Archived

  const item1 = await createItem({
    user_id: kyle.id,
    title: "2020 Panini Prizm Patrick Mahomes Silver",
    category_id: 1,  // Football
    status_id: 2,    // Listed
    date_listed: new Date(),
    player_name: "Patrick Mahomes",
    team_name: "Kansas City Chiefs",
    year: 2020,
    rookie: false,
    brand: "Panini Prizm",
    sub_brand: "Silver Refractor",
    patch_count: 0,
    numbered_to: 99,
    autograph: false,
    tags: ["QB", "Chiefs", "Silver"]
  });

  const item2 = await createItem({
    user_id: mark.id,
    title: "1989 Upper Deck Ken Griffey Jr. Rookie",
    category_id: 2,  // Baseball
    status_id: 3,    // Sold
    date_listed: new Date('2024-03-15'),
    date_sold: new Date('2024-03-20'),
    player_name: "Ken Griffey Jr.",
    team_name: "Seattle Mariners",
    year: 1989,
    rookie: true,
    brand: "Upper Deck",
    sub_brand: "Base Set",
    patch_count: 0,
    numbered_to: null,
    autograph: false,
    tags: ["Rookie", "Mariners", "Baseball"]
  });

  const item3 = await createItem({
    user_id: john.id,
    title: "1996-97 Topps Kobe Bryant Rookie Card",
    category_id: 3,  // Basketball
    status_id: 1,    // Unlisted
    date_listed: null,
    player_name: "Kobe Bryant",
    team_name: "Los Angeles Lakers",
    year: 1996,
    rookie: true,
    brand: "Topps",
    sub_brand: "Base Set",
    patch_count: 0,
    numbered_to: null,
    autograph: false,
    tags: ["Rookie", "Lakers", "Basketball"]
  });

  console.log("Created items:", item1.title, item2.title, item3.title);
}
