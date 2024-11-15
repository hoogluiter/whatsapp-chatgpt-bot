import fs from 'fs'
import ngrok from 'ngrok'
import nodemon from 'nodemon'
import config from './config.js'
import server from './server.js'
import knowledge from './knowledge.js'
import * as actions from './actions.js'
const { exit } = actions

// Function to create a Ngrok tunnel and register the webhook dynamically
async function createTunnel () {
  let retries = 3

  try {
    await ngrok.upgradeConfig({ relocate: false })
  } catch (err) {
    console.error('[warning] Failed to upgrade Ngrok config:', err.message)
  }

  while (retries) {
    retries -= 1
    try {
      const tunnel = await ngrok.connect({
        addr: config.port,
        authtoken: config.ngrokToken,
        path: () => config.ngrokPath
      })
      console.log(`Ngrok tunnel created: ${tunnel}`)
      config.webhookUrl = tunnel
      return tunnel
    } catch (err) {
      console.error('[error] Failed to create Ngrok tunnel:', err.message)
      await ngrok.kill()
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  throw new Error('Failed to create Ngrok tunnel')
}

// Development server using nodemon to restart the bot on file changes
async function devServer () {
  const tunnel = await createTunnel()

  nodemon({
    script: 'bot.js',
    ext: 'js',
    watch: ['*.js', 'src/**/*.js'],
    exec: `WEBHOOK_URL=${tunnel} DEV=false npm run start`
  }).on('restart', () => {
    console.log('[info] Restarting bot after changes...')
  }).on('quit', () => {
    console.log('[info] Closing bot...')
    ngrok.kill().then(() => process.exit(0))
  })
}

const loadWhatsAppDevice = async () => {
  try {
    const device = await actions.loadDevice()
    if (!device || device.status !== 'operative') {
      return exit('No active WhatsApp numbers in your account. Please connect a WhatsApp number in your OneChat account:\nhttps://app.onechat.com.do/create')
    }
    return device
  } catch (err) {
    if (err.response?.status === 403) {
      return exit('Unauthorized OneChat API key: please make sure you are correctly setting the API token, obtain your API key here:\nhttps://app.onechat.com.do/developers/apikeys')
    }
    if (err.response?.status === 404) {
      return exit('No active WhatsApp numbers in your account. Please connect a WhatsApp number in your OneChat account:\nhttps://app.onechat.com.do/create')
    }
    return exit('Failed to load WhatsApp number:', err.message)
  }
}

// Initialize chatbot server
async function main () {
  // API key must be provided
  if (!config.apiKey || config.apiKey.length < 60) {
    return exit('Please sign up in OneChat and obtain your API key:\nhttps://app.onechat.com.do/apikeys')
  }

  // OpenAI API key must be provided
  if (!config.openaiKey || config.openaiKey.length < 45) {
    return exit('Missing required OpenAI API key: please sign up for free and obtain your API key:\nhttps://platform.openai.com/account/api-keys')
  }

  // Create dev mode server with Ngrok tunnel and nodemon
  if (process.env.DEV === 'true' && !config.production) {
    return devServer()
  }

  // Find a WhatsApp number connected to the OneChat API
  const device = await loadWhatsAppDevice()
  if (!device) {
    return exit('No active WhatsApp numbers in your account. Please connect a WhatsApp number in your OneChat account:\nhttps://app.onechat.com.do/create')
  }
  if (device.session.status !== 'online') {
    return exit(`WhatsApp number (${device.alias}) is not online. Please make sure the WhatsApp number in your OneChat account is properly connected:\nhttps://app.onechat.com.do/${device.id}/scan`)
  }
  if (device.billing.subscription.product !== 'io') {
    return exit(`WhatsApp number plan (${device.alias}) does not support inbound messages. Please upgrade the plan here:\nhttps://app.onechat.com.do/${device.id}/plan?product=io`)
  }

  // Create tmp folder
  if (!fs.existsSync(config.tempPath)) {
    fs.mkdirSync(config.tempPath)
  }

  // Load knowledge base
  if (config.features.knowledge && config.knowledge?.length) {
    const rag = await knowledge()
    server.rag = rag
  }

  // Pre-load device labels and team mebers
  const [members] = await Promise.all([
    actions.pullMembers(device),
    actions.pullLabels(device)
  ])

  // Create labels if they don't exist
  await actions.createLabels(device)

  // Validate whitelisted and blacklisted members exist
  await actions.validateMembers(members)

  server.device = device
  console.log('[info] Using WhatsApp connected number:', device.phone, device.alias, `(ID = ${device.id})`)

  // Start server
  await server.listen(config.port, () => {
    console.log(`Server listening on port ${config.port}`)
  })

  if (config.production) {
    console.log('[info] Validating webhook endpoint...')
    if (!config.webhookUrl) {
      return exit('Missing required environment variable: WEBHOOK_URL must be present in production mode')
    }
    const webhook = await actions.registerWebhook(config.webhookUrl, device)
    if (!webhook) {
      return exit(`Missing webhook active endpoint in production mode: please create a webhook endpoint that points to the chatbot server:\nhttps://app.onechat.com.do/${device.id}/webhooks`)
    }
    console.log('[info] Using webhook endpoint in production mode:', webhook.url)
  } else {
    console.log('[info] Registering webhook tunnel...')
    const tunnel = config.webhookUrl || await createTunnel()
    const webhook = await actions.registerWebhook(tunnel, device)
    if (!webhook) {
      console.error('Failed to connect webhook. Please try again.')
      await ngrok.kill()
      return process.exit(1)
    }
  }

  console.log('[info] Chatbot server ready and waiting for messages!')
}

main().catch(err => {
  exit('Failed to start chatbot server:', err)
})
