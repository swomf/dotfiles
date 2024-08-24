/*
    Use this with UBlock Origin.
    DarkReader is optional (dark mode)

    https://github.com/arkenfox/user.js/wiki/3.2-Overrides-[Common]
    https://github.com/arkenfox/user.js/issues/1080

    CHOSEN OVERRIDES
    - keep history
    - use quad9 with native fallback
    - allow url bar searching
    - no pocket

    OPTIONAL OVERRIDES
    - resistFingerprinting (default: enabled)
    - letterboxing         (default: enabled)
    - Google safe browsing (default: enabled)
*/

// APPEARANCE (check this too!) ---------------------------------------------

// Uncomment anything? Consider CanvasBlocker
// https://addons.mozilla.org/en-US/firefox/addon/canvasblocker/

// 4501 Resist fingerprinting broadly. (Breaks dakr mode, sets timezone to UTC0, etc.)
// Still need dark mode? https://addons.mozilla.org/en-US/firefox/addon/darkreader/
// user_pref("privacy.resistFingerprinting", false)

// 4504 Use letterbox rounded sizes to avoid tracking. (Adds border around page)
// user_pref("privacy.resistFingerprinting.letterboxing", false)

// SESSION ------------------------------------------------------------------------------------------

// Keep history and enable session restore after Firefox closes
user_pref("browser.startup.page", 3); // 0102
user_pref("privacy.clearOnShutdown.history", false); // 2811

// CONNECTIVITY ----------------------------------------------------------------------

// 0710 Protects web requests from an ISP. Disable with PiHole, but pfBlocker is fine.
user_pref("network.trr.uri", "https://dns.quad9.net/dns-query");
user_pref("network.trr.mode", 2);

// SEARCH ----------------------------------------------------------------------

// 0801 Reenable url bar to search
user_pref("keyword.enabled", true);

// 0401 Disable Safe Browsing
// user_pref("browser.safebrowsing.malware.enabled", false);
// user_pref("browser.safebrowsing.phishing.enabled", false);
// user_pref("browser.safebrowsing.downloads.enabled", false);

// POCKET ------------------------------------------------

user_pref("extensions.pocket.enabled", false)