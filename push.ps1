$repo = "https://github.com/Ritikka004/PhishGuard-AI-Threat-Detection.git"

if (!(Test-Path ".git")) {
    git init
}

git add .

$changes = git status --porcelain
if ($changes) {
    git commit -m "Auto commit $(Get-Date)"
} else {
    Write-Host "No changes to commit"
}

git branch -M main

git remote remove origin 2>$null
git remote add origin $repo

try {
    git push -u origin main
} catch {
    git pull origin main --rebase
    git push -u origin main
}

Write-Host "Push completed 🚀"