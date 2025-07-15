/**
 * @fileoverview This file contains placeholder functions for analytics tracking.
 * In a real-world application, this would be integrated with a service like
 * Google Analytics. For now, it logs events to the console for development
 * and testing purposes.
 */

// Union of all possible event names
type EventName = 
  | 'screen_view'
  | 'onboarding_completed'
  | 'start_game'
  | 'complete_game'
  | 'request_transcript'
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
        screen_name: 'loading_screen' | 'onboarding_screen' | 'main_menu' | 'game_screen' | 'analysis_screen' | 'about_us' | 'privacy_policy' | 'terms_of_service';
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
        email_provided: boolean;
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
        saved_story: boolean;
        story_length: number;
        game_mode: 'interactive' | 'simulation';
    };
}

/**
 * Logs an analytics event.
 * @param eventName The name of the event to log.
 * @param params The parameters associated with the event.
 */
export function logEvent<T extends EventName>(eventName: T, params: EventParams[T]) {
  // In a real app, this would send data to Google Analytics or another service.
  // For now, we'll just log to the console.
  console.log(`[ANALYTICS] Event: ${eventName}`, params);
  
  // Example of how you might integrate with a real analytics SDK:
  // if (typeof window.gtag === 'function') {
  //   window.gtag('event', eventName, params);
  // }
}
