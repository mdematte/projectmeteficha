export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AppRole = "admin" | "user";
export type GameStatus = "draft" | "published" | "disabled";
export type LaunchMode = "unavailable" | "demo_screen" | "iframe" | "native";
export type EventStatus = "scheduled" | "live" | "suspended" | "finished" | "cancelled";
export type MarketStatus = "open" | "suspended" | "closed";
export type SelectionStatus = "open" | "suspended" | "closed";
export type SelectionResult = "pending" | "won" | "lost" | "void";
export type TicketStatus = "pending" | "won" | "lost" | "void" | "cancelled";
export type TxType = "credit" | "debit" | "reset";
export type IntegrationStatus = "disabled" | "configured" | "validating" | "active" | "error";
export type ScenarioStatus = "draft" | "ready" | "running" | "completed" | "error";
export type RunStatus = "queued" | "running" | "completed" | "error" | "paused";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; display_name: string | null; avatar_url: string | null; created_at: string; updated_at: string };
        Insert: { id: string; display_name?: string | null; avatar_url?: string | null };
        Update: { display_name?: string | null; avatar_url?: string | null };
      };
      user_roles: {
        Row: { id: string; user_id: string; role: AppRole; created_at: string };
        Insert: { id?: string; user_id: string; role: AppRole };
        Update: { role?: AppRole };
      };
      game_providers: {
        Row: { id: string; name: string; slug: string; status: string; created_at: string };
        Insert: { id?: string; name: string; slug: string; status?: string };
        Update: { name?: string; slug?: string; status?: string };
      };
      game_categories: {
        Row: { id: string; name: string; slug: string; sort_order: number; created_at: string };
        Insert: { id?: string; name: string; slug: string; sort_order?: number };
        Update: { name?: string; slug?: string; sort_order?: number };
      };
      games: {
        Row: { id: string; provider_id: string | null; category_id: string | null; name: string; slug: string; description: string | null; image_path: string | null; external_ref: string | null; status: GameStatus; demo_available: boolean; launch_mode: LaunchMode; metadata: Json; created_at: string; updated_at: string };
        Insert: { id?: string; provider_id?: string | null; category_id?: string | null; name: string; slug: string; description?: string | null; image_path?: string | null; external_ref?: string | null; status?: GameStatus; demo_available?: boolean; launch_mode?: LaunchMode; metadata?: Json };
        Update: Partial<{ provider_id: string | null; category_id: string | null; name: string; slug: string; description: string | null; image_path: string | null; external_ref: string | null; status: GameStatus; demo_available: boolean; launch_mode: LaunchMode; metadata: Json }>;
      };
      user_favorites: {
        Row: { id: string; user_id: string; game_id: string; created_at: string };
        Insert: { id?: string; user_id: string; game_id: string };
        Update: {};
      };
      user_recent_games: {
        Row: { id: string; user_id: string; game_id: string; played_at: string };
        Insert: { id?: string; user_id: string; game_id: string; played_at?: string };
        Update: { played_at?: string };
      };
      sports: {
        Row: { id: string; name: string; slug: string; icon: string | null; sort_order: number; created_at: string };
        Insert: { id?: string; name: string; slug: string; icon?: string | null; sort_order?: number };
        Update: Partial<{ name: string; slug: string; icon: string | null; sort_order: number }>;
      };
      competitions: {
        Row: { id: string; sport_id: string; name: string; slug: string; country: string | null; created_at: string };
        Insert: { id?: string; sport_id: string; name: string; slug: string; country?: string | null };
        Update: Partial<{ name: string; slug: string; country: string | null }>;
      };
      participants: {
        Row: { id: string; name: string; logo_path: string | null; created_at: string };
        Insert: { id?: string; name: string; logo_path?: string | null };
        Update: Partial<{ name: string; logo_path: string | null }>;
      };
      events: {
        Row: { id: string; competition_id: string; home_participant_id: string; away_participant_id: string; starts_at: string; status: EventStatus; is_demo: boolean; result_summary: Json; created_at: string; updated_at: string };
        Insert: { id?: string; competition_id: string; home_participant_id: string; away_participant_id: string; starts_at: string; status?: EventStatus; is_demo?: boolean; result_summary?: Json };
        Update: Partial<{ competition_id: string; home_participant_id: string; away_participant_id: string; starts_at: string; status: EventStatus; result_summary: Json }>;
      };
      markets: {
        Row: { id: string; event_id: string; type: string; name: string; status: MarketStatus; version: number; created_at: string; updated_at: string };
        Insert: { id?: string; event_id: string; type: string; name: string; status?: MarketStatus };
        Update: Partial<{ type: string; name: string; status: MarketStatus; version: number }>;
      };
      selections: {
        Row: { id: string; market_id: string; name: string; odds: number; status: SelectionStatus; result: SelectionResult; version: number; created_at: string; updated_at: string };
        Insert: { id?: string; market_id: string; name: string; odds: number; status?: SelectionStatus };
        Update: Partial<{ name: string; odds: number; status: SelectionStatus; result: SelectionResult; version: number }>;
      };
      odds_history: {
        Row: { id: string; selection_id: string; odds: number; version: number; changed_at: string };
        Insert: { id?: string; selection_id: string; odds: number; version: number };
        Update: {};
      };
      demo_wallets: {
        Row: { id: string; user_id: string; balance_cents: number; updated_at: string; created_at: string };
        Insert: { id?: string; user_id: string; balance_cents?: number };
        Update: { balance_cents?: number };
      };
      demo_wallet_transactions: {
        Row: { id: string; wallet_id: string; user_id: string; amount_cents: number; type: TxType; reference_type: string | null; reference_id: string | null; idempotency_key: string; created_at: string };
        Insert: { id?: string; wallet_id: string; user_id: string; amount_cents: number; type: TxType; reference_type?: string | null; reference_id?: string | null; idempotency_key: string };
        Update: {};
      };
      demo_tickets: {
        Row: { id: string; user_id: string; stake_cents: number; potential_payout_cents: number; total_odds: number; status: TicketStatus; idempotency_key: string; created_at: string; settled_at: string | null };
        Insert: { id?: string; user_id: string; stake_cents: number; potential_payout_cents: number; total_odds: number; status?: TicketStatus; idempotency_key: string };
        Update: { status?: TicketStatus; settled_at?: string | null };
      };
      demo_ticket_selections: {
        Row: { id: string; ticket_id: string; event_id: string; market_id: string; selection_id: string; event_name: string; market_name: string; selection_name: string; odds_accepted: number; created_at: string };
        Insert: { id?: string; ticket_id: string; event_id: string; market_id: string; selection_id: string; event_name: string; market_name: string; selection_name: string; odds_accepted: number };
        Update: {};
      };
      banners: {
        Row: { id: string; title: string; subtitle: string | null; image_path: string | null; link_url: string | null; sort_order: number; active: boolean; created_at: string };
        Insert: { id?: string; title: string; subtitle?: string | null; image_path?: string | null; link_url?: string | null; sort_order?: number; active?: boolean };
        Update: Partial<{ title: string; subtitle: string | null; image_path: string | null; link_url: string | null; sort_order: number; active: boolean }>;
      };
      site_settings: {
        Row: { key: string; value: Json; updated_at: string };
        Insert: { key: string; value: Json };
        Update: { value?: Json };
      };
      audit_logs: {
        Row: { id: string; actor_id: string | null; action: string; entity_type: string; entity_id: string | null; metadata: Json; created_at: string };
        Insert: { id?: string; actor_id?: string | null; action: string; entity_type: string; entity_id?: string | null; metadata?: Json };
        Update: {};
      };
      integration_configs: {
        Row: { id: string; provider_name: string; status: IntegrationStatus; config: Json; created_at: string; updated_at: string };
        Insert: { id?: string; provider_name: string; status?: IntegrationStatus; config?: Json };
        Update: Partial<{ status: IntegrationStatus; config: Json }>;
      };
      integration_health: {
        Row: { id: string; integration_id: string; checked_at: string; status: IntegrationStatus; latency_ms: number | null; message: string | null };
        Insert: { id?: string; integration_id: string; status: IntegrationStatus; latency_ms?: number | null; message?: string | null };
        Update: {};
      };
      webhook_events: {
        Row: { id: string; source: string; payload: Json; processed: boolean; created_at: string };
        Insert: { id?: string; source: string; payload: Json; processed?: boolean };
        Update: { processed?: boolean };
      };
      simulation_scenarios: {
        Row: { id: string; name: string; description: string | null; event_id: string | null; steps: Json; interval_seconds: number; status: ScenarioStatus; created_at: string; updated_at: string };
        Insert: { id?: string; name: string; description?: string | null; event_id?: string | null; steps?: Json; interval_seconds?: number; status?: ScenarioStatus };
        Update: Partial<{ name: string; description: string | null; event_id: string | null; steps: Json; interval_seconds: number; status: ScenarioStatus }>;
      };
      simulation_runs: {
        Row: { id: string; scenario_id: string; status: RunStatus; current_step: number; started_at: string | null; finished_at: string | null; error_message: string | null; run_key: string; created_at: string };
        Insert: { id?: string; scenario_id: string; status?: RunStatus; current_step?: number; run_key: string };
        Update: Partial<{ status: RunStatus; current_step: number; started_at: string | null; finished_at: string | null; error_message: string | null }>;
      };
      automation_state: {
        Row: { id: string; is_paused: boolean; paused_by: string | null; paused_at: string | null; updated_at: string };
        Insert: { id?: string; is_paused?: boolean };
        Update: { is_paused?: boolean; paused_by?: string | null; paused_at?: string | null };
      };
    };
    Functions: {
      has_role: { Args: { _user_id: string; _role: AppRole }; Returns: boolean };
      place_demo_ticket: { Args: { _selections: Json; _stake_cents: number; _idempotency_key: string }; Returns: Json };
      toggle_automation_pause: { Args: { _paused: boolean }; Returns: undefined };
    };
  };
}
