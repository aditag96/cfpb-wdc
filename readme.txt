# README.md: CFPB Complaints Tableau WDC

Automates streaming CFPB Consumer Complaints into Tableau via a Web Data Connector (WDC).

---

## Prerequisites & Verification

1. **Git installed** on your machine.  
   - **Check:** Run `git --version`. You should see `git version X.Y.Z`.
2. **GitHub account**.  
   - **Check:** Log in at https://github.com and confirm you see your profile.
3. **Local project folder** containing these files:  
   - `index.html`  
   - `connector.js`  
   - `README.md`  
   - **Check:** In your terminal, run `ls` (or `dir`) to ensure these files are present.

---

## 1. Create GitHub Repository

1. Go to **GitHub → Your profile → Repositories → New**.  
2. **Repository name:** `cfpb-wdc` (or your chosen name).  
3. **Visibility:** Public.  
4. **Skip:** Do not initialize with README/license/gitignore (you will push your own).  
5. Click **Create repository**.

> **Verify:** You see a blank repo with “Quick setup” instructions.

---

## 2. Clone & Add Files Locally

Open your terminal and run:

```bash
# Clone the repo
git clone git@github.com:<your-user>/cfpb-wdc.git
cd cfpb-wdc

# Copy your files in
cp /path/to/index.html .
cp /path/to/connector.js .
cp /path/to/README.md .
```

> **Verify:** `ls` outputs:
> ```
> index.html  connector.js  README.md
> ```

---

## 3. Commit & Push to GitHub

```bash
git add index.html connector.js README.md
git commit -m "Add WDC code and README"
git push -u origin main
```

> **Verify on GitHub:** Files appear in the repo root.

---

## 4. Enable GitHub Pages

1. In your repo, click **Settings → Pages**.  
2. Under **Source**, select:  
   - **Branch:** `main`  
   - **Folder:** `/ (root)`  
3. Click **Save**.  
4. Wait ~1 minute for deployment.

> **Verify:** Visit `https://<your-user>.github.io/cfpb-wdc/index.html` and see the WDC form.

---

## 5. Connect in Tableau Desktop

1. Open **Tableau Desktop**.  
2. **Data → New Data Source → Web Data Connector**.  
3. Enter: `https://<your-user>.github.io/cfpb-wdc/index.html`  
4. Input a **Start Date** (e.g. `2024-01-01`) and **End Date** (e.g. `2024-01-31`).  
5. Click **Get Data**.

> **Verify:** Data preview shows CFPB complaint fields and sample rows.

---

## 6. (Optional) Publish & Schedule on Tableau Server

1. Build your dashboard off this WDC data source.  
2. **Server → Publish Workbook**, enable **Refresh on Schedule**.  
3. Configure frequency (daily/hourly).

> **Verify:** Trigger a manual refresh on Server and confirm data updates.
