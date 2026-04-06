# Crof-AI-OpenCode

Working reference for using [Crof.ai](https://crof.ai) as a safe [OpenCode](https://opencode.ai/) custom provider.

This repo documents a configuration that was tested against Crof's OpenAI-compatible API and shaped to work well with OpenCode without relying on undocumented behavior.

It also includes a reusable `opencode.json` template with the Crof provider only.

## Quick Start

Most users will want to copy the provider config directly into their own `opencode.json`.

Use this template as-is, then add your Crof API key separately in OpenCode auth storage at `~/.local/share/opencode/auth.json`.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "crof": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "CrofAI",
      "options": {
        "baseURL": "https://crof.ai/v1"
      },
      "models": {
        "moonshotai/kimi-k2.5": {
          "id": "kimi-k2.5",
          "name": "Kimi K2.5",
          "limit": { "context": 262144, "output": 262144 },
          "family": "kimi",
          "attachment": true,
          "reasoning": true,
          "tool_call": true,
          "temperature": true,
          "modalities": { "input": ["text", "image", "video"], "output": ["text"] },
          "interleaved": { "field": "reasoning_details" }
        },
        "moonshotai/kimi-k2.5:lightning": {
          "id": "kimi-k2.5-lightning",
          "name": "Kimi K2.5 (lightning)",
          "limit": { "context": 131072, "output": 32768 }
        },
        "z-ai/glm-5": {
          "id": "glm-5",
          "name": "GLM-5",
          "limit": { "context": 202752, "output": 202752 },
          "family": "glm",
          "attachment": false,
          "reasoning": true,
          "tool_call": true,
          "temperature": true,
          "modalities": { "input": ["text"], "output": ["text"] },
          "interleaved": { "field": "reasoning_content" }
        },
        "z-ai/glm-5:lightning": {
          "id": "glm-5-lightning",
          "name": "GLM-5 (lightning)",
          "limit": { "context": 202752, "output": 202752 }
        },
        "z-ai/glm-4.7": {
          "id": "glm-4.7",
          "name": "GLM-4.7",
          "limit": { "context": 202752, "output": 202752 },
          "family": "glm",
          "attachment": false,
          "reasoning": true,
          "tool_call": true,
          "temperature": true,
          "modalities": { "input": ["text"], "output": ["text"] },
          "interleaved": { "field": "reasoning_details" }
        },
        "z-ai/glm-4.7-flash": {
          "id": "glm-4.7-flash",
          "name": "GLM-4.7-Flash",
          "limit": { "context": 202752, "output": 131072 },
          "family": "glm",
          "attachment": false,
          "reasoning": true,
          "tool_call": true,
          "temperature": true,
          "modalities": { "input": ["text"], "output": ["text"] },
          "interleaved": { "field": "reasoning_details" }
        },
        "google/gemma-4-31b-it": {
          "id": "gemma-4-31b-it",
          "name": "Gemma 4 31B",
          "limit": { "context": 262144, "output": 262144 },
          "family": "gemma",
          "attachment": true,
          "reasoning": true,
          "tool_call": true,
          "temperature": true,
          "modalities": { "input": ["text", "image", "video"], "output": ["text"] }
        },
        "minimax/minimax-m2.5": {
          "id": "minimax-m2.5",
          "name": "MiniMax M2.5",
          "limit": { "context": 204800, "output": 131072 },
          "family": "minimax",
          "attachment": false,
          "reasoning": true,
          "tool_call": true,
          "temperature": true,
          "modalities": { "input": ["text"], "output": ["text"] },
          "interleaved": { "field": "reasoning_details" }
        },
        "qwen/qwen3.5-397b-a17b": {
          "id": "qwen3.5-397b-a17b",
          "name": "Qwen3.5 397B A17B",
          "limit": { "context": 262144, "output": 262144 },
          "family": "qwen",
          "attachment": true,
          "reasoning": true,
          "tool_call": true,
          "temperature": true,
          "modalities": { "input": ["text", "image", "video"], "output": ["text"] }
        },
        "deepseek/deepseek-v3.2": {
          "id": "deepseek-v3.2",
          "name": "DeepSeek V3.2",
          "limit": { "context": 163840, "output": 163840 },
          "family": "deepseek",
          "attachment": false,
          "reasoning": true,
          "tool_call": true,
          "temperature": true,
          "modalities": { "input": ["text"], "output": ["text"] }
        }
      }
    }
  }
}
```

## Goal

The goal of this setup is to give OpenCode users a Crof provider that is:

- compatible with OpenCode's custom provider system
- aligned with OpenRouter-style model naming where possible
- sourced from Crof's own documented model data for token limits
- conservative about metadata so it stays safe and predictable
- cleaned up to exclude models that did not work reliably in OpenCode

## Source Of Truth

This setup was built from two sources:

1. [https://crof.ai/docs](https://crof.ai/docs)
2. `https://models.dev/api.json`

