# Cindy Plugins (Personal Marketplace)

<p align="center">
  <strong>English</strong> · <a href="README.zh-CN.md">简体中文</a>
</p>

Personal [Cindy](https://github.com/makecindy/cindy) plugin marketplace maintained by
[mutsuki14](https://github.com/mutsuki14), structured after the official marketplace
[makecindy/cindy-official-plugins](https://github.com/makecindy/cindy-official-plugins).

- **For Cindy**: each top-level directory is one plugin (ghost) source package with a
  `ghost.json` manifest, `main.js` entry, `assets/`, `locales/`, etc. The root
  `provisioning.json` is the marketplace-wide plugin registry.
- **Distribution**: pack any plugin directory into a `.cindy` file with Cindy's
  `ghost_forge_pack` and install or share it.

## Plugins

|  | Plugin | Directory | Description |
| --- | --- | --- | --- |
| <img src="./aegis/assets/icon.png" width="22" alt=""> | Aegis Method Pack | [`aegis`](./aegis) | Bundles the Aegis engineering method pack as one Agent skill: baseline-first planning, systematic debugging, evidence-before-done verification, plan/design pressure-tests, ADRs, and long-task governance. After install, Claude Code and Codex discover it automatically |
| <img src="./helix/assets/icon.png" width="22" alt=""> | Helix Method Loop | [`helix`](./helix) | Zero-config engineering method loop fusing Aegis (baseline-first, evidence-before-done discipline) with Ouroboros (clarify → seed → build → verify → evolve). Quantitative ambiguity/drift gates via the bundled `helix_gate` tool; manuals load on demand via `ghost_manual` |

Missing a plugin you want? [Open an issue](../../issues/new).

## Repository conventions

- Each plugin directory name equals the `id` in its `ghost.json`;
- `.agents/plugins/marketplace.json` is the market manifest Cindy looks for when adding a custom marketplace (`name` + `plugins[]` with relative `source` paths) — register every new plugin there;
- `provisioning.json` registers every plugin in this marketplace and its audience;
- Bump `ghost.json.version` (SemVer) on every release;
- Validate locally by running Cindy's `ghost_forge_pack` before committing.

## License

Released under the [Apache License 2.0](./LICENSE).
