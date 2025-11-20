/// <reference lib="webworker" />
/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

import { clientsClaim } from 'workbox-core'
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'

declare let self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<import('workbox-build').ManifestEntry>
}

self.skipWaiting()
clientsClaim()

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// Keep the single-page shell available offline.
registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: 'app-shell',
    }),
  ),
)
