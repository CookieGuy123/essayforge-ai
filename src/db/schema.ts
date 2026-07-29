import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const userProfiles = sqliteTable('user_profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().default('Student'),
  gradeLevel: text('grade_level').default('High School Senior'),
  colleges: text('colleges'),
  intendedMajor: text('intended_major'),
  interests: text('interests'),
  extracurriculars: text('extracurriculars'),
  deadlines: text('deadlines'),
  voicePreferences: text('voice_preferences'),
  createdAt: integer('created_at', { mode: 'timestamp' }),
});

export const stories = sqliteTable('stories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  category: text('category').notNull().default('Personal Growth'),
  content: text('content').notNull(),
  keyTakeaways: text('key_takeaways'),
  themes: text('themes'),
  essayAngles: text('essay_angles'),
  tags: text('tags'),
  createdAt: integer('created_at', { mode: 'timestamp' }),
});

export const interviewSessions = sqliteTable('interview_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }),
});

export const interviewAnswers = sqliteTable('interview_answers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: integer('session_id').references(() => interviewSessions.id),
  sender: text('sender').notNull(),
  content: text('content').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }),
});

export const essayProjects = sqliteTable('essay_projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  targetCollege: text('target_college'),
  prompt: text('prompt'),
  targetWordLimit: integer('target_word_limit').default(650),
  status: text('status').notNull().default('Drafting'),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

export const essayVersions = sqliteTable('essay_versions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').references(() => essayProjects.id),
  versionNumber: integer('version_number').notNull(),
  versionLabel: text('version_label').default('Initial Draft'),
  content: text('content').notNull(),
  wordCount: integer('word_count').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }),
});

export const feedbackReports = sqliteTable('feedback_reports', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  essayId: integer('essay_id'),
  essayTitle: text('essay_title').notNull(),
  overallScore: integer('overall_score').notNull(),
  authenticityScore: integer('authenticity_score').notNull(),
  reflectionScore: integer('reflection_score').notNull(),
  specificityScore: integer('specificity_score').notNull(),
  storytellingScore: integer('storytelling_score').notNull(),
  emotionalImpactScore: integer('emotional_impact_score').notNull(),
  structureScore: integer('structure_score').notNull(),
  grammarScore: integer('grammar_score').notNull(),
  alignmentScore: integer('alignment_score').notNull(),
  strengths: text('strengths').notNull(),
  weaknesses: text('weaknesses').notNull(),
  lineFeedback: text('line_feedback'),
  recommendations: text('recommendations').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }),
});

export const voiceProfiles = sqliteTable('voice_profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  writingSamples: text('writing_samples').notNull(),
  sentenceRhythm: text('sentence_rhythm'),
  vocabularyLevel: text('vocabulary_level'),
  toneTraits: text('tone_traits'),
  voiceGuidance: text('voice_guidance').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }),
});

export const collegePrompts = sqliteTable('college_prompts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  category: text('category').notNull(),
  collegeName: text('college_name'),
  promptText: text('prompt_text').notNull(),
  wordLimit: integer('word_limit').default(650),
});