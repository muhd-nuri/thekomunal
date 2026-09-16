CREATE TYPE "public"."notify_status" AS ENUM('pending', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."reservation_status" AS ENUM('new', 'contacted', 'confirmed', 'cancelled', 'no_show');--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone_raw" text NOT NULL,
	"phone_e164" text NOT NULL,
	"company" text,
	"event_type" text,
	"outlet_slug" text NOT NULL,
	"guests" integer NOT NULL,
	"reserved_date" date NOT NULL,
	"reserved_time" text NOT NULL,
	"reserved_at" timestamp with time zone NOT NULL,
	"notes" text,
	"status" "reservation_status" DEFAULT 'new' NOT NULL,
	"source_channel" text DEFAULT 'direct' NOT NULL,
	"source_detail" text,
	"ref_code" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"utm_content" text,
	"utm_term" text,
	"click_id_type" text,
	"click_id" text,
	"referrer_url" text,
	"landing_path" text,
	"submit_path" text,
	"first_touch" jsonb,
	"user_agent" text,
	"ip_hash" text,
	"telegram_status" "notify_status" DEFAULT 'pending' NOT NULL,
	"telegram_message_id" bigint,
	"telegram_error" text,
	"contacted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reservations_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE INDEX "reservations_created_idx" ON "reservations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "reservations_outlet_date_idx" ON "reservations" USING btree ("outlet_slug","reserved_date");--> statement-breakpoint
CREATE INDEX "reservations_status_idx" ON "reservations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reservations_channel_idx" ON "reservations" USING btree ("source_channel");--> statement-breakpoint
CREATE INDEX "reservations_ref_idx" ON "reservations" USING btree ("ref_code");--> statement-breakpoint
CREATE INDEX "reservations_ip_created_idx" ON "reservations" USING btree ("ip_hash","created_at");