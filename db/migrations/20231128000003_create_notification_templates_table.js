/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("notification_templates", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("name").notNullable().unique();
    table.string("type").notNullable().comment("email, push, sms");
    table.string("subject");
    table.text("body").notNullable();
    table.text("html_body");
    table.jsonb("default_data").defaultTo("{}");
    table.boolean("is_active").defaultTo(true);
    table.string("description");
    table.timestamps(true, true);

    // Indexes
    table.index(["type", "is_active"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("notification_templates");
};
