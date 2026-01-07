// Basit Node.js Token Server (Alternatif Seçenek)
// Bu dosyayı kullanmak isterseniz: node server/agora-token-server.js
// PORT=3001 node server/agora-token-server.js

const express = require('express')
const cors = require('cors')
require('dotenv').config()

// Agora RTC Token Builder
// npm install agora-access-token
const { RtcTokenBuilder, RtcRole } = require('agora-access-token')

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

const AGORA_APP_ID = process.env.AGORA_APP_ID || ''
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE || ''

// Token endpoint
app.post('/api/agora-token', async (req, res) => {
  try {
    const { channelName, uid, role } = req.body

    if (!channelName || uid === undefined) {
      return res.status(400).json({ error: 'Missing channelName or uid' })
    }

    if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
      return res.status(500).json({ error: 'Agora configuration missing' })
    }

    // Token expiration time (24 hours)
    const expirationTimeInSeconds = Math.floor(Date.now() / 1000) + 3600 * 24

    // Determine role
    const rtcRole = role === 1 ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER

    // Generate token
    const token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channelName,
      parseInt(uid) || 0,
      rtcRole,
      expirationTimeInSeconds
    )

    res.json({
      token,
      appId: AGORA_APP_ID,
      channelName,
      uid,
      role,
    })
  } catch (error) {
    console.error('Error generating token:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', appId: AGORA_APP_ID ? 'configured' : 'missing' })
})

app.listen(PORT, () => {
  console.log(`🚀 Agora Token Server running on port ${PORT}`)
  console.log(`📡 App ID: ${AGORA_APP_ID ? 'Configured' : 'MISSING - Please set AGORA_APP_ID'}`)
  console.log(`🔐 Certificate: ${AGORA_APP_CERTIFICATE ? 'Configured' : 'MISSING - Please set AGORA_APP_CERTIFICATE'}`)
})

/* 
KURULUM:
1. npm install express cors dotenv agora-access-token
2. .env dosyasına ekleyin:
   AGORA_APP_ID=your_app_id
   AGORA_APP_CERTIFICATE=your_app_certificate
   PORT=3001
3. node server/agora-token-server.js
4. .env.example dosyasında VITE_AGORA_TOKEN_SERVER_URL=http://localhost:3001/api/agora-token ekleyin
*/

