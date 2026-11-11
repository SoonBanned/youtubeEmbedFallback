# YoutubeEmbedFallback

A [Vencord](https://vencord.dev) plugin that plays YouTube videos blocked from embedding ("Video unavailable – playback on other websites has been disabled") directly inside the Discord embed, instead of making you open them in a browser.

## How it works

When a YouTube embed in Discord shows the "Video unavailable" screen, the plugin replaces it with the regular YouTube watch page for the same video, stripped down to just the player.

- Normal embeds are left untouched; the swap only happens when YouTube refuses to play the video.
- If the built-in **YoutubeAdblock** plugin is enabled, it is applied to the fallback player too.
- To let the video start, the plugin sets two default YouTube cookies if you don't already have them: one that rejects the cookie consent dialog, and one that sets the UI to English with autoplay of the next video turned off.

## Installation

This is a userplugin, so you need a [Vencord build from source](https://docs.vencord.dev/installing/).

1. Clone this repository into your Vencord `src/userplugins` folder, keeping the folder name `youtubeEmbedFallback`:

   ```sh
   cd Vencord/src/userplugins
   git clone https://github.com/SoonBanned/youtubeEmbedFallback.git youtubeEmbedFallback
   ```

2. Rebuild and inject Vencord:

   ```sh
   pnpm build
   pnpm inject
   ```

3. Fully restart Discord, then enable **YoutubeEmbedFallback** in Settings → Vencord → Plugins.

## Notes

- Desktop only (Discord desktop app or Vesktop). It does not work in the browser version of Vencord.
- The plugin uses native code, so enabling or disabling it requires a full Discord restart.
- It relies on YouTube's page structure, so a YouTube update may break it.

## License

GPL-3.0
