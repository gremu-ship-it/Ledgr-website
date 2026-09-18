CREATE TABLE "analytics_consent" (
	"id" serial PRIMARY KEY NOT NULL,
	"visitor_id" varchar(64),
	"action" varchar(16) NOT NULL,
	"policy_version" varchar(20) DEFAULT '1' NOT NULL,
	"ip_hash" varchar(64),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"visitor_id" varchar(64),
	"session_id" varchar(64),
	"type" varchar(32) NOT NULL,
	"name" varchar(160),
	"path" varchar(300),
	"title" varchar(200),
	"referrer" text,
	"channel" varchar(40),
	"props" jsonb,
	"contact_id" integer,
	"duration_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" varchar(64) NOT NULL,
	"visitor_id" varchar(64) NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"landing_path" varchar(300),
	"exit_path" varchar(300),
	"referrer" text,
	"referrer_host" varchar(160),
	"channel" varchar(40) DEFAULT 'direct' NOT NULL,
	"utm_source" varchar(160),
	"utm_medium" varchar(160),
	"utm_campaign" varchar(160),
	"utm_content" varchar(160),
	"utm_term" varchar(160),
	"country" varchar(8),
	"region" varchar(80),
	"city" varchar(120),
	"device" varchar(16),
	"os" varchar(40),
	"browser" varchar(40),
	"language" varchar(16),
	"pageview_count" integer DEFAULT 0 NOT NULL,
	"event_count" integer DEFAULT 0 NOT NULL,
	"engaged_seconds" integer DEFAULT 0 NOT NULL,
	"is_bounce" boolean DEFAULT true NOT NULL,
	"converted" boolean DEFAULT false NOT NULL,
	"contact_id" integer,
	"ip_hash" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "analytics_sessions_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "analytics_visitors" (
	"id" serial PRIMARY KEY NOT NULL,
	"visitor_id" varchar(64) NOT NULL,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"pageview_count" integer DEFAULT 0 NOT NULL,
	"session_count" integer DEFAULT 0 NOT NULL,
	"first_landing_path" varchar(300),
	"first_referrer" text,
	"first_referrer_host" varchar(160),
	"first_channel" varchar(40) DEFAULT 'direct' NOT NULL,
	"utm_source" varchar(160),
	"utm_medium" varchar(160),
	"utm_campaign" varchar(160),
	"utm_content" varchar(160),
	"utm_term" varchar(160),
	"country" varchar(8),
	"region" varchar(80),
	"city" varchar(120),
	"device" varchar(16),
	"os" varchar(40),
	"browser" varchar(40),
	"language" varchar(16),
	"ip_hash" varchar(64),
	"is_bot" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "analytics_visitors_visitor_id_unique" UNIQUE("visitor_id")
);
--> statement-breakpoint
CREATE TABLE "campaign_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"contact_id" integer NOT NULL,
	"channel" varchar(16) NOT NULL,
	"campaign" varchar(80),
	"segment" varchar(60),
	"template_key" varchar(60),
	"subject" varchar(200),
	"body" text NOT NULL,
	"status" varchar(16) DEFAULT 'queued' NOT NULL,
	"provider" varchar(24) DEFAULT 'composer' NOT NULL,
	"error" text,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_visitors" (
	"id" serial PRIMARY KEY NOT NULL,
	"contact_id" integer NOT NULL,
	"visitor_id" varchar(64) NOT NULL,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"pageview_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(256) NOT NULL,
	"name" varchar(160),
	"phone" varchar(60),
	"business_name" varchar(200),
	"business_type" varchar(80),
	"first_visitor_id" varchar(64),
	"first_channel" varchar(40),
	"first_landing_path" varchar(300),
	"first_referrer" text,
	"utm_source" varchar(160),
	"utm_medium" varchar(160),
	"utm_campaign" varchar(160),
	"marketing_opt_in" boolean DEFAULT false NOT NULL,
	"opt_in_source" varchar(60),
	"opt_in_at" timestamp with time zone,
	"unsubscribed_at" timestamp with time zone,
	"unsubscribe_token" varchar(64) NOT NULL,
	"status" varchar(24) DEFAULT 'new' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"notes" text,
	"last_contacted_at" timestamp with time zone,
	"outreach_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_activity_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "contacts_email_unique" UNIQUE("email"),
	CONSTRAINT "contacts_unsubscribe_token_unique" UNIQUE("unsubscribe_token")
);
--> statement-breakpoint
CREATE INDEX "analytics_consent_visitor_idx" ON "analytics_consent" USING btree ("visitor_id","created_at");--> statement-breakpoint
CREATE INDEX "analytics_events_created_idx" ON "analytics_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "analytics_events_visitor_idx" ON "analytics_events" USING btree ("visitor_id","created_at");--> statement-breakpoint
CREATE INDEX "analytics_events_session_idx" ON "analytics_events" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "analytics_events_type_idx" ON "analytics_events" USING btree ("type","created_at");--> statement-breakpoint
CREATE INDEX "analytics_events_path_idx" ON "analytics_events" USING btree ("path");--> statement-breakpoint
CREATE INDEX "analytics_events_contact_idx" ON "analytics_events" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "analytics_sessions_started_idx" ON "analytics_sessions" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "analytics_sessions_visitor_idx" ON "analytics_sessions" USING btree ("visitor_id");--> statement-breakpoint
CREATE INDEX "analytics_sessions_channel_idx" ON "analytics_sessions" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "analytics_sessions_contact_idx" ON "analytics_sessions" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "analytics_visitors_last_seen_idx" ON "analytics_visitors" USING btree ("last_seen_at");--> statement-breakpoint
CREATE INDEX "analytics_visitors_channel_idx" ON "analytics_visitors" USING btree ("first_channel");--> statement-breakpoint
CREATE INDEX "campaign_messages_contact_idx" ON "campaign_messages" USING btree ("contact_id","created_at");--> statement-breakpoint
CREATE INDEX "campaign_messages_status_idx" ON "campaign_messages" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "contact_visitors_unique_idx" ON "contact_visitors" USING btree ("contact_id","visitor_id");--> statement-breakpoint
CREATE INDEX "contact_visitors_visitor_idx" ON "contact_visitors" USING btree ("visitor_id");--> statement-breakpoint
CREATE INDEX "contacts_last_activity_idx" ON "contacts" USING btree ("last_activity_at");--> statement-breakpoint
CREATE INDEX "contacts_opt_in_idx" ON "contacts" USING btree ("marketing_opt_in");--> statement-breakpoint
CREATE INDEX "contacts_status_idx" ON "contacts" USING btree ("status");