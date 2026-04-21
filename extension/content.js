console.log("Content script loaded");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message received in content.js:", message);

    if (message.action === "SHOW_WARNING") {
        const data = message.result;

        if (data.label === "DANGEROUS") {
            alert(`🚨 DANGEROUS SITE!\nScore: ${data.score}`);
        } else if (data.label === "SUSPICIOUS") {
            alert(`⚠️ Suspicious site\nScore: ${data.score}`);
        }
    }
    
    return true; // Keep message channel open
});
