CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_id" uuid,
	"user_name" text NOT NULL,
	"action_type" text NOT NULL,
	"details" text,
	"ip_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wave_id" uuid,
	"test_number" text NOT NULL,
	"full_name" text NOT NULL,
	"nisn" text,
	"school_origin" text NOT NULL,
	"major_choice" text NOT NULL,
	"room_assignment" text DEFAULT 'Ruang 1',
	"status_pipeline" text DEFAULT 'REGISTERED' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "candidates_test_number_unique" UNIQUE("test_number")
);
--> statement-breakpoint
CREATE TABLE "final_rankings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_id" uuid NOT NULL,
	"wave_id" uuid NOT NULL,
	"composite_score" numeric(5, 2) DEFAULT '0' NOT NULL,
	"rank_tpa" integer DEFAULT 0 NOT NULL,
	"rank_pesantren" integer DEFAULT 0 NOT NULL,
	"rank_parallel" integer DEFAULT 0 NOT NULL,
	"admission_status" text DEFAULT 'WAITING_LIST' NOT NULL,
	"override_reason" text,
	"approved_by" text,
	"decided_at" timestamp,
	CONSTRAINT "final_rankings_candidate_id_unique" UNIQUE("candidate_id")
);
--> statement-breakpoint
CREATE TABLE "pesantren_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_id" uuid NOT NULL,
	"tahsin_score" numeric(5, 2) DEFAULT '0' NOT NULL,
	"has_memorization" boolean DEFAULT false NOT NULL,
	"tahfidz_score" numeric(5, 2) DEFAULT '0' NOT NULL,
	"combined_quran_score" numeric(5, 2) DEFAULT '0' NOT NULL,
	"kitab_kuning_score" numeric(5, 2) DEFAULT '0' NOT NULL,
	"b_inggris_score" numeric(5, 2) DEFAULT '0' NOT NULL,
	"b_arab_score" numeric(5, 2) DEFAULT '0' NOT NULL,
	"hadits_score" numeric(5, 2) DEFAULT '0' NOT NULL,
	"adzan_score" numeric(5, 2) DEFAULT '0' NOT NULL,
	"sholat_score" numeric(5, 2) DEFAULT '0' NOT NULL,
	"average_score" numeric(5, 2) DEFAULT '0' NOT NULL,
	"notes" text,
	"lock_status" text DEFAULT 'DRAFT' NOT NULL,
	"examiner_name" text,
	"locked_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pesantren_scores_candidate_id_unique" UNIQUE("candidate_id")
);
--> statement-breakpoint
CREATE TABLE "qualitative_interviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_id" uuid NOT NULL,
	"form_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"student_general_summary" text,
	"student_pesantren_summary" text,
	"parent_commitment_summary" text,
	"special_recommendation" text,
	"interviewer_name" text,
	"completion_status" text DEFAULT 'NOT_STARTED' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "qualitative_interviews_candidate_id_unique" UNIQUE("candidate_id")
);
--> statement-breakpoint
CREATE TABLE "tpa_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_id" uuid NOT NULL,
	"eyd_correct" integer DEFAULT 0 NOT NULL,
	"kohesi_correct" integer DEFAULT 0 NOT NULL,
	"logika_correct" integer DEFAULT 0 NOT NULL,
	"analogi_correct" integer DEFAULT 0 NOT NULL,
	"wacana_correct" integer DEFAULT 0 NOT NULL,
	"mtk_hitung_correct" integer DEFAULT 0 NOT NULL,
	"mtk_ruang_correct" integer DEFAULT 0 NOT NULL,
	"b_inggris_correct" integer DEFAULT 0 NOT NULL,
	"b_arab_correct" integer DEFAULT 0 NOT NULL,
	"tahfidz_correct" integer DEFAULT 0 NOT NULL,
	"tahsin_correct" integer DEFAULT 0 NOT NULL,
	"karakter_correct" integer DEFAULT 0 NOT NULL,
	"raw_total_score" integer DEFAULT 0 NOT NULL,
	"final_score_100" numeric(5, 2) DEFAULT '0' NOT NULL,
	"category" text DEFAULT 'Sangat Buruk' NOT NULL,
	"lock_status" text DEFAULT 'DRAFT' NOT NULL,
	"examiner_name" text,
	"locked_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tpa_scores_candidate_id_unique" UNIQUE("candidate_id")
);
--> statement-breakpoint
CREATE TABLE "waves" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wave_name" text NOT NULL,
	"test_date" timestamp NOT NULL,
	"quota_capacity" integer DEFAULT 20 NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_wave_id_waves_id_fk" FOREIGN KEY ("wave_id") REFERENCES "public"."waves"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "final_rankings" ADD CONSTRAINT "final_rankings_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "final_rankings" ADD CONSTRAINT "final_rankings_wave_id_waves_id_fk" FOREIGN KEY ("wave_id") REFERENCES "public"."waves"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pesantren_scores" ADD CONSTRAINT "pesantren_scores_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qualitative_interviews" ADD CONSTRAINT "qualitative_interviews_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tpa_scores" ADD CONSTRAINT "tpa_scores_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;