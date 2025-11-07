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

  // 🏈 Items (Football = 1, Baseball = 2, Basketball = 3, Hockey = 4)
  // Status IDs: 1=Unlisted, 2=Listed, 3=Sold, 4=Shipping, 5=Archived

  const kyleCards = [
    {
      title: "2020 Panini Prizm Patrick Mahomes Silver",
      category_id: 1,
      status_id: 2,
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
      tags: ["QB", "Chiefs", "Silver"],
      market_value: 1100.00, // 💎 Gold shimmer tier
    },
    {
      title: "2021 Panini Mosaic Tom Brady Touchdown Masters",
      category_id: 1,
      status_id: 2,
      player_name: "Tom Brady",
      team_name: "Tampa Bay Buccaneers",
      year: 2021,
      rookie: false,
      brand: "Panini Mosaic",
      sub_brand: "Insert",
      patch_count: 0,
      autograph: false,
      tags: ["Brady", "Insert", "Mosaic"],
      market_value: 525.00, // 🔴 Red pulse tier
    },
    {
      title: "2018 Topps Chrome Ronald Acuña Jr. Rookie",
      category_id: 2,
      status_id: 2,
      player_name: "Ronald Acuña Jr.",
      team_name: "Atlanta Braves",
      year: 2018,
      rookie: true,
      brand: "Topps Chrome",
      sub_brand: "Base Set",
      tags: ["Rookie", "Braves", "Chrome"],
      market_value: 350.00, // 🔵 Blue glow tier
    },
    {
      title: "2019-20 Panini Prizm Zion Williamson Rookie",
      category_id: 3,
      status_id: 1,
      player_name: "Zion Williamson",
      team_name: "New Orleans Pelicans",
      year: 2019,
      rookie: true,
      brand: "Panini Prizm",
      sub_brand: "Base",
      tags: ["Rookie", "Basketball", "Prizm"],
      market_value: 180.00, // ⚪ Common tier
    },
    {
      title: "2003 Topps LeBron James Rookie",
      category_id: 3,
      status_id: 3,
      player_name: "LeBron James",
      team_name: "Cleveland Cavaliers",
      year: 2003,
      rookie: true,
      brand: "Topps",
      sub_brand: "Base Set",
      tags: ["Rookie", "LeBron", "Basketball"],
      market_value: 3200.00, // 💎 Gold shimmer tier
    },
    {
      title: "2023 Panini Select Joe Burrow Red Die-Cut",
      category_id: 1,
      status_id: 2,
      player_name: "Joe Burrow",
      team_name: "Cincinnati Bengals",
      year: 2023,
      rookie: false,
      brand: "Panini Select",
      sub_brand: "Die-Cut",
      tags: ["QB", "Bengals", "Select"],
      market_value: 275.00, // 🔵 Blue glow tier
    },
    {
      title: "1999 Upper Deck Wayne Gretzky Legends",
      category_id: 4,
      status_id: 1,
      player_name: "Wayne Gretzky",
      team_name: "New York Rangers",
      year: 1999,
      rookie: false,
      brand: "Upper Deck",
      sub_brand: "Legends",
      tags: ["Hockey", "Gretzky", "Legends"],
      market_value: 650.00, // 🔴 Red pulse tier
    },
    {
      title: "2022 Bowman Chrome Julio Rodríguez Rookie",
      category_id: 2,
      status_id: 1,
      player_name: "Julio Rodríguez",
      team_name: "Seattle Mariners",
      year: 2022,
      rookie: true,
      brand: "Bowman Chrome",
      sub_brand: "Prospect",
      tags: ["Baseball", "Rookie", "Mariners"],
      market_value: 120.00, // ⚪ Common tier
    },
    {
      title: "2021 Panini Donruss Justin Herbert Gold Press Proof",
      category_id: 1,
      status_id: 2,
      player_name: "Justin Herbert",
      team_name: "Los Angeles Chargers",
      year: 2021,
      rookie: false,
      brand: "Donruss",
      sub_brand: "Gold Press Proof",
      tags: ["QB", "Chargers", "Donruss"],
      market_value: 480.00, // 🔵 Blue glow tier
    },
    {
      title: "2013 Topps Update Mike Trout All-Star Game",
      category_id: 2,
      status_id: 3,
      player_name: "Mike Trout",
      team_name: "Los Angeles Angels",
      year: 2013,
      rookie: false,
      brand: "Topps Update",
      sub_brand: "All-Star",
      tags: ["Baseball", "Trout", "All-Star"],
      market_value: 875.00, // 🔴 Red pulse tier
    },
  ];

  for (const card of kyleCards) {
    await createItem({
      user_id: kyle.id,
      ...card,
    });
  }

  // --- Mark’s card ---
  await createItem({
    user_id: mark.id,
    title: "1989 Upper Deck Ken Griffey Jr. Rookie",
    category_id: 2,
    status_id: 3,
    date_listed: new Date("2024-03-15"),
    date_sold: new Date("2024-03-20"),
    player_name: "Ken Griffey Jr.",
    team_name: "Seattle Mariners",
    year: 1989,
    rookie: true,
    brand: "Upper Deck",
    sub_brand: "Base Set",
    patch_count: 0,
    numbered_to: null,
    autograph: false,
    tags: ["Rookie", "Mariners", "Baseball"],
    market_value: 450.00,
  });

  // --- John’s card ---
  await createItem({
    user_id: john.id,
    title: "1996-97 Topps Kobe Bryant Rookie Card",
    category_id: 3,
    status_id: 1,
    player_name: "Kobe Bryant",
    team_name: "Los Angeles Lakers",
    year: 1996,
    rookie: true,
    brand: "Topps",
    sub_brand: "Base Set",
    patch_count: 0,
    numbered_to: null,
    autograph: false,
    tags: ["Rookie", "Lakers", "Basketball"],
    market_value: 950.00, // 🔴 Red pulse tier
  });

  console.log("✅ Seeded 10 cards for Kyle + 2 sample users with market values");
}
