'use client'

import { chapterTasks } from '@/lib/data'

const STORAGE_KEY = 'java-to-go-progress'

export const chapterTaskCounts = Object.fromEntries(
  chapterTasks.map((chapter) => [
    chapter.chapterId,
    chapter.exerciseIds.length + chapter.quizIds.length,
  ])
)

export const totalTaskCount = chapterTasks.reduce(
  (total, chapter) => total + chapter.exerciseIds.length + chapter.quizIds.length,
  0
)

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
  const chapter = chapterTasks.find((task) => task.chapterId === chapterId)
  if (!chapter) return 0

  const completedExercises = chapter.exerciseIds.filter((id) => p.completedExercises.includes(id)).length
  const completedQuizzes = chapter.quizIds.filter((id) => p.completedQuizzes.includes(id)).length
  const chapterTaskCount = chapterTaskCounts[chapterId] || 0

  if (chapterTaskCount === 0) return 0
  return Math.min(100, Math.round(((completedExercises + completedQuizzes) / chapterTaskCount) * 100))
}

export function getTotalProgress(): number {
  const p = getProgress()
  const completedExercises = chapterTasks.reduce(
    (total, chapter) => total + chapter.exerciseIds.filter((id) => p.completedExercises.includes(id)).length,
    0
  )
  const completedQuizzes = chapterTasks.reduce(
    (total, chapter) => total + chapter.quizIds.filter((id) => p.completedQuizzes.includes(id)).length,
    0
  )

  if (totalTaskCount === 0) return 0
  return Math.min(100, Math.round(((completedExercises + completedQuizzes) / totalTaskCount) * 100))
}
