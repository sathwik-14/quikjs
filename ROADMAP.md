# Roadmap: Next Release (v2.1.0+)

**Completed:**

- [x] Complete Database Support (High Priority)
  - [x] Implement `model` and `controller` generation logic in `plugins/mongoose/index.js`.
  - [x] Wire Mongoose into the `scaffold` function in `generate.js`.
  - [x] Integrate Mongoose with `schemaPrompts` in `prompt.js`.
  - [x] Add Mongoose support to `constants.js`.
  - [x] Ensure `app.js` template connects to MongoDB.

**Pending:**

## Phase 2: Developer Experience (Medium Priority)

- **Goal:** Make generated projects easier to run and deploy.
- **Tasks:**
  - [ ] **Docker:** Add a `docker` option in the CLI to generate a basic `Dockerfile` and `docker-compose.yml` (especially useful since you support Postgres and now MongoDB).
  - [ ] **Linting:** Ask the user if they want ESLint/Prettier and generate the config files (`.eslintrc`, `.prettierrc`) in the target project.

## Phase 3: Testing Foundations (Low Priority for v2.1)

- **Goal:** Encourage testing.
- **Tasks:**
  - [ ] **Tests:** When generating a controller, also generate a basic test file `tests/{model}.test.js` using `supertest` and `jest`.
  - [ ] **CI/CD:** Basic GitHub Actions workflow generation.

## Future Considerations

- **TypeORM Support:** Flesh out the existing placeholder or officially postpone.
- **TypeScript Support:** A major undertaking to support TS generation.
