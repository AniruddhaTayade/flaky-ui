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

export async function generateWithJobQueue(url, framework, onStatusUpdate, file = null) {
  console.log('[DEBUG] generateWithJobQueue called with:', { url, framework, hasFile: !!file })

  const formData = new FormData()

  // Only append url if it's not null/empty
  if (url && url.trim()) {
    formData.append("url", url)
  }

  formData.append("framework", framework.toLowerCase())

  // Add screenshot file if provided
  if (file) {
    console.log('[DEBUG] Adding screenshot to FormData:', file.name, file.type, file.size)
    formData.append("screenshot", file)
  }

  console.log('[DEBUG] FormData contents:')
  for (let [key, value] of formData.entries()) {
    console.log('  ', key, value instanceof File ? `File: ${value.name} (${value.size} bytes, ${value.type})` : value)
  }

  console.log('[DEBUG] Posting to', `${API_BASE}/api/jobs`)
  const response = await fetch(`${API_BASE}/api/jobs`, {
    method: "POST",
    body: formData
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[DEBUG] Failed to create job:', response.status, errorText)
    throw new Error("Failed to create job: " + errorText)
  }
  const { job_id } = await response.json()
  console.log('[DEBUG] Job created with ID:', job_id)

  const wsBase = (API_BASE || "http://localhost:8000")
    .replace("http://", "ws://")
    .replace("https://", "wss://")

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${wsBase}/api/ws/${job_id}`)

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      onStatusUpdate(data)

      if (data.status === "complete") {
        ws.close()
        // data.result may be a JSON string if backend used json.dumps()
        let result = data.result
        if (typeof result === 'string') {
          console.log('[DEBUG] data.result is string, parsing JSON...')
          result = JSON.parse(result)
        }
        console.log('[DEBUG] WebSocket complete, result:', result)
        console.log('[DEBUG] result.files:', result?.files)
        resolve(result)
      }
      if (data.status === "failed") {
        ws.close()
        reject(new Error(data.error || "Generation failed"))
      }
    }

    ws.onerror = () => reject(new Error("WebSocket connection failed"))
    ws.onclose = () => {}
  })
}
