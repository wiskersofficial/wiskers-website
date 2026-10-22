export const rounds = [
  {
    title: 'A new visitor lands on your site.',
    help: 'Where are they in their journey with you? Think of the person you most want to help.',
    context: 'They might recognise a challenge without knowing what to call it. Or they may arrive with a clear brief and a shortlist. Think about the first useful thing your website could help them do.',
    prompt: 'Would a small discovery help them find their feet, or would a clear route to action be more useful?',
  },
  {
    title: 'Someone is a good fit, but hasn’t reached out.',
    help: 'What would be the most useful next moment for them?',
    context: 'Interest can lead to a question, a comparison, or a next step. Picture the information they would need before a conversation with your team feels worthwhile.',
    prompt: 'Do they need help choosing between options, understanding the offer, or taking the next step?',
  },
  {
    title: 'Picture the lead you’d love to hear from.',
    help: 'Place the person you want more of—not just the one who happens to arrive today.',
    context: 'Think about a real kind of client: the problem they bring, the questions they ask, and what makes your expertise useful to them. Place the moment you want your website to support.',
    prompt: 'What would make that person think, “This looks relevant to me”?',
  },
  {
    title: 'Where should your first Wisker meet them?',
    help: 'Choose the kind of moment that would move the right visitor forward.',
    context: 'Bring the earlier moments together. You could open up an unfamiliar topic, help someone compare options, guide a choice, or turn a clear need into a useful enquiry.',
    prompt: 'Choose one place to begin. A focused experience can do one useful job well.',
  },
];

export const profiles = [
  {
    id: 'guide', x: 0, y: 1, label: 'Help me choose', title: 'The gentle guide',
    description: 'You want to meet people while they’re ready to move, even if they’re still deciding what they need. Make the next step feel clear and welcoming.',
    idea: 'A guided chooser that helps a visitor name what they need, then points them to a useful next step.',
    example: 'A visitor knows something needs to change, but your service names don’t yet mean much to them. Start with their situation, then help them see which route is relevant.',
    steps: ['Ask what they are trying to change, in language they already use.', 'Let them explore a small set of relevant routes and why each could fit.', 'Offer a next step that carries their choices into the conversation.'],
    question: 'Which two or three questions would help your team point someone in the right direction?',
    signal: 'The situations they chose, the routes they explored, and the next step they selected.',
  },
  {
    id: 'catalyst', x: 1, y: 1, label: 'Help me act', title: 'The confident catalyst',
    description: 'You’re drawn to people who know the problem and are ready to do something about it. Help them act without adding friction.',
    idea: 'A short action planner that turns a clear need into a concrete enquiry or next step.',
    example: 'A visitor has a problem in mind and wants to know how to get started. Give them a useful way to describe the situation before they contact your team.',
    steps: ['Let them choose the goal or challenge they want to work on.', 'Help them consider the scope, priorities, and practical constraints.', 'Build a short starting brief they can review before making an enquiry.'],
    question: 'What would your team want to know before a useful first meeting?',
    signal: 'The goal they selected, the priorities they stated, and the action they chose to take.',
  },
  {
    id: 'spark', x: 0, y: 0, label: 'Spark my interest', title: 'The curiosity spark',
    description: 'You want to catch attention early and make exploring feel worthwhile. A little discovery can give a visitor a reason to stay.',
    idea: 'A playful reveal that helps visitors discover which of your offers fits them.',
    example: 'A visitor is exploring a topic without a clear brief. A question, a scenario, or an unexpected reveal can help them connect your expertise to their own situation.',
    steps: ['Open with a familiar situation or a question worth answering.', 'Let their choices reveal a relevant insight, example, or possibility.', 'Give them a natural way to explore the part that caught their attention.'],
    question: 'What could someone discover in a minute that would make your expertise feel relevant?',
    signal: 'The scenarios they picked, the discoveries they opened, and the topics they chose to explore next.',
  },
  {
    id: 'explainer', x: 1, y: 0, label: 'Help me understand', title: 'The thoughtful explainer',
    description: 'You want to help interested people understand their options before they commit. Give them something useful to compare and consider.',
    idea: 'An interactive comparison that shows visitors which option best fits their situation.',
    example: 'A visitor understands the challenge but needs to see how different approaches would work for them. Turn the useful detail into something they can explore at their own pace.',
    steps: ['Start with the criteria that matter to the visitor’s situation.', 'Let them compare approaches, trade-offs, and relevant examples.', 'Help them keep track of the questions they want to discuss with your team.'],
    question: 'Which differences do prospects usually need your team to explain?',
    signal: 'The criteria they selected, the options they compared, and the details they opened.',
  },
];

export const clamp = n => Math.max(0, Math.min(1, Number(n) || 0));
export const nearestProfile = point => profiles.reduce((best, p) => Math.hypot(point.x - p.x, point.y - p.y) < Math.hypot(point.x - best.x, point.y - best.y) ? p : best, profiles[0]);
export function summarizePoints(points) {
  if (!points.length) return null;
  const average = points.reduce((sum, p) => ({ x: sum.x + p.x / points.length, y: sum.y + p.y / points.length }), { x: 0, y: 0 });
  let spread = 0;
  for (let i = 0; i < points.length; i++) for (let j = i + 1; j < points.length; j++) spread = Math.max(spread, Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y));
  const ranked = profiles.map(profile => ({ ...profile, distance: Math.hypot(average.x - profile.x, average.y - profile.y) })).sort((a, b) => a.distance - b.distance);
  return { profile: ranked[0], average, spread, mixed: ranked[1].distance - ranked[0].distance < .12, counts: profiles.map(p => ({ label: p.label, count: points.filter(point => nearestProfile(point).id === p.id).length })) };
}
