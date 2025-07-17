/**
 * @fileoverview This file contains utility functions for analytics tracking.
 * It provides a structured way to send custom events to Google Analytics
 * using the global `gtag.js` function.
 */

// Union of all possible event names
type EventName = 
  | 'screen_view'
  | 'onboarding_completed'
  | 'start_game'
  | 'complete_game'
  | 'request_transcript'
  | 'email_story_submitted'
  | 'user_turn_taken'
  | 'ai_turn_generated'
  | 'theme_switched'
  | 'ad_impression'
  | 'ad_click'
  | 'ad_load_failed'
  | 'rewarded_ad_flow'
  | 'quit_game_prompted'
  | 'quit_game_confirmed';

// Interface defining the parameters for each event
interface EventParams {
    screen_view: {
        screen_name: 'loading_screen' | 'onboarding' | 'main_menu' | 'game_screen' | 'analysis_screen' | 'about_us' | 'privacy_policy' | 'terms_of_service';
    };
    onboarding_completed: {};
    start_game: {
        game_mode: 'interactive' | 'simulation';
        game_duration: 'lightning' | 'minute' | 'twice_a_minute';
    };
    complete_game: {
        story_length: number;
        final_mood: string;
    };
    request_transcript: {
        email_provided: boolean; // false when modal is opened, true on submit
    };
    email_story_submitted: {
        has_name: boolean;
        has_email: boolean;
    };
    user_turn_taken: {
        turn_time_seconds: number;
        word_count: number;
    };
    ai_turn_generated: {
        generation_time_ms: number;
        persona_1: string;
        persona_2: string;
    };
    theme_switched: {
        selected_theme: string;
    };
    ad_impression: {
        ad_platform: 'google_admob';
        ad_source: 'admob';
        ad_format: 'interstitial' | 'banner' | 'rewarded';
        ad_unit_name: string;
    };
    ad_click: {
        ad_format: 'interstitial' | 'banner' | 'rewarded';
        ad_unit_name: string;
    };
    ad_load_failed: {
        ad_unit_name: string;
        error_message: string;
    };
    rewarded_ad_flow: {
        status: 'offered' | 'completed' | 'declined';
    };
    quit_game_prompted: {
        story_length: number;
        game_mode: 'interactive' | 'simulation';
    };
    quit_game_confirmed: {
        story_length: number;
        game_mode: 'interactive' | 'simulation';
    };
}

/**
 * Logs an analytics event to Google Analytics.
 * @param eventName The name of the event to log.
 * @param params The parameters associated with the event.
 */
export function logEvent<T extends EventName>(eventName: T, params: EventParams[T]) {
  console.log(`[ANALYTICS] Event: ${eventName}`, params);
  
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  } else {
    console.warn('Google Analytics `gtag` function not found.');
  }
}
