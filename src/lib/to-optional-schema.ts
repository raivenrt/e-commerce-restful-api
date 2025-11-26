import type { Schema } from 'express-validator';

export default function toOptionalSchema(schema: Schema): Schema {
  const updatedSchema = { ...schema };

  for (const key in updatedSchema) updatedSchema[key]!.optional = true;

  return updatedSchema;
}
