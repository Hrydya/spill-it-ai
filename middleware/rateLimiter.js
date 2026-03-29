const requests = {}

const rateLimiter = (req, res, next) => {
    const ip = req.ip
    const now = Date.now()
    const windowMs = 60 * 1000
    const max = 15

    if (!requests[ip]) {
        requests[ip] = []
    }

    requests[ip] = requests[ip].filter(time => now - time < windowMs)

    if (requests[ip].length >= max) {
        return res.status(429).json({ error: "Too many requests, slow down!" })
    }

    requests[ip].push(now)
    next()
}

export default rateLimiter