DO $$ BEGIN
 CREATE TYPE "public"."role" AS ENUM('Administrator', 'Employee', 'User');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(15),
	"password" text NOT NULL,
	"profilePicture" text,
	"birthDate" date,
	"bio" text,
	"admin" "role" DEFAULT 'User',
	"address" text,
	"cep" varchar(12),
	"email_verified_at" timestamp (3),
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL
);
