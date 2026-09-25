# Claude Code Cloud Sessions + Base44: Comp Day Setup

AI with All No-Code Hackathon. Goal: use the one-time $250 cloud session credit by running Claude Code on Anthropic's servers, synced to the event Base44 app through GitHub.

**How it works:** Base44 app ⇄ GitHub repo (two-way sync) ⇄ Claude Code cloud sessions. Claude works on the repo, you merge to `main`, Base44 picks up the changes, you click Publish.

**Backup plan:** if anything here fails, switch to the local setup in `base44-claude-code-comp-day.md` (runs on your Max plan instead of the credit).

---

## Part 1: Night Before (at home, about 20 minutes)

### Permissions and accounts
- [ ] **Ask the organizers:** "Can we connect our event Base44 app to our own GitHub account for two-way sync, and are outside AI tools like Claude Code allowed?" Get a yes in writing. The sync cannot be paused or undone on that app.
- [ ] **Claim the credit.** In Git Bash:
  ```
  claude
  ```
  Then run:
  ```
  /claim-credit
  ```
  (Claim deadline is October 7.)
- [ ] **Link GitHub to Claude.** Cloud sessions require it. Follow the prompt the first time you open claude.ai/code, and install the Claude GitHub app when asked.
- [ ] **Check paid overflow is OFF:** Claude Settings > Usage > make sure "usage credits" is disabled, so running out of the free credit falls back to your plan instead of charging your card.

### Practice run (important)
- [ ] Start a cloud session on your `mysite` repo (claude.ai/code, or the Code tab in the desktop or phone app).
- [ ] Give it a harmless task:
  ```
  Review auth.py and suggest improvements. Do not edit any files.
  ```
- [ ] Then a tiny edit task, to practice the full loop:
  ```
  Add a comment at the top of README.txt describing the project. Open a pull request.
  ```
- [ ] On GitHub, open the pull request, read the diff, and **close it without merging** (it was just practice). Delete the branch.
- [ ] You now know how to: start a session, watch it work, read its PR, and merge or close.

### Prep
- [ ] Laptop charged, charger packed, phone charged (you can monitor sessions from the Claude app).
- [ ] GitHub app installed on your phone (for reviewing PRs away from the laptop).

---

## Part 2: At the Event, Setup (about 10 minutes)

### Step 1: Create the app
1. Log in to Base44 with the **event account**.
2. Create the app, ideally from the civic starter template matching your challenge category.
3. Make one or two prompts in Base44's builder to get the basic app shape in place.

### Step 2: Connect GitHub sync
1. In the app dashboard, click the **GitHub icon**.
2. Authorize Base44 with **your** GitHub account.
3. Link a **new** repository (for example `ai-with-all-2026`). Do NOT reuse `mysite`.
4. Wait for the first sync, then check the repo on GitHub has the app's files.

### Step 3: Start the first cloud session
1. Open claude.ai/code (or the desktop Code tab).
2. Select the new hackathon repo.
3. Switch the model to Opus for the planning session.
4. First prompt:
   ```
   This is a Base44 app synced from GitHub. Read the project and explain its structure:
   pages, data entities, backend functions, and where each feature lives.
   Do not edit anything yet.
   ```

### Step 4: Plan the build
With your team's paper plan, ask:
```
Here is our app plan: [paste plan]. Break it into independent features that can be
built in parallel on separate branches without touching the same files.
Keep Base44's existing file structure. Do not refactor.
```
Use the breakdown to decide which features get their own session.

---

## Part 3: Building with Parallel Sessions

### Rules for every session
Start each session with:
```
Work on a new branch for this feature only. Make targeted changes and keep Base44's
existing file structure. Do not refactor or rename files. When done, open a pull
request. If two approaches fail, stop and summarize instead of continuing.
```

### Running sessions
- **One feature = one session = one branch.** Example: session A builds the sign-up flow, session B builds the dashboard, session C builds the volunteer map.
- **Use Sonnet for building sessions** (switch model at session start). Save Opus for planning and stuck bugs.
- **Keep features in separate files** to avoid merge conflicts.
- **Monitor from your phone** while teammates use the laptop for the pitch or testing.

### The merge loop
1. Session finishes and opens a PR.
2. On GitHub, **read the diff** (Files changed tab). Check nothing unexpected was deleted or renamed.
3. **Merge into `main`.**
4. Wait for Base44 to sync (check the app's code or preview updates).
5. Click **Publish** in Base44.
6. **Test the published app** right away. Cloud sessions cannot see the live Base44 preview, so you are the tester.

### Keeping sync clean
- **Merge PRs promptly.** Old branches drift out of date and conflict.
- **Do not edit the same page in Base44's builder while a session works on it.** Both commit to the repo and will conflict.
- **If a teammate uses the Base44 builder**, tell active sessions to pull the latest `main` before continuing:
  ```
  Pull the latest main and rebase your branch before making more changes.
  ```
- **Only `main` syncs to Base44.** Unmerged branches do nothing in the app.

---

## Part 4: Timeline Suggestion (7 hours)

| Time | Activity |
|---|---|
| 0:00 to 0:30 | Pick problem, paper plan, create app from template |
| 0:30 to 0:45 | Connect GitHub sync, first Opus planning session |
| 0:45 to 4:30 | Parallel Sonnet sessions, merge loop, test after each merge |
| 4:30 to 5:30 | Polish, fix bugs, one feature at a time (no more parallel) |
| 5:30 | **Feature freeze.** Only bug fixes from here |
| 5:30 to 6:30 | Final testing, publish, practice demo |
| 6:30 to 7:00 | Buffer and presentation |

---

## Part 5: Troubleshooting

| Problem | Fix |
|---|---|
| Can't connect GitHub in Base44 | Confirm the event workspace is Builder tier. If blocked, switch to the local setup guide. |
| Repo does not appear in claude.ai/code | Grant the Claude GitHub app access to the new repo (GitHub Settings > Applications > Claude > Configure). |
| Merged but Base44 did not update | Confirm you merged into `main`, wait a minute, refresh Base44. Then click Publish. |
| PR has merge conflicts | Ask the session: "Resolve the merge conflicts with main, keeping both changes." Or close the PR and rerun the feature on a fresh branch. |
| Visual editor broke after a merge | Revert the merge on GitHub (the PR page has a Revert button), merge the revert, then retry with smaller changes. |
| Session going in circles | Stop it, start a fresh session with a clearer prompt and the exact error. |
| Credit running out | Sessions fall back to your Max plan automatically (if paid overflow is off). Switch builders to Sonnet. |
| Everything is broken with 1 hour left | Revert to the last working merge on GitHub, publish, and demo that version. |

---

## Part 6: After the Event (do not skip)

- [ ] Stop any cloud sessions still running.
- [ ] Decide what to do with the repo: keep it as a portfolio piece (make sure it contains no event credentials), or archive it.
- [ ] Remove the Claude GitHub app's access to the hackathon repo if you no longer need it (GitHub Settings > Applications > Claude > Configure).
- [ ] Log out of the event Base44 account.
- [ ] Leftover credit can still be used on `mysite` cloud sessions before it expires.
