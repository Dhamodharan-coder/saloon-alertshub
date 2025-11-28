/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("device_tokens", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("user_id").notNullable().index();
    table.string("token").notNullable().unique();
    table.string("platform").notNullable().comment("ios, android, web");
    table.string("device_id");
    table.string("device_model");
    table.string("os_version");
    table.string("app_version");
    table.boolean("is_active").defaultTo(true);
    table.timestamp("last_used_at");
    table.timestamps(true, true);

    // Indexes
    table.index(["user_id", "is_active"]);
    table.index("platform");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("device_tokens");
};
