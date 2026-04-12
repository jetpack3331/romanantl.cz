export function getSiteBaseUrl(): string {
  return (
    import.meta.env.PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://romanantl.cz"
  );
}
