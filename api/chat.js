export default async function handler(req, res) {
    try {
        const { messages } = await req.json();

        const apiKey = process.env.TOGETHER_API_KEY;

        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gemini-2.5-flash",
                messages: messages.slice(-4)
            })
        });

        const data = await response.json();
        return Response.json(data);

    } catch (error) {
        return Response.json({ error: "Something went wrong." }, { status: 500 });
    }
}
  