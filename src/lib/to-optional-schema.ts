import type { Schema } from 'express-validator';

export default function toOptionalSchema(schema: Schema): Schema {
  const updatedSchema: Schema = {};

  for (const key in schema) updatedSchema[key] = { ...schema[key], optional: true };

  return updatedSchema;
}
