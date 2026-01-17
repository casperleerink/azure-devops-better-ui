import type { AdoApi } from "../../preload";

declare global {
  interface Window {
    ado: AdoApi;
  }
}
