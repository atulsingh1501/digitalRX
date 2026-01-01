Set-Location 'd:\My Projects\DOCTOR-APP-master'

Write-Host "=== Commit Squasher (Orphan Branch Method) ===" -ForegroundColor Cyan
Write-Host "Reading commit history..." -ForegroundColor Yellow

# Get all commits oldest-first
$raw = git log --format="%H|||%s|||%ai|||%an|||%ae"
$allLines = [System.Collections.ArrayList]::new()
foreach ($c in $raw) { if ($c.Trim()) { [void]$allLines.Add($c.Trim()) } }
$allLines.Reverse()
$total = $allLines.Count
Write-Host "Total commits: $total" -ForegroundColor Yellow

$data = @()
foreach ($line in $allLines) {
    $p = $line -split '\|\|\|', 5
    $data += [PSCustomObject]@{
        Hash    = $p[0].Trim()
        Subject = $p[1].Trim()
        Date    = $p[2].Trim()
        Name    = if ($p.Count -gt 3) { $p[3].Trim() } else { 'Developer' }
        Email   = if ($p.Count -gt 4) { $p[4].Trim() } else { 'dev@example.com' }
    }
}

# Keep every 4th commit to get ~133 commits
$step = 4
$keepIdx = [System.Collections.Generic.List[int]]::new()
for ($i = 0; $i -lt $total; $i += $step) { $keepIdx.Add($i) }
if ($keepIdx[$keepIdx.Count-1] -ne $total-1) { $keepIdx.Add($total-1) }
Write-Host "Will create $($keepIdx.Count) commits" -ForegroundColor Green

# === CREATE ORPHAN BRANCH ===
Write-Host ""
Write-Host "Creating orphan branch 'new-history'..." -ForegroundColor Cyan
git checkout --orphan new-history 2>&1 | Out-Null
git rm -rf . 2>&1 | Out-Null  # Clear working tree
Write-Host "Orphan branch ready (empty)" -ForegroundColor Green

Write-Host ""
Write-Host "Building new commit history..." -ForegroundColor Cyan
Write-Host "This may take 3-10 minutes for $($keepIdx.Count) commits..." -ForegroundColor Yellow
Write-Host ""

$errors = 0
$startTime = Get-Date

for ($ki = 0; $ki -lt $keepIdx.Count; $ki++) {
    $idx = $keepIdx[$ki]
    $commit = $data[$idx]
    
    if ($ki % 25 -eq 0 -or $ki -eq $keepIdx.Count - 1) {
        $elapsed = (Get-Date) - $startTime
        Write-Host "  [$ki/$($keepIdx.Count)] $('{0:mm}:{0:ss}' -f $elapsed) - $($commit.Subject.Substring(0,[math]::Min(50,$commit.Subject.Length)))" -ForegroundColor DarkCyan
    }
    
    # Checkout the files from this commit into working tree
    git checkout $commit.Hash -- . 2>&1 | Out-Null
    
    # Stage everything
    git add -A 2>&1 | Out-Null
    
    # Set author/committer info
    $env:GIT_AUTHOR_DATE = $commit.Date
    $env:GIT_COMMITTER_DATE = $commit.Date
    $env:GIT_AUTHOR_NAME = $commit.Name
    $env:GIT_AUTHOR_EMAIL = $commit.Email
    $env:GIT_COMMITTER_NAME = $commit.Name
    $env:GIT_COMMITTER_EMAIL = $commit.Email
    
    $msg = $commit.Subject
    if ($msg -eq '') { $msg = "Update $ki" }
    
    # Commit (--allow-empty in case no changes between kept commits)
    $result = git commit -m "$msg" --allow-empty 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "    WARN commit failed at [$ki]: $result" -ForegroundColor DarkYellow
        $errors++
    }
}

# Clean up env vars
$env:GIT_AUTHOR_DATE = $null
$env:GIT_COMMITTER_DATE = $null
$env:GIT_AUTHOR_NAME = $null
$env:GIT_AUTHOR_EMAIL = $null
$env:GIT_COMMITTER_NAME = $null
$env:GIT_COMMITTER_EMAIL = $null

Write-Host ""
$finalCount = (git log --oneline 2>&1 | Measure-Object -Line).Lines
$elapsed = (Get-Date) - $startTime
Write-Host "=== HISTORY BUILT ===" -ForegroundColor Green
Write-Host "New commit count: $finalCount (was: $total)" -ForegroundColor Cyan
Write-Host "Time taken: $('{0:mm}:{0:ss}' -f $elapsed)" -ForegroundColor Gray
Write-Host "Errors: $errors" -ForegroundColor $(if ($errors -gt 0) { 'Red' } else { 'Green' })

Write-Host ""
Write-Host "NEXT STEPS - Run these commands:" -ForegroundColor Yellow
Write-Host "1. git branch -D main" -ForegroundColor White
Write-Host "2. git branch -m new-history main" -ForegroundColor White
Write-Host "3. git push origin main --force" -ForegroundColor White
