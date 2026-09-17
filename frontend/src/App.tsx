import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ToastProvider } from '@/context/ToastContext'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { TasksPage } from '@/pages/TasksPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { useDebounced } from '@/hooks/useDebounced'

/**
 * La recherche vit ici : saisie dans l'en-tete, consommee par la page des
 * taches. Elle est debouncee pour ne pas declencher un appel par frappe.
 */
function AuthenticatedShell() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounced(search)

  return (
    <AppLayout search={search} onSearchChange={setSearch}>
      <Routes>
        <Route
          path="/tasks"
          element={<TasksPage search={debouncedSearch} onResetSearch={() => setSearch('')} />}
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/tasks" replace />} />
      </Routes>
    </AppLayout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/*" element={<AuthenticatedShell />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
