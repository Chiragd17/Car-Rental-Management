import { useAuth as useAuthContext } from '../context/AuthContext'

// Re-export for convenience
export default function useAuth() {
  return useAuthContext()
}