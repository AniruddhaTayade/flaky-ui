const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

export async function generateFromUrl(url, framework) {
  const formData = new FormData()
  formData.append("url", url)
  formData.append("framework", framework.toLowerCase())

  const response = await fetch(`${API_BASE}/api/generate`, {
    method: "POST",
    body: formData
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || "Generation failed")
  }

  return response.json()
}

export async function generateFromScreenshot(file, framework) {
  const formData = new FormData()
  formData.append("screenshot", file)
  formData.append("framework", framework.toLowerCase())

  const response = await fetch(`${API_BASE}/api/generate`, {
    method: "POST",
    body: formData
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || "Generation failed")
  }

  return response.json()
}
