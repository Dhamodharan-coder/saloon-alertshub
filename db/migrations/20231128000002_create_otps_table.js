/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("otps", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("identifier").notNullable().index().comment("email or phone");
    table.string("otp_hash").notNullable();
    table.string("purpose").notNullable().comment("login, verification, reset_password");
    table
      .string("status")
      .notNullable()
      .defaultTo("active")
      .comment("active, verified, expired, revoked");
    table.integer("attempts").defaultTo(0);
    table.timestamp("verified_at");
    table.timestamp("expires_at").notNullable().index();
    table.jsonb("metadata").defaultTo("{}");
    table.timestamps(true, true);

    // Composite index for active OTP lookup
    table.index(["identifier", "purpose", "status"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("otps");
};
