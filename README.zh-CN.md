# Cindy Plugins(个人插件市场)

<p align="center">
  <a href="README.md">English</a> · <strong>简体中文</strong>
</p>

这是 [mutsuki14](https://github.com/mutsuki14) 的个人 [Cindy](https://github.com/makecindy/cindy) 插件市场仓库,结构对齐官方市场 [makecindy/cindy-official-plugins](https://github.com/makecindy/cindy-official-plugins)。

- **给 Cindy 用**:每个一级目录是一个插件(ghost)源码包,含 `ghost.json` 身份卡、`main.js` 入口、
  `assets/`、`locales/` 等;根目录 `provisioning.json` 是市场内插件总表。
- **分发方式**:用 Cindy 对话里的 `ghost_forge_pack` 把某个插件目录打包成 `.cindy` 文件即可装入,
  或直接分享 `.cindy` 给他人。

## 插件一览

|  | 插件 | 目录 | 说明 |
| --- | --- | --- | --- |
| <img src="./aegis/assets/icon.png" width="22" alt=""> | Aegis Method Pack | [`aegis`](./aegis) | 把 Aegis 工程方法包打包成一个 Agent 技能:基线先行的计划、系统化调试、先拿证据再说完成、计划/设计压测、ADR、长任务治理。装入后 Claude Code 与 Codex 自动发现 |

想看的插件不在表里?[提 issue](../../issues/new) 许愿。

## 仓库约定

```
aegis/
├── ghost.json      # 身份卡:插件 id、版本、能力槽、权限与隐私说明
├── main.js         # 入口:沙箱后台逻辑(skill-only 插件可为空导出)
├── assets/         # 图标等静态资源
├── locales/        # 本地化(name / description / whenToUse)
└── skills/         # 随包 Agent 技能(含 SKILL.md)
```

- 每个插件目录名 = `ghost.json` 里的 `id`;
- 根目录 `provisioning.json` 登记市场内所有插件及可见范围(audience);
- 发布新版本时必须 bump `ghost.json.version`(SemVer);
- 本地校验:打包前用 Cindy 的 `ghost_forge_pack` 走一遍 manifest 校验。

## 如何开发新插件

1. 在 Cindy 里对 Agent 说「帮我做一个 XX 插件」,用 `ghost_forge_scaffold` 生成骨架;
2. 在本仓库新建以插件 id 命名的目录,放入源码;
3. 用 `ghost_forge_pack` 打包试装,通过后提交;
4. 在 `provisioning.json` 的 `ghosts` 中登记新插件。

## License

本仓库以 [Apache License 2.0](./LICENSE) 发布。
