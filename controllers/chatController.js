export const handleChat = async (req, res) => {
    const { messages } = req.body

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`
        },
        body: JSON.stringify({
            model: "gemini-2.5-flash",
            messages: messages.slice(-4)
        })
    })

    const data = await response.json().catch(() => ({}))

    // Forward API errors in a consistent shape so the frontend doesn't crash
    if (!response.ok) {
        const errMessage =
            data?.error?.message ||
            data?.error?.detail ||
            data?.message ||
            `API request failed with status ${response.status}`

        return res.status(response.status).json({
            error: errMessage,
            details: data
        })
    }

    res.json(data)
}