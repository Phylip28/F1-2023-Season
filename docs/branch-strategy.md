# Workflow 

In this document it's defined standards and conventions regarding the branch strategy, commits and pull request process used in this repository.

## Branch Strategy

This repository follows the `Trunk-Based` Strategy.

**General rules:**

- The `trunk` branch is protected: Direct commits are not allowed.
- Lifecycle of the branches is short: Branches are not alive for more than one day, and should be deleted after being merged. 

## Branch Conventions

All branches are created from `trunk` and should follow the format:

| Prefix | Exclusive Use | Example |
| :--- | :--- | :--- |
| `feat/` | New features or improvements for Backend or Frontend. | `feat/car-info`, `feat/ui-dashboard` |
| `fix/` | Fix issues or bugs. | `fix/car-info-parameter`, `fix/null-pointer-id` |
| `infra/` | Docker, CI/CD, DevContainers, AWS. | `infra/add-dockerfile`, `infra/ci-cd-pipeline` |
| `docs/` | All related to documentation. | `docs/api-contract`, `docs/update-readme` |
| `refactor/` | Improvements to code that do not change the functionality of the feature. | `refactor/optimize-imports` |
| `chore/` | Issues or maintenance tasks that not affect the code. | `chore/update-dependencies`, `chore/clean-scripts` |

**Format Rules:**

- All must be written in lowercase.
- Use hyphens (`-`) to separate words.
- Special characters, spaces and accents are not allowed.

## Commits Conventions

The commits should follow the `Conventional Commits` specification for ease of reading of the history.

**Structure:**
`type(scope): short description`

* **type:** It's the same as the branch prefix (`feat`, `fix`, `infra`, `docs`, `refactor`, `chore`).
* **(scope):** Optional. This one indicates the modified module. (`back`, `front`, `data`, `shared`, `deps`, `infra`).
* **description:** Imperative, clear and concise.

**Examples:**
* `feat(back): add car info endpoint`
* `infra(CI): add workflow for automatic tests`
* `fix(front): fix position of navbar`
* `docs: update contribution guides`
* `chore(infra): update gitignore to exclude csv files`

## Pull Request Process

1. Create a PR from your branch to `trunk`.
2. Add a descriptive title and description to your changes.
3. If the CI pipeline approves your changes, you can merge your PR with `trunk`.

> **Note:** If the PR does not follow the conventions, the PR will be denied since it would need to be modified.