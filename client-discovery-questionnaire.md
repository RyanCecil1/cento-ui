# SMS Platform Discovery Questions

Use this as the message or form we send the client today. It is based on the RAVEX intake and design-brief structure, but trimmed to the questions that will unblock wireframes, branding direction, scope, and technical planning fastest.

## Suggested intro to send

Hi [Client Name], to help us move into wireframes and planning quickly, please reply to the questions below as clearly as you can. Short bullet answers are perfectly fine. If anything is not decided yet, just say `TBD`.

## Priority 1: Must-answer today

These are the answers we need first so we can start sitemap and wireframes.

1. What is the name of the SMS platform, and should it have its own brand name separate from your cleaning company?
2. Is this SMS platform a new product under the same company, or a separate business entirely?
3. Can we use the same branding direction as [Calyx Cleaning](https://calyxcleaning.com), or do you want a different look for this platform?
4. If we should use similar branding, what exactly should carry over: logo style, colours, fonts, tone, imagery, or all of them?
5. Who are the main users of this platform in the first version: churches, schools, SMEs, political teams, internal company teams, or a mix?
6. Which country or countries will the platform serve first?
7. What is the main promise of the product in one sentence? Example: `Send bulk SMS easily, track delivery, and manage credits in one place.`
8. What are the top 3 actions you want a logged-in user to do most often?
9. What are the top 3 actions you want a first-time website visitor to do most often?
10. What pages do you already know the public website must have? Example: Home, Features, Pricing, Contact, Login.
11. What sections must the homepage include? Example: hero, features, pricing, industries served, testimonials, FAQ, CTA.
12. What dashboard sections must exist in version one? Example: Dashboard, Campaigns, Contacts, Wallet, Reports, AI Writer, Sender IDs, Settings.
13. What is the exact first-version scope? Please mark each item as `Must have`, `Nice to have`, or `Later`.
Items to classify:
- User signup/login
- Contact upload
- Contact groups
- Bulk SMS send now
- Scheduled SMS
- Wallet / credits
- Payment top-up
- Campaign history
- Delivery reports
- Sender ID requests
- AI message generation
- Team members / sub-users
- Admin dashboard

## Priority 2: Product workflow and wireframe questions

14. What should the ideal first-time user journey be after signup?
15. Should users be forced to buy credits before sending, or can they explore the dashboard first?
16. When creating a campaign, do you want a step-by-step wizard, or one page with everything visible?
17. Should users be able to upload contacts only from CSV/Excel, or also paste numbers manually and add contacts one by one?
18. What contact fields should we support in version one? Example: first name, last name, phone, group, company.
19. Should the system automatically clean and standardize Ghana phone numbers?
20. Do users need reusable contact groups, tags, or both?
21. Should campaigns support personalization like `{first_name}` in version one?
22. Should users be able to preview cost before sending? If yes, what exactly should be shown: recipients, SMS units, total cost, remaining balance?
23. Should failed messages refund credits automatically, manually, or not at all?
24. What delivery statuses do you want users to see in the dashboard? Example: sent, delivered, failed, pending.
25. Should the AI writer only suggest content, or should it also shorten messages to reduce SMS units?
26. Should AI-generated content always require human approval before sending? My recommendation is yes.
27. What should admins be able to do that normal users cannot?

## Priority 3: Business and operations questions

28. Which SMS gateway do you plan to use first, if any? Example: Arkesel, Hubtel, or still undecided.
29. Which payment provider do you want for wallet top-ups? Example: Paystack, Flutterwave, Hubtel, MoMo direct, or still undecided.
30. Will users buy fixed credit bundles, custom amounts, or both?
31. Will every user use one default sender ID at first, or should they request their own sender IDs?
32. Will sender IDs need approval by an admin before use?
33. Do you want organizations or teams on one account, or is one account per business enough for version one?
34. Do you need different user roles in version one? Example: owner, manager, staff, admin.
35. Will this platform be open signup for anyone, or invite-only / manually approved at first?
36. Are there any compliance, consent, or anti-spam rules you want clearly enforced in the product?
37. What support flow do you want after launch: email only, WhatsApp support, live chat, or admin-managed tickets later?

## Priority 4: Content, assets, and design direction

38. Do you already have a logo for this SMS platform? If not, should we temporarily use a text logo while we design?
39. Do you already have brand colours, fonts, or a style guide for this product?
40. What 3 words should describe the product visually? Example: trusted, modern, efficient.
41. What 3 words should the design not feel like? Example: childish, loud, generic.
42. Do you want the public website to feel more `corporate`, `premium`, `startup-modern`, or `simple and utility-focused`?
43. Should the dashboard feel more `clean and minimal` or `data-rich and operational`?
44. Please share 2 to 5 websites or dashboards you like and say what you like about each.
45. Please share 1 to 3 examples you dislike and what should be avoided.
46. Do you have real testimonials, client logos, or case studies we can feature on the public website?
47. Who will provide the website copy and dashboard microcopy: you, us, or a mix?
48. Do you already have your domain for this product, or should we recommend one?

## Priority 5: Delivery, timeline, and approvals

49. What is your ideal launch date?
50. Is there a hard deadline, or is the date flexible?
51. Who is the final decision-maker for design and scope approval?
52. Who will review wireframes and give consolidated feedback?
53. How many revision rounds do you want to allow before development begins?
54. What would make you say this project is successful 30 days after launch?

## Recommended follow-up call agenda

Once they answer the questions above, our next call should confirm:

1. Public website sitemap
2. Dashboard navigation
3. Campaign builder flow
4. Contact import flow
5. Wallet and billing flow
6. Admin scope
7. Branding direction and reference review

## What we can start immediately after answers come in

Once we have answers to Priority 1 and most of Priority 2, we can begin:

1. Project brief
2. Public website sitemap
3. Low-fidelity wireframes for key pages
4. Dashboard information architecture
5. Campaign builder wireframe
6. Early feature prioritization for MVP
7. Functional requirements draft

## Working assumptions if the client is unsure

If the client leaves some answers open, these are safe starter assumptions for wireframing:

- Public website plus separate logged-in SaaS dashboard
- Similar brand tone to Calyx: clean, premium, trustworthy, modern
- Main dashboard CTA is `Create Campaign`
- Core v1 flows are `Upload Contacts`, `Create Campaign`, and `Buy Credits`
- Campaign creation uses a guided step-by-step wizard
- AI suggests content but never sends without user confirmation
- Users see balance, campaign status, delivery reports, and recent transactions on the dashboard home
