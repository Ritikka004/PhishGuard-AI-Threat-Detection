document.addEventListener('DOMContentLoaded', async () => {
    const urlBox = document.getElementById('current-url');
    const scanBtn = document.getElementById('scan-btn');
    const loadingDiv = document.getElementById('loading');
    const resultContainer = document.getElementById('result-container');
    const errorContainer = document.getElementById('error-container');
    const badge = document.getElementById('risk-badge');
    const scoreSpan = document.getElementById('risk-score');
    const reasonsList = document.getElementById('reasons-list');
    const errorText = document.getElementById('error-text');

    // Get current active tab
    let currentUrl = '';
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url) {
            currentUrl = tab.url;
            urlBox.textContent = currentUrl;
        } else {
            urlBox.textContent = "Unable to get URL from tab.";
            scanBtn.disabled = true;
        }
    } catch (e) {
        urlBox.textContent = "Error accessing chrome tabs API.";
        scanBtn.disabled = true;
    }

    scanBtn.addEventListener('click', async () => {
        if (!currentUrl) return;

        // Show loading, hide others
        errorContainer.classList.add('hidden');
        resultContainer.classList.add('hidden');
        scanBtn.classList.add('hidden');
        loadingDiv.classList.remove('hidden');

        try {
            const res = await fetch('http://127.0.0.1:5000/api/scan-url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: currentUrl })
            });

            if (!res.ok) {
                throw new Error("Server responded with code " + res.status);
            }

            const data = await res.json();
            
            // Artificial delay to let the animation show briefly
            setTimeout(() => {
                displayResult(data);
            }, 600);

        } catch (error) {
            loadingDiv.classList.add('hidden');
            scanBtn.classList.remove('hidden');
            errorContainer.classList.remove('hidden');
            errorText.textContent = "Failed to connect to PhishGuard backend. (" + error.message + ")";
        }
    });

    function displayResult(data) {
        loadingDiv.classList.add('hidden');
        resultContainer.classList.remove('hidden');
        scanBtn.classList.remove('hidden');
        scanBtn.textContent = 'Scan Again';

        // Set Label
        badge.textContent = data.label || "UNKNOWN";
        badge.className = 'risk-badge'; 
        if (data.label === 'SAFE') badge.classList.add('safe');
        else if (data.label === 'SUSPICIOUS') badge.classList.add('suspicious');
        else if (data.label === 'DANGEROUS') badge.classList.add('dangerous');
        else badge.classList.add('safe');

        // Set Score
        scoreSpan.textContent = data.score !== undefined ? data.score : "-";

        // Set Reasons
        reasonsList.innerHTML = '';
        if (data.reasons && data.reasons.length > 0) {
            data.reasons.forEach(reason => {
                const li = document.createElement('li');
                li.textContent = reason;
                reasonsList.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = "No specific phishing indicators detected.";
            reasonsList.appendChild(li);
        }
    }
});
