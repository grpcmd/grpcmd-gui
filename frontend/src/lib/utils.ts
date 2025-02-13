import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// From: shadcn
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// From: https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
type ErrorWithMessage = {
  message: string
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  )
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError

  try {
    return new Error(JSON.stringify(maybeError))
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError))
  }
}

export function getErrorMessage(error: unknown) {
  return toErrorWithMessage(error).message
}

export function grpcStatusCodeToString(code: string) {
  switch (code) {
    case '0':
      return 'OK'
    case '1':
      return 'CANCELLED'
    case '2':
      return 'UNKNOWN'
    case '3':
      return 'INVALID_ARGUMENT'
    case '4':
      return 'DEADLINE_EXCEEDED'
    case '5':
      return 'NOT_FOUND'
    case '6':
      return 'ALREADY_EXISTS'
    case '7':
      return 'PERMISSION_DENIED'
    case '8':
      return 'RESOURCE_EXHAUSTED'
    case '9':
      return 'FAILED_PRECONDITION'
    case '10':
      return 'ABORTED'
    case '11':
      return 'OUT_OF_RANGE'
    case '12':
      return 'UNIMPLEMENTED'
    case '13':
      return 'INTERNAL'
    case '14':
      return 'UNAVAILABLE'
    case '15':
      return 'DATA_LOSS'
    case '16':
      return 'UNAUTHENTICATED'
    default:
      return 'UNKNOWN'
  }
}
