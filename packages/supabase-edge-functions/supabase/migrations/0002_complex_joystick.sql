CREATE TABLE IF NOT EXISTS "saved-palettes" (
	"created_at" timestamp DEFAULT now(),
	"palette" varchar NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "id" PRIMARY KEY("palette","user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "saved-palettes" ADD CONSTRAINT "saved-palettes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
