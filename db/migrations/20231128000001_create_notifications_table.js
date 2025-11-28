/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("notifications", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("type").notNullable().comment("email, push, sms");
    table.string("recipient").notNullable().index();
    table.string("template_id").notNullable();
    table.jsonb("template_data").defaultTo("{}");
    table.string("subject");
    table.text("body");
    table
      .string("status")
      .notNullable()
      .defaultTo("pending")
      .comment("pending, sent, failed, cancelled");
    table.string("provider").comment("gmail, sendgrid, fcm, apns");
    table.jsonb("metadata").defaultTo("{}");
    table.text("error_message");
    table.integer("retry_count").defaultTo(0);
    table.timestamp("sent_at");
    table.timestamp("failed_at");
    table.timestamps(true, true);

    // Indexes
    table.index(["status", "created_at"]);
    table.index(["type", "status"]);
    table.index("template_id");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("notifications");
};