Each source was used for a different purpose.

### Crof Docs

Crof's docs were used as the source of truth for:

- base URL
- OpenAI-compatible API behavior
- supported request parameters
- reasoning support via `reasoning_effort`
- model discovery through `/v1/models`
- token limits through `context_length` and `max_completion_tokens`

From Crof's docs, the provider is configured against:

[https://crof.ai/v1](https://crof.ai/v1)

And model limits are taken from the documented `/v1/models` response shape.

### Models.dev

`models.dev` was used to make the provider feel more natural inside OpenCode.

It was used for:

- canonical OpenRouter-style model keys where exact matches exist
- matching display names to known model naming conventions
- safe manual metadata for exact-match models

That metadata includes:

- `family`
- `attachment`
- `reasoning`
- `tool_call`
- `temperature`
- `modalities`
- `interleaved` when available

This was only applied where there was an exact canonical match. The Lightning variants (Kimi K2.5 Lightning and GLM-5 Lightning) are intentionally downgraded: they keep `tool_call: true` and `temperature: true` but drop `reasoning`, `attachment`, `interleaved`, and multimodal input because they are speed-optimized models that trade off reasoning depth and vision capabilities for faster responses.

## Models API Verification

Crof's `/v1/models` endpoint returns the following fields for each model:

- `id`
- `context_length`
- `max_completion_tokens`
- `pricing`

The `/v1/models` response does **not** include capability metadata like `reasoning`, `tool_call`, `modalities`, or `attachment`. Those fields must be inferred and set manually in the OpenCode config.

All `limit.context` and `limit.output` values in this config were verified against the live `/v1/models` API response. The following table shows the exact match:

| Model | API `context_length` | API `max_completion_tokens` | Config `limit.context` | Config `limit.output` |
|---|---|---|---|---|
| `kimi-k2.5` | 262144 | 262144 | 262144 | 262144 |
| `kimi-k2.5-lightning` | 131072 | 32768 | 131072 | 32768 |
| `glm-5` | 202752 | 202752 | 202752 | 202752 |
| `glm-5-lightning` | 202752 | 202752 | 202752 | 202752 |
| `glm-4.7` | 202752 | 202752 | 202752 | 202752 |
| `glm-4.7-flash` | 202752 | 131072 | 202752 | 131072 |
| `gemma-4-31b-it` | 262144 | 262144 | 262144 | 262144 |
| `minimax-m2.5` | 204800 | 131072 | 204800 | 131072 |
| `qwen3.5-397b-a17b` | 262144 | 262144 | 262144 | 262144 |
| `deepseek-v3.2` | 163840 | 163840 | 163840 | 163840 |

## Lightning Model Limitations

The Lightning variants are speed-optimized models. They differ from their base counterparts in important ways:

- **No reasoning**: Lightning models do not produce extended reasoning output. They are configured with `reasoning: false` and no `interleaved` field.
- **No vision**: Lightning models are text-only. They are configured with `attachment: false` and `modalities.input: ["text"]`.
- **Lower output limits**: Kimi K2.5 Lightning has a much smaller output limit (32768 vs 262144) which can cause truncation on long responses.

If you experience pausing or failed tool calls with Lightning models, switch to the base model (e.g. `moonshotai/kimi-k2.5` instead of `moonshotai/kimi-k2.5:lightning`).

### Why Lightning Models Were Downgraded

The Lightning entries were initially configured with the same `reasoning: true`, `attachment`, `interleaved`, and multimodal settings as their base models. This caused two problems in practice:

1. **Model pausing**: OpenCode expected reasoning output (via `interleaved`) that Lightning models do not produce, causing the stream to hang while waiting for reasoning tokens that never arrive.
2. **Failed tool calls**: Lightning models struggle with complex tool-calling formats. Marking them as `reasoning: true` made OpenCode expect deeper agentic behavior that the speed-optimized models cannot reliably deliver.

The fix was to downgrade Lightning metadata to match reality:

- `reasoning: false` — no extended thinking output
- `attachment: false` — no image or video input
- `interleaved` removed — no reasoning stream field
- `modalities.input: ["text"]` — text-only

This prevents OpenCode from expecting capabilities the Lightning models do not have, eliminating the pausing and reducing tool call failures.

## Why This Is A Safe OpenCode Custom Provider

OpenCode supports custom providers through `provider.<id>` entries in `opencode.json` using `@ai-sdk/openai-compatible`.

For this setup, the provider is:

- provider ID: `crof`
- adapter: `@ai-sdk/openai-compatible`
- base URL: [https://crof.ai/v1](https://crof.ai/v1)

The config uses a conservative approach:

- use Crof as the source of truth for API compatibility and limits
- use `models.dev` only where there is a clear exact match
- use `id` overrides when the Crof backend model name differs from the displayed OpenCode model key
- avoid inventing metadata for Crof-only variants
- remove models that failed in practice with OpenCode

This means the configuration aims to be both practical and low-risk.

## Files Used By OpenCode

Global provider config:

```text
~/.config/opencode/opencode.json
```

Stored provider credentials:

```text
~/.local/share/opencode/auth.json
```

Template included in this repo:

```text
./opencode.json
```

The repo template contains no API key.

## Working Models In This Setup

Exact OpenRouter-style matches:

- `moonshotai/kimi-k2.5` -> `Kimi K2.5`
- `z-ai/glm-5` -> `GLM-5`
- `z-ai/glm-4.7` -> `GLM-4.7`
- `z-ai/glm-4.7-flash` -> `GLM-4.7-Flash`
- `google/gemma-4-31b-it` -> `Gemma 4 31B`
- `minimax/minimax-m2.5` -> `MiniMax M2.5`
- `qwen/qwen3.5-397b-a17b` -> `Qwen3.5 397B A17B`
- `deepseek/deepseek-v3.2` -> `DeepSeek V3.2`

Crof-only variants retained through `id` overrides:

- `moonshotai/kimi-k2.5:lightning` -> `id: kimi-k2.5-lightning`
- `z-ai/glm-5:lightning` -> `id: glm-5-lightning`

Display names are harmonized so the list looks consistent in OpenCode:

- `Kimi K2.5`
- `Kimi K2.5 (lightning)`
- `GLM-5`
- `GLM-5 (lightning)`
- `GLM-4.7`
- `GLM-4.7-Flash`
- `Gemma 4 31B`
- `MiniMax M2.5`
- `Qwen3.5 397B A17B`
- `DeepSeek V3.2`

## Models Removed

These models were intentionally removed from the final config:

- canopy variants: removed because they were not working reliably in OpenCode
- `stok-0.4.1`: removed because it did not work correctly with OpenCode

The repo and template document only the remaining working set.

## Reasoning And Thinking Support

Crof's docs explicitly document support for:

- reasoning model output
- reasoning streaming fields
- `reasoning_effort`

Accepted Crof reasoning effort values:

- `low`
- `medium`
- `high`
- `none`

Important detail:

- `none` disables the reasoning phase entirely
- higher values allow more thinking before the final answer

In this setup, exact-match reasoning-capable models are marked with:

- `reasoning: true`

And models with known reasoning stream field behavior also include `interleaved` where `models.dev` provides it.

Examples:

- `moonshotai/kimi-k2.5` -> `interleaved.field = reasoning_details`
- `z-ai/glm-5` -> `interleaved.field = reasoning_content`
- `z-ai/glm-4.7` -> `interleaved.field = reasoning_details`
- `z-ai/glm-4.7-flash` -> `interleaved.field = reasoning_details`
- `minimax/minimax-m2.5` -> `interleaved.field = reasoning_details`

The Lightning variants (Kimi K2.5 Lightning and GLM-5 Lightning) are intentionally configured with `reasoning: false`, no `interleaved` field, and text-only modalities because they are speed-optimized models.

## Limits

Crof's docs describe `/v1/models` as returning per-model:

- `context_length`
- `max_completion_tokens`

Those values are used directly for:

- `limit.context`
- `limit.output`

At the time this config was verified, the configured limits matched the live Crof `/v1/models` response for the working models.

## Why The `id` Field Matters

OpenCode uses the key in `provider.<provider>.models` as the selected model identifier.

For custom providers, `id` lets you send a different upstream model name to the provider API.

Example:

```json
{
  "moonshotai/kimi-k2.5:lightning": {
    "id": "kimi-k2.5-lightning",
    "name": "Kimi K2.5 (lightning)"
  }
}
```

This keeps the OpenCode-facing key clean and consistent while still sending the Crof backend model ID that actually works.

## What Was Added Manually

For exact-match models, this setup adds safe manual metadata using fields supported by the OpenCode config schema:

- `family`
- `attachment`
- `reasoning`
- `tool_call`
- `temperature`
- `modalities`
- `interleaved`

These values were copied from `models.dev` only when there was an exact model match.

## What Was Not Added

Some things were intentionally not added or not assumed.

- no API keys are stored in this repo
- no default `model` is forced in the template
- no metadata was guessed for Crof-only variants beyond `id`, `name`, and `limit`, except for Lightning variants which are intentionally downgraded to speed-optimized settings (no reasoning, no vision, text-only)
- `structured_output` was not added because it does not appear to be supported on custom provider model entries in the current OpenCode schema

## How To Use This Globally

1. Merge the `provider.crof` block from this repo's `opencode.json` into `~/.config/opencode/opencode.json`.
2. Add a `crof` credential entry to `~/.local/share/opencode/auth.json`.
3. Restart OpenCode or reopen the session.
4. Select a model under the `crof` provider.

Example auth entry:

```json
{
  "crof": {
    "type": "api",
    "key": "YOUR_CROF_API_KEY"
  }
}
```

## How To Use This Per Project

If you want project-level config instead of global config, use this repo's `opencode.json` as your starting point.

You still need a valid `crof` credential in OpenCode auth storage unless you provide credentials some other way.

## Verification Performed

This setup was checked using the following process:

1. Crof docs were reviewed for API behavior, supported parameters, and `/v1/models` response structure.
2. OpenCode provider docs and config schema were reviewed for custom provider support and model field compatibility.
3. The live Crof `/v1/models` endpoint was queried to verify model IDs and limits.
4. A live request to [https://crof.ai/v1/chat/completions](https://crof.ai/v1/chat/completions) succeeded with a working model.
5. Broken models were removed after direct testing in OpenCode.

Example verification request:

```bash
curl -sS \
  -H "Authorization: Bearer YOUR_CROF_API_KEY" \
  -H "Content-Type: application/json" \
  "https://crof.ai/v1/chat/completions" \
  -d '{
    "model": "deepseek-v3.2",
    "messages": [{"role": "user", "content": "Reply with exactly: ok"}],
    "max_tokens": 8,
    "temperature": 0
  }'
```

## Security

- this repo contains no real API key
- credentials belong in `~/.local/share/opencode/auth.json`, not in the repo
- the included `opencode.json` template is safe to share

## Included File

- `opencode.json`: Crof-only OpenCode custom provider template
