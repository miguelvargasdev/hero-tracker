# Releasing

The in-app version (main menu footer, crown menu) is driven by
`package.json`'s `version` field, injected at build time via Vite
`define` (`__APP_VERSION__`). Bumping `package.json` and rebuilding is
all it takes for the UI to update — no hardcoded strings anywhere.

## TL;DR

From a clean `master` that's up to date with `hero-tracker/master`:

```bash
pnpm release:patch    # 1.0.0 → 1.0.1   bug fixes only
pnpm release:minor    # 1.0.0 → 1.1.0   new feature, backward compatible
pnpm release:major    # 1.0.0 → 2.0.0   breaking change
```

Each script runs `pnpm version <bump>` (which bumps `package.json`,
commits, and creates an annotated `vX.Y.Z` tag) and then
`git push --follow-tags` to push the commit and tag together.

## When to bump which

| Bump  | Trigger                                                   | Examples                                           |
| ----- | --------------------------------------------------------- | -------------------------------------------------- |
| patch | Bug fixes, copy tweaks, perf, style-only changes          | Fix a HP-drain bug; tweak spacing                  |
| minor | New feature, new hero, new stat, new game mode            | Add Misc subtracker; hold-to-repeat; boss scaling  |
| major | Breaking persisted-state change or removed gameplay       | Drop a stat from `Hero`; restructure store schema  |

**Note:** The Zustand store has its own `version` field
(`src/store/useHeroStore.ts`) used by the persist middleware. Bump it
(and add a `migrate` branch) whenever the shape of `Hero` or related
stored data changes, independently of the app version above —
otherwise installed PWAs will throw "State loaded from storage
couldn't be migrated" on users' devices on upgrade.

## Preconditions

`pnpm version` will refuse to bump if:

- The working tree is dirty (uncommitted changes). Commit or stash first.
- You're not on a tracked branch. Be on `master` with
  `hero-tracker/master` as upstream.

If the push step fails because of missing upstream, run it manually:

```bash
git push --follow-tags hero-tracker master
```

## Creating a GitHub Release

After the tag lands on the remote, optionally create a Release with
auto-generated notes from merged PR titles:

```bash
gh release create v1.1.0 --generate-notes
```

This is optional — the tag itself is enough for Git history and any
future deployment tooling that keys off tags.

## Manual fallback

If you'd rather not use the scripts, the equivalent manual flow is:

```bash
git checkout master && git pull hero-tracker master
pnpm version minor        # or patch / major
git push --follow-tags hero-tracker master
```
