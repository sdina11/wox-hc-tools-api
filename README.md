# Healthcare Tools API for Render

This folder contains a standalone HTTP API wrapper for the four healthcare tools in the parent repository. Deploy it as a **Render Web Service**, then import `openapi.yaml` into IBM watsonx Orchestrate.

## Included endpoints

| Orchestrate tool name | Method and path |
| --- | --- |
| `is_provider_authorized` | `POST /api/is_provider_authorized` |
| `get_member_profile` | `POST /api/get_member_profile` |
| `has_met_deductible` | `POST /api/has_met_deductible` |
| `get_policy` | `POST /api/get_policy` |

A health endpoint is also available at `GET /health`.

## Deploy with Render

1. Create a new GitHub repository, for example `healthcare-tools-api`.
2. Upload or commit the **contents of this `render-tools-api` folder** to the root of that new repository:
   - `package.json`
   - `index.js`
   - `openapi.yaml`
   - `README.md`
3. In Render, select **New +** → **Web Service**.
4. Connect GitHub, authorize access if prompted, and select the new repository.
5. Use these settings:
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free (suitable for a demo; it can sleep when idle)
6. Click **Create Web Service** and wait for the deployment to complete.
7. Copy the public service address. It has this form:

   ```text
   https://your-service-name.onrender.com
   ```

8. Open this address in a browser with `/health` appended:

   ```text
   https://your-service-name.onrender.com/health
   ```

   The expected response is:

   ```json
   { "status": "ok" }
   ```

## Import the tools into watsonx Orchestrate

1. Open `openapi.yaml`.
2. Replace this placeholder exactly once:

   ```text
   https://REPLACE_WITH_YOUR_RENDER_SERVICE.onrender.com
   ```

   with the Render service base URL, for example:

   ```text
   https://healthcare-tools-api.onrender.com
   ```

3. In watsonx Orchestrate, go to **Tools** → **Add a tool** → **OpenAPI**.
4. Upload the edited `openapi.yaml`.
5. Complete the import. The API operations should appear with these names:
   - `is_provider_authorized`
   - `get_member_profile`
   - `has_met_deductible`
   - `get_policy`

## Test API requests

Use any API client. Each request must have header:

```text
Content-Type: application/json
```

### Authorize a provider

```json
POST /api/is_provider_authorized

{
  "provider_id": "R12345678",
  "npi_number": "1234567890"
}
```

### Get member profile

```json
POST /api/get_member_profile

{
  "member_id": "12345678",
  "member_DOB": "1987-06-03"
}
```

`member_DOB` must be formatted as `YYYY-MM-DD`.

### Check deductible

```json
POST /api/has_met_deductible

{
  "paid_towards_deductible": 800,
  "member_personal_deductible": 1500
}
```

### Get policy

```json
POST /api/get_policy

{
  "policy_name": "2025 Gold PPO insurance policy"
}
```

## Connect imported tools to agents

In watsonx Orchestrate, configure these mappings:

| Agent | Tools / collaborators |
| --- | --- |
| `hc_auth_agent` | Tool: `is_provider_authorized` |
| `hc_policy_agent` | Tool: `get_policy` |
| `hc_member_agent` | Tools: `get_member_profile`, `has_met_deductible`; collaborator: `hc_policy_agent` |
| `hc_provider_supervisor_agent` | Collaborators: `hc_auth_agent`, `hc_policy_agent`, `hc_member_agent` |

Use the instructions found in the corresponding YAML files in the parent repository when creating the agents through the Orchestrate browser UI.

## Demo-only warning

The authorization endpoint intentionally always returns `authorized: true`, matching the existing demo Python function. Do not use this implementation with real provider, member, claims, or health information.
