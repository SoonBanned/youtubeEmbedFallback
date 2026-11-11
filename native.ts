/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { RendererSettings } from "@main/settings";
import { app, session } from "electron";
import adguard from "file://../../plugins/youtubeAdblock.desktop/adguard.js?minify";
import swap from "file://swap.js?minify";

const EMBED_URL_RE = /^https:\/\/www\.youtube(?:-nocookie)?\.com\/embed\//;
const WATCH_URL_RE = /^https:\/\/www\.youtube\.com\/watch\?/;

const isEnabled = () => !!RendererSettings.store.plugins?.YoutubeEmbedFallback?.enabled;

// The watch page forbids being framed. Allow it only when it is loaded inside a YouTube embed, which is what swap.js does.
// Vencord blocks further onHeadersReceived listeners after registering its own, so wrap listeners as they get registered.
// This runs before Vencord's initCsp because plugin natives are imported before the main entry point registers its ready callback.
app.whenReady().then(() => {
    const { webRequest } = session.defaultSession;
    const onHeadersReceived = webRequest.onHeadersReceived.bind(webRequest) as (...args: any[]) => void;

    webRequest.onHeadersReceived = (...args: any[]) => {
        const listener = args.pop();
        if (typeof listener !== "function") return onHeadersReceived(...args, listener);

        onHeadersReceived(...args, (details: Electron.OnHeadersReceivedListenerDetails, callback: (response: Electron.HeadersReceivedResponse) => void) => {
            listener(details, (response: Electron.HeadersReceivedResponse) => {
                try {
                    const headers = response.responseHeaders;
                    if (
                        headers &&
                        details.resourceType === "subFrame" &&
                        WATCH_URL_RE.test(details.url) &&
                        EMBED_URL_RE.test(details.frame?.parent?.url ?? "") &&
                        isEnabled()
                    ) {
                        for (const name of Object.keys(headers)) {
                            if (name.toLowerCase() === "x-frame-options") delete headers[name];
                        }
                    }
                } catch { }

                callback(response);
            });
        });
    };
});

app.on("browser-window-created", (_, win) => {
    win.webContents.on("frame-created", (_, { frame }) => {
        frame?.on("dom-ready", () => {
            if (!isEnabled()) return;

            if (EMBED_URL_RE.test(frame.url)) {
                frame.executeJavaScript(swap);
            } else if (WATCH_URL_RE.test(frame.url) && EMBED_URL_RE.test(frame.parent?.url ?? "")) {
                // YoutubeAdblock only covers embed frames, so cover our nested watch page for it
                if (RendererSettings.store.plugins?.YoutubeAdblock?.enabled)
                    frame.executeJavaScript(adguard);
            }
        });
    });
});
