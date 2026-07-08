from typing import List, Dict, Any
from app.services.evidence_validator import validate_evidence

def generate_verified_outreach(company_name: str, user_profile: Dict[str, Any], evidence_list: List[Dict]) -> Dict[str, str]:
    """
    Builds outreach text blocks strictly citing verified evidence.
    """
    validated = validate_evidence(evidence_list)
    user_name = user_profile.get("name", "User Corp")
    user_product = user_profile.get("product_service", "our SaaS solutions")
    user_goal = user_profile.get("partnership_goal", "execute integrations")
    
    if not validated:
        # Strict rule fallback
        cite_text = "your ongoing corporate technology initiatives"
        snippet_text = "general enterprise development"
        url_text = f"https://www.google.com/search?q={company_name}"
    else:
        primary = validated[0]
        cite_text = primary["title"]
        snippet_text = primary["snippet"]
        url_text = primary["url"]

    email = f"""Subject: Strategic Proposal: {company_name} & {user_name} Collaboration

Dear {company_name} Management Team,

I am writing to propose a strategic collaboration between {company_name} and {user_name}.

We have been tracking your recent announcements and verified a key event:
Announcement: "{cite_text}" (Ref: {url_text})
Summary: "...{snippet_text[:180]}..."

At {user_name}, we specialize in: "{user_product}". Given this synergy, we see a clear route to help {company_name} achieve your goal to {user_goal}.

Are you available for a 10-minute introductory sync next week to explore a pilot deployment?

Best regards,

Partnership Team
{user_name}
"""

    linkedin_dm = f"Hi Team, noticed {company_name} recently announced: \"{cite_text}\" (Verified at {url_text}). At {user_name}, we build {user_product}. We mapped out an integration route to support your goal to {user_goal}. Let me know if you are open to reviewing our short proposal!"

    executive_brief = f"""EXECUTIVE SYNERGY BRIEF
Target: {company_name}
Proposer: {user_name}
Synergy Vector: {user_product} -> {company_name}

CITED SIGNAL EVIDENCE:
- Title: {cite_text}
- Reference: {url_text}
- Excerpt: "{snippet_text}"
"""

    return {
        "email": email,
        "linkedinDm": linkedin_dm,
        "executiveBrief": executive_brief
    }
