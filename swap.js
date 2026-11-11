/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

// Runs inside youtube.com/embed frames. Once YouTube shows its "Video unavailable" screen,
// replaces it with the regular watch page (which is not restricted), stripped down to just the player
(() => {
    if (window.vcEmbedFallback) return;
    window.vcEmbedFallback = true;

    const PLAYER_ONLY_CSS = `
        html, body, ytd-app { overflow: hidden !important; background: #000 !important; }
        #masthead-container, #secondary, #below, #chat-container, tp-yt-app-drawer, ytd-mini-guide-renderer, ytd-consent-bump-v2-lightbox, tp-yt-iron-overlay-backdrop { display: none !important; }
        #movie_player { position: fixed !important; inset: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 2147483647 !important; }
    `;

    const isBlocked = () => !!document.querySelector(
        'yt-player-interstitial-renderer a[href*="youtube.com/watch?v="], .ytp-error a[href*="youtube.com/watch?v="]'
    );

    function setDefaultCookie(name, value) {
        if (document.cookie.split("; ").some(c => c.startsWith(name + "="))) return;
        document.cookie = `${name}=${value}; domain=.youtube.com; path=/; max-age=31536000; secure; samesite=none`;
    }

    function playInPlace() {
        // YouTube keeps the video paused behind its cookie consent dialog, so answer it with "reject all"
        setDefaultCookie("SOCS", "CAESEwgDEgk0ODE3Nzk3MjQaAmVuIAEaBgiA_LyaBg");
        // English UI, autoplay of the next video off
        setDefaultCookie("PREF", "hl=en&f5=30000");

        const id = location.pathname.split("/")[2];
        const frame = document.createElement("iframe");
        frame.src = `https://www.youtube.com/watch?v=${id}`;
        frame.allow = "autoplay; fullscreen; encrypted-media; picture-in-picture";
        frame.allowFullscreen = true;
        frame.style.cssText = "position:fixed;inset:0;width:100%;height:100%;border:0;background:#000;z-index:2147483647";

        // the watch page may reload itself once (theme refresh), so restyle every new document as soon as it has a head
        let styledDoc = null;
        let started = false;
        let stuckTicks = 0;
        setInterval(() => {
            const doc = frame.contentDocument;
            if (!doc?.head || doc.URL === "about:blank") return;

            if (doc !== styledDoc) {
                styledDoc = doc;
                started = false;
                stuckTicks = 0;
                const style = doc.createElement("style");
                style.textContent = PLAYER_ONLY_CSS;
                doc.head.append(style);
                frame.contentWindow.dispatchEvent(new Event("resize"));
            }

            // in Discord the player can buffer forever until the first seek, so nudge it every 2s until playback has started once
            const player = doc.getElementById("movie_player");
            if (started || !player?.getPlayerState || player.classList.contains("ad-showing")) return;

            const state = player.getPlayerState();
            if (state === 1) {
                started = true;
            } else if ((state === -1 || state === 3 || state === 5) && ++stuckTicks % 20 === 0) {
                player.seekTo(player.getCurrentTime(), true);
                player.playVideo();
            }
        }, 100);
        frame.addEventListener("load", () => frame.contentWindow?.dispatchEvent(new Event("resize")));

        document.querySelector("video")?.pause();
        document.body.replaceChildren(frame);
    }

    if (isBlocked()) return playInPlace();
    const observer = new MutationObserver(() => {
        if (!isBlocked()) return;
        observer.disconnect();
        playInPlace();
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();
