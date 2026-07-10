import { GoalTemplate } from '../types';

export const GOAL_TEMPLATES: GoalTemplate[] = [
  {
    id: 'startup-launch',
    persona: 'founder',
    title: 'Launch SaaS Startup',
    description: 'Build an MVP, validate core features, acquire initial users, and prepare for a public launch.',
    milestones: [
      'Validate Idea & Build Landing Page',
      'Build Core MVP Features',
      'Acquire First 10 Beta Users',
      'Launch Publicly on ProductHunt'
    ]
  },
  {
    id: 'placement-prep',
    persona: 'student',
    title: 'Get Software Internship',
    description: 'Crack mock interviews, solve DSA questions, build projects, and submit applications.',
    milestones: [
      'Solve 100 LeetCode / DSA Problems',
      'Draft & Refine Tech Resume',
      'Build 2 Portfolio Projects',
      'Complete 5 Mock Interviews'
    ]
  }
];
