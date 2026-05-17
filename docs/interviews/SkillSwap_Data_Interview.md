# SkillSwap Interview Data Sheet

Structured data collected from 10 interview participants. Used as the basis for persona development and trust/fairness model design.

---

## Participant Overview

| # | Name | Age | Occupation |
|---|---|---|---|
| 1 | Alex | 21 | College Student |
| 2 | Maria | 28 | Freelance Graphic Designer |
| 3 | Daniel | 35 | IT Support Specialist |
| 4 | Jasmine | 19 | First-Year Student |
| 5 | Kevin | 42 | Small Business Owner |
| 6 | Lina | 24 | Photographer |
| 7 | Marcus | 31 | Gym Trainer |
| 8 | Emily | 22 | College Student |
| 9 | Robert | 58 | Retired Electrician |
| 10 | Linda | 61 | Part-Time Librarian |

---

## Skills Offered & Requested

| Name | Skills Offered | Skills Requested |
|---|---|---|
| Alex | Resume formatting/wording, Calc study help | Logos, Social media posts, Photography, Website help |
| Maria | Logos, Social media posts, Photography, Website help | Branding advice, Portfolio |
| Daniel | Computer repair, Wi-Fi issues, Home repairs | Homework help, Sharing notes |
| Jasmine | Homework help, Sharing notes | Bookkeeping help, Consulting |
| Kevin | Bookkeeping help, Consulting | Marketing advice, Website design |
| Lina | Photoshoots | Makeup services, Styling, Social media promotion |
| Marcus | Gym training | Meal prep, Car detailing |
| Emily | Marketing advice, Social media promotion | Resume formatting/wording, Calc study help |
| Robert | Verification support | Home repairs |
| Linda | Verified profiles, Clear descriptions, Support | General help |

---

## Trust Aspects by Participant

| Name | Trust Signals That Matter Most |
|---|---|
| Alex | Proof they know what they're doing; past work; reviews |
| Maria | Portfolio; communication |
| Daniel | Verification; school/work email; reviews |
| Jasmine | Reviews; student status |
| Kevin | Reputation; track record |
| Lina | Work quality; communication; professionalism |
| Marcus | Consistency; communicates; follows through |
| Emily | Ratings and reviews; examples of work |
| Robert | Verification; reviews; local |
| Linda | Verified profiles; clear descriptions; support availability |

---

## Fairness Aspects by Participant

| Name | What Makes a Trade Feel Fair |
|---|---|
| Alex | Effort; balanced; not getting the worst end |
| Maria | Time; effort; balanced |
| Daniel | Expectations set upfront; agreement |
| Jasmine | Guidance; suggestions from the system |
| Kevin | Clear agreements; defined expectations |
| Lina | Worth it; not always exactly equal |
| Marcus | Both people walk away happy; not perfectly equal |
| Emily | System suggests fair trades |
| Robert | Clear upfront; effort; mutual agreement |
| Linda | Understanding expectations; clear mutual agreement |

---

## Graph Node Reference (for Trust Exchange visualization)

### Participants
| Node ID | Type | Name | Age | Occupation |
|---|---|---|---|---|
| 1 | Participant | Alex | 21 | College Student |
| 2 | Participant | Maria | 28 | Freelance Graphic Designer |
| 3 | Participant | Daniel | 35 | IT Support Specialist |
| 4 | Participant | Jasmine | 19 | First-Year Student |
| 5 | Participant | Kevin | 42 | Small Business Owner |
| 6 | Participant | Lina | 24 | Photographer |
| 7 | Participant | Marcus | 31 | Gym Trainer |
| 8 | Participant | Emily | 22 | College Student |
| 9 | Participant | Robert | 58 | Retired Electrician |
| 10 | Participant | Linda | 61 | Part-Time Librarian |

### Trust Node Connections
| Trust Node | Connected Participants |
|---|---|
| Reviews | Alex, Daniel, Emily, Jasmine, Robert |
| Portfolio | Maria |
| Communication | Maria, Lina, Linda |
| Verification | Daniel, Robert |
| Reputation | Kevin |
| Track Record | Kevin |
| Consistency | Marcus |
| Follows Through | Marcus |
| Examples of Work | Emily |
| Verified Profiles | Linda |
| Clear Descriptions | Linda |
| Support | Linda |
| Local | Robert |

### Fairness Node Connections
| Fairness Node | Connected Participants |
|---|---|
| Effort | Alex, Maria, Robert |
| Balanced | Alex, Maria |
| Agreement | Daniel, Kevin, Robert |
| Expectations | Daniel, Kevin, Linda |
| Guidance | Jasmine |
| Worth It | Lina |
| Happy | Marcus |
| System Suggests Fair Trades | Emily |
| Clear Upfront | Robert |
| Understanding Expectations | Linda |

---

*Data collected May 2026 — COGS 128 SkillSwap Project, UC Merced*
