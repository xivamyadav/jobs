// Unused hook - using src/hooks/jobs/use-jobs.ts instead
// @tanstack/react-query is not installed

export const jobKeys = {
    all: ['jobs'] as const,
    lists: () => [...jobKeys.all, 'list'] as const,
};