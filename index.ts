/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import definePlugin from "@utils/types";

export default definePlugin({
    name: "YoutubeEmbedFallback",
    description: "Plays YouTube videos that are blocked from embedding (\"playback on other websites has been disabled\") directly inside the Discord embed",
    tags: ["Media", "Utility"],
    authors: [{ name: "SoonBanned", id: 0n }]
});
