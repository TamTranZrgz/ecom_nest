-- This is an empty migration.
CREATE UNIQUE INDEX permission_name_unique ON "Permission" (name) WHERE "deletedAt" IS NULL;