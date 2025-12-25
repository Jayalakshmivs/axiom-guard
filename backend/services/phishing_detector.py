"""
Phishing Detection Service
Multi-layer URL analysis for detecting phishing threats
"""

import re
from typing import Dict, List, Any
from urllib.parse import urlparse
import hashlib

try:
    import tldextract
    import validators
    VALIDATORS_AVAILABLE = True
except ImportError:
    VALIDATORS_AVAILABLE = False

from utils.logger import setup_logger

logger = setup_logger()


class PhishingDetector:
    """
    Multi-layer phishing detection system
    
    Detection Layers:
    1. Domain/TLD analysis
    2. URL structure analysis
    3. Keyword detection
    4. Brand impersonation check
    5. SSL/Protocol check
    6. Known blacklist check
    """
    
    def __init__(self):
        # Known dangerous TLDs
        self.dangerous_tlds = [
            '.xyz', '.tk', '.ml', '.ga', '.cf', '.gq', '.top', 
            '.click', '.loan', '.work', '.racing', '.download',
            '.win', '.bid', '.stream', '.trade', '.date', '.faith'
        ]
        
        # Known brand domains
        self.known_brands = {
            'paypal': ['paypal.com', 'paypal.me'],
            'amazon': ['amazon.com', 'amazon.co.uk', 'amazon.de', 'amazon.in'],
            'google': ['google.com', 'google.co.uk', 'google.de', 'gmail.com'],
            'microsoft': ['microsoft.com', 'outlook.com', 'live.com', 'office.com'],
            'apple': ['apple.com', 'icloud.com'],
            'facebook': ['facebook.com', 'fb.com', 'messenger.com'],
            'netflix': ['netflix.com'],
            'instagram': ['instagram.com'],
            'twitter': ['twitter.com', 'x.com'],
            'linkedin': ['linkedin.com'],
            'bank': ['chase.com', 'wellsfargo.com', 'bankofamerica.com']
        }
        
        # Phishing keywords
        self.phishing_keywords = [
            'login', 'signin', 'verify', 'account', 'secure', 'update',
            'confirm', 'banking', 'password', 'authenticate', 'validation',
            'suspended', 'locked', 'unusual', 'activity', 'credential'
        ]
        
        # Suspicious keywords
        self.suspicious_keywords = [
            'free', 'win', 'winner', 'prize', 'urgent', 'click', 'limited',
            'offer', 'deal', 'gift', 'reward', 'bonus', 'congratulations'
        ]
        
        # Dangerous keywords
        self.danger_keywords = [
            'phishing', 'scam', 'fake', 'hack', 'malware', 'virus',
            'trojan', 'ransomware', 'keylogger', 'spyware'
        ]
    
    async def analyze(self, url: str) -> Dict[str, Any]:
        """
        Analyze URL for phishing threats
        
        Args:
            url: URL to analyze
            
        Returns:
            Analysis result with threat level and details
        """
        # Normalize URL
        if not url.startswith(('http://', 'https://')):
            url = f'https://{url}'
        
        risk_score = 0.0
        findings: List[str] = []
        
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            path = parsed.path.lower()
            full_url = url.lower()
        except Exception as e:
            return {
                "status": "warning",
                "confidence": 50,
                "details": f"Could not parse URL: {e}",
                "findings": ["Invalid URL format"]
            }
        
        # Layer 1: TLD Analysis (20% weight)
        tld_result = self._analyze_tld(domain)
        risk_score += tld_result["score"] * 0.20
        if tld_result["score"] > 0.5:
            findings.append(tld_result["finding"])
        
        # Layer 2: Keyword Analysis (25% weight)
        keyword_result = self._analyze_keywords(full_url)
        risk_score += keyword_result["score"] * 0.25
        if keyword_result["finding"]:
            findings.append(keyword_result["finding"])
        
        # Layer 3: Brand Impersonation (25% weight)
        brand_result = self._check_brand_impersonation(domain, full_url)
        risk_score += brand_result["score"] * 0.25
        if brand_result["finding"]:
            findings.append(brand_result["finding"])
        
        # Layer 4: URL Structure (15% weight)
        structure_result = self._analyze_url_structure(url, domain)
        risk_score += structure_result["score"] * 0.15
        findings.extend(structure_result["findings"])
        
        # Layer 5: Protocol Check (10% weight)
        protocol_result = self._check_protocol(url)
        risk_score += protocol_result["score"] * 0.10
        if protocol_result["finding"]:
            findings.append(protocol_result["finding"])
        
        # Layer 6: Known Patterns (5% weight)
        pattern_result = self._check_known_patterns(full_url)
        risk_score += pattern_result["score"] * 0.05
        if pattern_result["finding"]:
            findings.append(pattern_result["finding"])
        
        # Determine result
        return self._determine_result(risk_score, findings, url)
    
    def _analyze_tld(self, domain: str) -> Dict[str, Any]:
        """Analyze top-level domain for risk"""
        for tld in self.dangerous_tlds:
            if domain.endswith(tld):
                return {
                    "score": 0.7,
                    "finding": f"High-risk TLD detected: {tld}"
                }
        
        return {"score": 0.0, "finding": None}
    
    def _analyze_keywords(self, url: str) -> Dict[str, Any]:
        """Analyze URL for suspicious keywords"""
        # Check for dangerous keywords first
        for keyword in self.danger_keywords:
            if keyword in url:
                return {
                    "score": 1.0,
                    "finding": f"Known malicious keyword detected: '{keyword}'"
                }
        
        # Check for multiple phishing keywords
        phishing_found = [k for k in self.phishing_keywords if k in url]
        if len(phishing_found) >= 2:
            return {
                "score": 0.7,
                "finding": f"Multiple credential-related keywords: {', '.join(phishing_found)}"
            }
        elif len(phishing_found) == 1:
            return {
                "score": 0.3,
                "finding": f"Credential keyword detected: '{phishing_found[0]}'"
            }
        
        # Check suspicious keywords
        suspicious_found = [k for k in self.suspicious_keywords if k in url]
        if suspicious_found:
            return {
                "score": 0.4,
                "finding": f"Suspicious promotional keywords: {', '.join(suspicious_found[:3])}"
            }
        
        return {"score": 0.0, "finding": None}
    
    def _check_brand_impersonation(self, domain: str, url: str) -> Dict[str, Any]:
        """Check for brand impersonation"""
        for brand, official_domains in self.known_brands.items():
            # Check if brand name appears in URL
            if brand in url:
                # Check if it's NOT an official domain
                is_official = any(d in domain for d in official_domains)
                if not is_official:
                    return {
                        "score": 0.85,
                        "finding": f"Potential {brand.upper()} impersonation - not an official domain"
                    }
        
        return {"score": 0.0, "finding": None}
    
    def _analyze_url_structure(self, url: str, domain: str) -> Dict[str, Any]:
        """Analyze URL structure for suspicious patterns"""
        findings = []
        score = 0.0
        
        # Check for IP address
        ip_pattern = r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}'
        if re.search(ip_pattern, domain):
            score += 0.6
            findings.append("Direct IP address used instead of domain")
        
        # Check for excessive subdomains
        subdomain_count = domain.count('.')
        if subdomain_count > 4:
            score += 0.4
            findings.append(f"Excessive subdomains ({subdomain_count} levels)")
        
        # Check for encoded characters
        if '%' in url and ('%2F' in url or '%3A' in url or '%40' in url):
            score += 0.5
            findings.append("Suspicious URL encoding detected")
        
        # Check for excessive length
        if len(url) > 150:
            score += 0.2
            findings.append("Unusually long URL")
        
        # Check for @ symbol (often used in phishing)
        if '@' in url:
            score += 0.6
            findings.append("@ symbol in URL (potential credential trick)")
        
        # Check for double slashes
        if '//' in url[10:]:  # After protocol
            score += 0.3
            findings.append("Unusual double slashes in path")
        
        return {"score": min(score, 1.0), "findings": findings}
    
    def _check_protocol(self, url: str) -> Dict[str, Any]:
        """Check URL protocol"""
        if url.startswith('http://'):
            return {
                "score": 0.5,
                "finding": "No SSL/TLS encryption (HTTP only) - connection not secure"
            }
        
        return {"score": 0.0, "finding": None}
    
    def _check_known_patterns(self, url: str) -> Dict[str, Any]:
        """Check for known phishing URL patterns"""
        patterns = [
            (r'\.com-[a-z]+\.', "Suspicious .com-* domain pattern"),
            (r'-secure-', "Fake 'secure' pattern in URL"),
            (r'[0-9]{5,}', "Long number sequence in URL"),
            (r'(login|signin)\.(php|html|asp)', "Direct login page file"),
        ]
        
        for pattern, description in patterns:
            if re.search(pattern, url):
                return {
                    "score": 0.6,
                    "finding": description
                }
        
        return {"score": 0.0, "finding": None}
    
    def _determine_result(self, score: float, findings: List[str], url: str) -> Dict[str, Any]:
        """Determine final result based on risk score"""
        if score >= 0.5:
            status = "danger"
            threat_type = "Confirmed Phishing" if score >= 0.7 else "Suspected Phishing"
            confidence = min(98, 70 + score * 30)
            details = f"HIGH RISK: {'. '.join(findings[:3])}. Do NOT enter personal information."
        elif score >= 0.2:
            status = "warning"
            threat_type = "Potential Threat"
            confidence = 50 + score * 50
            details = f"CAUTION: {'. '.join(findings[:3])}. Verify authenticity before proceeding."
        else:
            status = "safe"
            threat_type = None
            confidence = 90 + (1 - score) * 8
            details = "No threats detected. URL passes security checks and appears legitimate."
            findings = ["Valid domain structure", "No suspicious patterns detected"]
        
        return {
            "status": status,
            "confidence": confidence,
            "details": details,
            "threat_type": threat_type,
            "findings": findings
        }
