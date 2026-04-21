from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import re
import urllib.parse
import os

app = Flask(__name__)
CORS(app)

# Database Configuration
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'scans.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Database Model
class ScanHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    scan_type = db.Column(db.String(20), nullable=False) # 'URL' or 'EMAIL'
    target = db.Column(db.String(500), nullable=False)
    risk_label = db.Column(db.String(20), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

def init_db():
    with app.app_context():
        db.create_all()

# --- Real Logic for URLs ---
def analyze_url(url):
    score = 0
    reasons = []
    
    # 1. NO HTTPS
    if not url.startswith('https://'):
        score += 25
        reasons.append("URL does not use HTTPS.")
        
    # 2. Contains an IP address
    if re.search(r'(?:\d{1,3}\.){3}\d{1,3}', url):
        score += 40
        reasons.append("URL contains an IP address.")
        
    # 3. Suspicious keywords
    keywords = ["free", "money", "win", "urgent", "verify", "login", "bank", "secure", "update"]
    url_lower = url.lower()
    found_keywords = [kw for kw in keywords if kw in url_lower]
    if found_keywords:
        score += 30
        reasons.append(f"URL contains suspicious keywords: {', '.join(found_keywords)}.")

    # 4. Suspicious domain extensions
    parsed = urllib.parse.urlparse(url if '://' in url else 'http://' + url)
    domain = parsed.netloc.split(':')[0].lower()
    suspicious_extensions = [".xyz", ".tk", ".ru", ".ml"]
    found_extensions = [ext for ext in suspicious_extensions if domain.endswith(ext)]
    if found_extensions:
        score += 25
        reasons.append(f"URL has suspicious domain extensions: {', '.join(found_extensions)}.")
        
    # 5. More than 3 dots (many subdomains)
    if domain.count('.') > 3:
        score += 15
        reasons.append("URL has more than 3 dots (many subdomains).")
        
    # 6. Special characters '@' or '-'
    if '@' in url or '-' in url:
        score += 10
        reasons.append("URL contains special characters ('@' or '-').")
        
    # 7. Length > 75
    if len(url) > 75:
        score += 10
        reasons.append("URL length exceeds 75 characters.")
        
    score = min(score, 100)
    
    if score <= 30:
        label = "SAFE"
        if not reasons:
            reasons.append("No suspicious indicators found.")
    elif score <= 70:
        label = "SUSPICIOUS"
    else:
        label = "DANGEROUS"
        
    return score, label, reasons

# --- Mock ML Logic for Emails ---
def analyze_email(sender, subject, body):
    score = 0
    reasons = []
    
    text_to_search = f"{subject} {body}".lower()
    sender_lower = sender.lower()
    
    # 1. Urgency words
    urgency_words = ["urgent", "immediately", "now", "asap"]
    found_urgency = [w for w in urgency_words if w in text_to_search]
    if found_urgency:
        score += 30
        reasons.append(f"Email contains urgency keywords: {', '.join(found_urgency)}.")
        
    # 2. Phishing keywords
    phishing_keywords = ["verify", "login", "account", "password", "bank"]
    found_phishing = [w for w in phishing_keywords if w in text_to_search]
    if found_phishing:
        score += 25
        reasons.append(f"Email contains suspicious keywords: {', '.join(found_phishing)}.")
        
    # 3. Suspicious actions
    action_words = ["click", "link", "update", "confirm"]
    found_actions = [w for w in action_words if w in text_to_search]
    if found_actions:
        score += 20
        reasons.append(f"Email prompts suspicious actions: {', '.join(found_actions)}.")
        
    # 4. Fake domain detection
    fake_domains = ["paypa1", "amaz0n", "g00gle", "m1crosoft"]
    found_fake = [fd for fd in fake_domains if fd in sender_lower]
    if found_fake:
        score += 40
        reasons.append("Sender domain contains numbers replacing letters (e.g., paypa1, amaz0n).")
        
    # 5. Free email domains
    free_domains = ["gmail.com", "yahoo.com", "outlook.com"]
    if any(domain in sender_lower for domain in free_domains):
        score += 15
        reasons.append("Sender uses a free email domain, which is less trusted.")
        
    # 6. Mismatch between sender and brand
    brands = ["paypal", "amazon"]
    for brand in brands:
        if brand in text_to_search and f"{brand}.com" not in sender_lower:
            score += 30
            reasons.append(f"Email claims to be {brand.capitalize()} but sender domain is not official.")
            break
            
    # Normalize score
    score = min(score, 100)
    
    if score <= 30:
        label = "SAFE"
        if not reasons:
            reasons.append("Email text appears normal.")
    elif score <= 70:
        label = "SUSPICIOUS"
    else:
        label = "DANGEROUS"
        
    return score, label, reasons

# --- API Endpoints ---
@app.route('/api/scan-url', methods=['POST'])
def scan_url():
    data = request.json
    url = data.get('url', '')
    
    if not url:
        return jsonify({"error": "URL is required"}), 400
        
    score, label, reasons = analyze_url(url)
    
    # Save to history
    new_scan = ScanHistory(scan_type="URL", target=url, risk_label=label, score=score)
    db.session.add(new_scan)
    db.session.commit()
    
    return jsonify({
        "target": url,
        "score": score,
        "label": label,
        "reasons": reasons
    })

@app.route('/api/scan-email', methods=['POST'])
def scan_email():
    data = request.get_json()
    sender = data.get('sender', '')
    subject = data.get('subject', '')
    body = data.get('body', '')
    
    if not sender and not body:
        return jsonify({"error": "Sender or body is required"}), 400
        
    score, label, reasons = analyze_email(sender, subject, body)
    
    # Save to history
    target = sender if sender else subject[:50]
    new_scan = ScanHistory(scan_type="EMAIL", target=target, risk_label=label, score=score)
    db.session.add(new_scan)
    db.session.commit()
    
    return jsonify({
        "score": score,
        "label": label,
        "reasons": reasons
    })

@app.route('/api/history', methods=['GET'])
def get_history():
    limit = request.args.get('limit', 50, type=int)
    scans = ScanHistory.query.order_by(ScanHistory.timestamp.desc()).limit(limit).all()
    
    history_list = []
    for s in scans:
        history_list.append({
            "id": s.id,
            "type": s.scan_type,
            "target": s.target,
            "risk": s.risk_label,
            "score": s.score,
            "datetime": s.timestamp.isoformat() + "Z"
        })
        
    return jsonify(history_list)
    
@app.route('/api/stats', methods=['GET'])
def get_stats():
    total = ScanHistory.query.count()
    safe = ScanHistory.query.filter_by(risk_label="SAFE").count()
    suspicious = ScanHistory.query.filter_by(risk_label="SUSPICIOUS").count()
    dangerous = ScanHistory.query.filter_by(risk_label="DANGEROUS").count()
    
    return jsonify({
        "total": total,
        "safe": safe,
        "suspicious": suspicious,
        "dangerous": dangerous
    })

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)
