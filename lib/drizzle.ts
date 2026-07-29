import * as schema from "../src/db/schema";

export const dbSchema = schema;

export interface DatabaseClient {
  userProfiles: typeof schema.userProfiles;
  stories: typeof schema.stories;
  essayProjects: typeof schema.essayProjects;
  feedbackReports: typeof schema.feedbackReports;
  voiceProfiles: typeof schema.voiceProfiles;
}

export function createDatabaseClient() {
  return {
    schema,
    select: () => ({ from: () => [] }),
    insert: () => ({ values: () => ({ returning: () => [] }) }),
    update: () => ({ set: () => ({ where: () => [] }) }),
    delete: () => ({ where: () => [] })
  };
}

export const db = createDatabaseClient();