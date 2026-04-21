console.log("Background script running");

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
        console.log("PhishGuard Auto-Scan triggered for URL:", tab.url);
        
        // Call backend API
        fetch('http://127.0.0.1:5000/api/scan-url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: tab.url })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log("Backend response:", data);
            if (data.label === 'DANGEROUS' || data.label === 'SUSPICIOUS') {
                // Send result to content script
                chrome.tabs.sendMessage(tabId, {
                    action: "SHOW_WARNING",
                    result: data
                }).catch(err => console.log("Content script connection error:", err));
            }
        })
        .catch(err => console.error("PhishGuard fetch error:", err));
    }
});
