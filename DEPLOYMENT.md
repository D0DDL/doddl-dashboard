# doddl Project Management - Deployment Guide

## 🚀 Quick Deploy to Vercel + Supabase

### Step 1: Set Up Supabase (5 minutes)

1. Go to https://supabase.com
2. Click "Start your project"
3. Create new organization (or use existing)
4. Create new project:
   - Name: doddl-pm
   - Database Password: (save this securely)
   - Region: Choose closest to you
5. Wait for project to provision (~2 minutes)

6. Run the database schema:
   - Click "SQL Editor" in left sidebar
   - Click "New query"
   - Copy entire contents of `supabase-schema.sql`
   - Paste and click "Run"
   - ✅ You should see "Success. No rows returned"

7. Get your API credentials:
   - Click "Settings" (gear icon in sidebar)
   - Click "API"
   - Copy these two values:
     * Project URL → This is your `NEXT_PUBLIC_SUPABASE_URL`
     * `anon` `public` key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 2: Deploy to Vercel (3 minutes)

**Option A: Deploy from GitHub (Recommended)**

1. Push this code to your GitHub repo:
   ```bash
   cd doddl-pm-app
   git init
   git add .
   git commit -m "Initial commit: doddl PM app"
   git remote add origin https://github.com/D0DDL/doddl-dashboard.git
   git push -u origin main
   ```

2. Go to https://vercel.com
3. Click "Add New" → "Project"
4. Import your GitHub repo: `D0DDL/doddl-dashboard`
5. Configure:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (leave as is)
   - Click "Environment Variables"
   - Add these:
     * `NEXT_PUBLIC_SUPABASE_URL` = (paste from Supabase)
     * `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (paste from Supabase)
6. Click "Deploy"
7. Wait ~2 minutes for deployment
8. ✅ Your app is live! Copy the URL (e.g., `https://doddl-dashboard.vercel.app`)

**Option B: Deploy via Vercel CLI**

```bash
npm install -g vercel
cd doddl-pm-app
vercel login
vercel
# Follow prompts, add environment variables when asked
```

### Step 3: Update Power Automate Flows (10 minutes)

You need to update your 3 existing flows to send tasks to your new API:

#### Flow 1: Flagged Email Flow
1. Open Power Automate
2. Find your "Flagged Email to Notion" flow
3. Add new action after "When email is flagged":
   - Action: "HTTP"
   - Method: POST
   - URI: `https://your-vercel-url.vercel.app/api/tasks`
   - Headers:
     ```
     Content-Type: application/json
     ```
   - Body:
     ```json
     {
       "task": "@{triggerBody()?['subject']}",
       "project": "",
       "taskGroup": "",
       "status": "⬜ To Do",
       "priority": "⚡ Medium",
       "owner": "Jon Fawcett",
       "dueDate": "@{addDays(utcNow(), 2)}",
       "dependencies": "",
       "notes": "@{triggerBody()?['body']}",
       "source": "Email"
     }
     ```
4. Save and test

#### Flow 2: Teams Message Flow
1. Open your "Teams to Notion" flow
2. Add HTTP action:
   - Method: POST
   - URI: `https://your-vercel-url.vercel.app/api/tasks`
   - Body:
     ```json
     {
       "task": "@{triggerBody()?['messageText']}",
       "project": "",
       "taskGroup": "",
       "status": "⬜ To Do",
       "priority": "⚡ Medium",
       "owner": "Jon Fawcett",
       "dueDate": "@{addDays(utcNow(), 2)}",
       "notes": "From: @{triggerBody()?['from']?['displayName']}",
       "source": "Teams"
     }
     ```
3. Save and test

#### Flow 3: TeamsMAestro Flow
1. Open your "TeamsMAestro to Notion" flow
2. Add HTTP action:
   - Method: POST
   - URI: `https://your-vercel-url.vercel.app/api/tasks`
   - Body:
     ```json
     {
       "task": "@{triggerBody()?['summary']}",
       "project": "@{triggerBody()?['project']}",
       "taskGroup": "",
       "status": "⬜ To Do",
       "priority": "⚡ Medium",
       "owner": "Jon Fawcett",
       "dueDate": "@{addDays(utcNow(), 2)}",
       "notes": "@{triggerBody()?['notes']}",
       "source": "TeamsMAestro"
     }
     ```
3. **BONUS**: Parse subtasks from notes field and create separate tasks:
   - Add "Parse JSON" action
   - Add "Apply to each" loop for subtasks
   - Create HTTP POST for each subtask

4. Save and test

### Step 4: Test Everything (5 minutes)

1. **Manual test:**
   - Open `https://your-vercel-url.vercel.app`
   - Create a project
   - Create a task
   - Drag task between columns
   - ✅ Should work smoothly

2. **Email test:**
   - Flag an email
   - Wait 1 minute
   - Check doddl PM app
   - ✅ Task should appear with "Email" badge

3. **Teams test:**
   - Send flagged Teams message
   - Check doddl PM app
   - ✅ Task should appear with "Teams" badge

4. **TeamsMAestro test:**
   - Create meeting with action items
   - Check doddl PM app
   - ✅ Tasks should appear with "TeamsMAestro" badge

### Step 5: Share with Your Team

1. Copy your Vercel URL: `https://doddl-dashboard.vercel.app`
2. Share with team
3. Everyone opens the URL
4. Everyone sees the same data in real-time!

## 🔧 Future Updates

When you need changes:
1. Tell Claude what you want changed
2. Claude updates the code
3. You push to GitHub:
   ```bash
   git add .
   git commit -m "Update from Claude"
   git push
   ```
4. Vercel auto-deploys in 2 minutes
5. Done!

## 🆘 Troubleshooting

**Tasks not appearing?**
- Check browser console (F12) for errors
- Verify Supabase URL and keys in Vercel environment variables
- Check Supabase logs: Settings → Database → Logs

**Power Automate flow failing?**
- Check flow run history
- Verify API URL is correct
- Test API endpoint with Postman/curl

**Need help?**
- Ask Claude!
- Check Vercel logs: Project → Deployments → Click deployment → Logs
- Check Supabase logs: Settings → Database → Logs

## 📊 API Endpoints

**Base URL:** `https://your-vercel-url.vercel.app`

**Tasks:**
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks` - Update task
- `DELETE /api/tasks?id=<task_id>` - Delete task

**Projects:**
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project

**Power Automate Webhook:**
Use `POST /api/tasks` with JSON body as shown in Step 3.

---

**Total setup time: ~25 minutes**
**Monthly cost: $0** (Supabase free tier + Vercel free tier)

You now have your own doddl PM tool! 🎉
