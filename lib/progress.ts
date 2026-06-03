'use client'

const STORAGE_KEY = 'java-to-go-progress'

export interface Progress {
  completedExercises: string[]
  completedQuizzes: string[]
  lastVisited: string | null
}

function getDefault(): Progress {
  return {
    completedExercises: [],
    completedQuizzes: [],
    lastVisited: null,
  }
}

export function getProgress(): Progress {
  if (typeof window === 'undefined') return getDefault()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefault()
    return JSON.parse(raw) as Progress
  } catch {
    return getDefault()
  }
}

export function saveProgress(progress: Progress) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function markExerciseDone(exerciseId: string) {
  const p = getProgress()
  if (!p.completedExercises.includes(exerciseId)) {
    p.completedExercises.push(exerciseId)
    saveProgress(p)
  }
}

export function markQuizDone(quizId: string) {
  const p = getProgress()
  if (!p.completedQuizzes.includes(quizId)) {
    p.completedQuizzes.push(quizId)
    saveProgress(p)
  }
}

export function setLastVisited(chapterId: string) {
  const p = getProgress()
  p.lastVisited = chapterId
  saveProgress(p)
}

export function getChapterProgress(chapterId: string): number {
  const p = getProgress()
  const chapterExercises = p.completedExercises.filter(id => id.startsWith(chapterId))
  // Each chapter has 4 exercises
  return Math.min(100, Math.round((chapterExercises.length / 4) * 100))
}

export function getTotalProgress(): number {
  const p = getProgress()
  // Total: 16 exercises + 4 quizzes = 20 tasks
  const total = p.completedExercises.length + p.completedQuizzes.length
  return Math.min(100, Math.round((total / 20) * 100))
}
