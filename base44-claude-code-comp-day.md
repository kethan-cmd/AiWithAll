# Claude Code + Base44: Comp Day Setup

AI with All No-Code Hackathon. The event provides Builder tier Base44 workspace accounts for the duration of the contest.

---

## Part 1: Night Before (at home, about 10 minutes)

- [ ] **Confirm with organizers** that outside AI tools like Claude Code are allowed under the judging rules.
- [ ] **Disconnect your personal Base44 connector** in the Claude desktop app:
  Settings > Connectors > Base44 > Disconnect (may be behind the three-dot menu).
- [ ] **Register the Base44 server in Claude Code** (one time, works in every folder). In Git Bash:
  ```
  claude mcp add --transport http base44 https://app.base44.com/mcp --scope user
  ```
- [ ] **Confirm it registered:**
  ```
  claude mcp list
  ```
  `base44` should appear in the list.
- [ ] **Make sure it is NOT logged in to your personal account.** Start `claude`, run `/mcp`, pick `base44`. If it shows as authenticated, choose **Clear authentication**. Exit with `/exit`.
- [ ] **Create the event folder** (keeps hackathon work separate from `mysite`):
  ```
  mkdir ~/projects/hackathon
  ```
- [ ] **Log out of Base44 in your browser** (or plan to use a private/incognito window), so the event sign-in does not auto-pick your personal account.
- [ ] **Laptop ready:** charged, charger packed, Claude desktop app and Git Bash both open without errors.

---

## Part 2: At the Event (about 5 minutes)

### Step 1: Log in to the event account
1. Get your event workspace login from the organizers.
2. In the browser, log in to Base44 with the **event account** (not your personal one).
3. Pick one of the 6 civic starter templates that matches your challenge category, or create a new app. Starting from a template saves a lot of prompts.

### Step 2: Start Claude Code in the event folder
In Git Bash:
```
cd ~/projects/hackathon
claude
```

### Step 3: Authenticate Base44 with the event account
1. Run `/mcp`
2. Pick **base44**, then **Authenticate**.
3. A browser window opens. Sign in with the **event account**.
4. On the consent screen:
   - Choose the **event workspace**
   - **Approve sandbox access** (without this, Claude can read the app but cannot edit it)

### Step 4: Link Claude Code to your app
1. In Base44, open your app.
2. Click **More actions** (three dots next to Publish).
3. Click **Send to Coding Agent**, choose a local agent.
4. Copy the prompt it gives you and paste it into Claude Code.

### Step 5: Safety first
First message to Claude after linking:
```
Create a checkpoint of the app before making any changes.
```
Repeat before every big change. Base44 changes go live in the preview immediately, and there is no Git undo.

---

## Part 3: Working Tips During the Build

- **Plan on paper first (30 min):** the problem, who uses the app, the screens, and what data it stores. One clear, detailed prompt beats five vague ones.
- **Use plan mode for big features:** have Claude describe the plan, check it, then let it build.
- **Checkpoint before risky changes**, then test in the live preview right after.
- **Keep the team involved:** rotate who types prompts, have others test the app and build the pitch. Judges score the idea and presentation, not just the code.
- **Small, targeted edits** are safer than big refactors, which can break Base44's visual editor.
- **Freeze features about 45 minutes before judging.** Use the last stretch for testing, fixing, and practicing the demo.
- **Click Publish** in Base44 when you want changes to be live.

---

## Part 4: Troubleshooting

| Problem | Fix |
|---|---|
| `PREMIUM_REQUIRED` error | Wrong account or workspace. `/mcp` > base44 > **Clear authentication**, then Authenticate again with the event account and event workspace. |
| Browser auto-logs into personal account | Log out of Base44 first, or use a private window, then redo Step 3. |
| Claude can read but not edit the app | Sandbox access was not approved. Clear authentication and re-authenticate, approving sandbox access. |
| `base44` missing from `/mcp` | Re-run the `claude mcp add` command from Part 1. |
| Claude edits the wrong app | Redo Step 4 (Send to Coding Agent) from inside the correct app. |
| Change broke the app | Ask Claude to restore the last checkpoint. |
| Claude Code stuck or confused | `/clear`, then paste the Send to Coding Agent prompt again. |

---

## Part 5: After the Event (do not skip)

- [ ] In Claude Code: `/mcp` > base44 > **Clear authentication**
- [ ] If you connected the Base44 connector in the Claude desktop app with the event account: Settings > Connectors > Base44 > **Disconnect**
- [ ] Log out of the event account in your browser
- [ ] Optional: reconnect your personal Base44 account if you want it back
