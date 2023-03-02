const { Client } = require("pg");

const client = new Client("postgres://localhost:5432/juicebox-dev");

async function getAllUsers() {
  const { rows } = await client.query(
    `SELECT id, username, name, location, active 
      FROM users;
    `
  );
  console.log(rows);
  return rows;
}

async function getAllPosts() {
  try {
    const { rows } = await client.query(
      `
      SELECT *
      FROM posts;
      `
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function createUser({ username, password, name, location }) {
  try {
    const { rows } = await client.query(
      `
      INSERT INTO users(username, password, name, location)
      VALUES($1, $2, $3, $4)
      ON CONFLICT (username) DO NOTHING
      RETURNING *;
    `,
      [username, password, name, location]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function createPost({ authorId, title, content }) {
  try {
    const { rows } = await client.query(
      `
        INSERT INTO posts("authorId", title, content) 
        VALUES($1, $2, $3) 
        RETURNING *;
      `,
      [authorId, title, content]
    );
    console.log(rows, "Create Post function");
    return rows;
  } catch (error) {
    throw error;
  }
}

async function updateUser(id, fields = {}) {
  // build the set string
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");
  console.log(setString, "SETSTRING")
  // return early if this is called without fields
  if (setString.length === 0) {
    return;
  }

  try {
    const {
      rows: [user],
    } = await client.query(
      `
        UPDATE users
        SET ${setString}
        WHERE id=${id}
        RETURNING *;
      `,
      Object.values(fields)
    );

    return user;
  } catch (error) {
    throw error;
  }
}

async function updatePost(id, field = { title, content, active }) {
  const setString = Object.keys(field)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");
  // return early if this is called without fields
  if (setString.length === 0) {
    return;
  }
  try {
    const {
      rows: [post],
    } = await client.query(
      `
        UPDATE posts
        SET ${setString}
        WHERE "authorId"=${id}
        RETURNING *;
      `,
      Object.values(field)
    );

    return post;
  } catch (error) {
    throw error;
  }
}

async function getPostsByUser(userId) {
  try {
    const { rows } = await client.query(`
        SELECT * FROM posts
        WHERE "authorId"=${userId};
      `);

    return rows;
  } catch (error) {
    throw error;
  }
}

async function getUserById(userId) {
  try {
    const { rows } = await client.query(`
        SELECT * FROM users
        WHERE "id"=${userId}

        `);
    const user = rows[0];
    if (!user) {
      return null;
    }
    delete user.password;
    user.posts = await getPostsByUser(userId);

    return user;
  } catch (error) {
    throw error;
  }
}

async function createTags(tagList) {
  if (tagList.length === 0) {

    return;
  }

  // need something like: $1), ($2), ($3
  const insertValues = tagList.map((_, index) => `$${index + 1}`).join("), (");
  // then we can use: (${ insertValues }) in our string template
  console.log(insertValues, "insertValues")
  // need something like $1, $2, $3
  const selectValues = tagList.map((_, index) => `$${index + 1}`).join(", ");
  // then we can use (${ selectValues }) in our string template

  try {
    await client.query(
      `
      INSERT INTO tags(name),
      VALUES(${insertValues}),
      ON CONFLICT (name) DO NOTHING;
      `, tagList
    )
    const {rows} = await client.query(
      `
      SELECT * FROM tags,
      WHERE name,
      VALUES(${selectValues})
      `, tagList
    )
    console.log(rows, "LINE183")
    return rows
    // insert the tags, doing nothing on conflict
    // returning nothing, we'll query after
    // select all tags where the name is in our taglist
    // return the rows from the query
  } catch (error) {
    throw error;
  }
}

module.exports = {
  client,
  getAllUsers,
  createUser,
  createPost,
  updateUser,
  updatePost,
  getAllPosts,
  getPostsByUser,
  getUserById,
  createTags
};
