/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("audit_logs", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("entity_type").notNullable().comment("notification, otp, template");
    table.uuid("entity_id").notNullable().index();
    table.string("action").notNullable().comment("create, update, delete, send");
    table.string("actor_id");
    table.string("actor_type").comment("user, system, api");
    table.jsonb("changes").defaultTo("{}");
    table.jsonb("metadata").defaultTo("{}");
    table.string("ip_address");
    table.string("user_agent");
    table.timestamp("created_at").defaultTo(knex.fn.now());

    // Indexes
    table.index(["entity_type", "entity_id"]);
    table.index(["actor_id", "created_at"]);
    table.index("action");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("audit_logs");
};
