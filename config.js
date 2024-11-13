import functions from './functions.js'
const { env } = process

// Default message when the user sends an unknown message.
const unknownCommandMessage = `Lo siento, soy el chatbot de CPM EXPRESS y solo puedo entender texto. ¿Podrías describir tu consulta, por favor?

Si deseas hablar con un humano, simplemente responde con *Ejecutivo*.`

// Default welcome message. Change it as you need.
const welcomeMessage = `¡Hola! 👋 Bienvenido al chatbot de IA de CPM EXPRESS potenciado por ChatGPT utilizando OneChat API. ¡También puedo hablar muchos idiomas! 😁 Estoy aquí para ayudarte con cualquier consulta que tengas sobre nuestros servicios.`

// AI bot instructions to adjust its bevarior. Change it as you need.
// Use concise and clear instructions.
const botInstructions = `Eres un Agente de servicio al cliente de CPM EXPRESS, tu nombre es Alice

Proporcionar asistencia legal, profesional y ética a contadores y abogados en la República Dominicana, ayudándoles en la gestión de documentos corporativos. Las tareas específicas incluyen la elaboración, tramitación, evaluación, análisis y gestión de dichos documentos.

- Servicios prestados: Depósito y Retiro, Copias Certificadas y Certificaciones, Renovaciones, Asambleas, Constituciones, Certificación MiPyMes, Proveedor del Estado, Transformaciones, Liquidaciones.
- Ubicación: Av. 27 de Febrero No. 234, Edif. Yolanda, 1er Nivel, La Esperilla, Santo Domingo, Distrito Nacional, República Dominicana.
- Horario: Lunes a Viernes de 7:00 A.M. a 5:00 P.M.; Sábados, Domingos y días feriados cerrado.
- Formas de contacto: Teléfono, Correo, WhatsApp, Facebook, Instagram, página web.
- Métodos de pago aceptados: Efectivo, Cheque, Transferencia, Tarjeta de Crédito, Tarjeta de Débito.
- Cuentas bancarias:
  - Banco BHD: 32343920019
  - Banco Promerica: 16011100002023
  - Banco del Reservas: 9604839465
  - Banco Santa Cruz: 1241000002536
  - Banco Popular Dominicano: 790821805

Todas a nombre de CPM EXPRESS, SRL con el RNC:1-31-22602-7

CPM EXPRESS se dedica a ayudar a contadores y abogados a manejar la carga operativa de la gestión de documentos corporativos para que puedan enfocarse en crecer como empresarios. Los agentes de servicio al cliente deben proporcionar respuestas educadas, concisas, y amigables, mientras aprenden continuamente de cada interacción para mejorar la consistencia y calidad de sus respuestas. ALICE, como asistente, debe evitar respuestas que reconozcan limitaciones de la IA o que sean inapropiadas, y nunca utilizar la palabra "depende".

- Mantener siempre un tono profesional y respetuoso.
- Aprender de cada interacción para mejorar la consistencia en futuras respuestas.
- Solicitar cortésmente más información si el contexto de la consulta no está claro.
- Rechazar educadamente responder preguntas que no estén alineadas con el contexto empresarial.
- Incorporar opiniones personales de manera respetuosa y asegurarse de que las respuestas sean imparciales y directas.
- Evitar el uso de la palabra "depende" en las respuestas.
- Genera respuestas cortas, lo mas cortas posibles, mejor esperar que el cliente pida que ampliar la respuesta a que sea muy larga y no entienda lo que se quiso decir.`

// Default help message. Change it as you need.
const defaultMessage = `¡No seas tímido 😁! ¡Intenta preguntarle cualquier cosa al chatbot de IA, usando lenguaje natural!

Ejemplos de consultas:

1️⃣ Explícame qué es CPM EXPRESS

2️⃣ ¿Puedo usar CPM EXPRESS para realizar depósitos y retiros?

3️⃣ ¿Ofrecen servicios de certificación MiPyMes?

4️⃣ ¿Cuál es el horario de atención de CPM EXPRESS?

Escribe humano para hablar con una persona. El chat será asignado a un miembro disponible del equipo.

¡Inténtalo! 😁`

// Chatbot config
export default {
  // Optional. Specify the OneChat device ID (24 characters hexadecimal length) to be used for the chatbot
  // If no device is defined, the first connected device will be used
  // Obtain the device ID in the OneChat app: https://app.onechat.com.do/number
  device: env.DEVICE || '65020ae535fe6b128dfdffa9',

  // Required. Specify the OneChat API key to be used
  // You can obtain it here: https://app.onechat.com.do/apikeys
  apiKey: env.API_KEY || 'e976bf5d2c243e6d26963efafc5c9c461b88a81a60adc9f09200eb4526fad8155de6fc95782bac5c',

  // Required. Specify the OpenAI API key to be used
  // You can sign up for free here: https://platform.openai.com/signup
  // Obtain your API key here: https://platform.openai.com/account/api-keys
  openaiKey: env.OPENAI_API_KEY || 'sk-OAtgNk8yHYaJ5ivrxw6ZctcGSKkCluSfSqTLx1fiWoT3BlbkFJ5BFOpco7T3-iNqGTuRpyhE7L741cePlo0Q_mHxoGsA',

  // Required. Set the OpenAI model to use.
  // You can use a pre-existing model or create your fine-tuned model.
  // Default model (fastest and cheapest): gpt-3.5-turbo-0125
  // Newest model: gpt-4-1106-preview
  // For customized fine-tuned models, see: https://platform.openai.com/docs/guides/fine-tuning
  openaiModel: env.OPENAI_MODEL || 'gpt-4o', // 'gpt-3.5-turbo-0125',

  // Callable functions for RAG to be interpreted by the AI. Optional.
  // See: functions.js
  // Edit as needed to cover your business use cases.
  // Using it you can instruct the AI to inform you to execute arbitrary functions
  // in your code based in order to augment information for a specific user query.
  // For example, you can call an external CRM in order to retrieve, save or validate
  // specific information about the customer, such as email, phone number, user ID, etc.
  // Learn more here: https://platform.openai.com/docs/guides/function-calling
  functions,

  // Optional. HTTP server TCP port to be used. Defaults to 8080
  port: +env.PORT || 8080,

  // Optional. Use NODE_ENV=production to run the chatbot in production mode
  production: env.NODE_ENV === 'production',

  // Optional. Specify the webhook public URL to be used for receiving webhook events
  // If no webhook is specified, the chatbot will autoamtically create an Ngrok tunnel
  // and register it as the webhook URL.
  // IMPORTANT: in order to use Ngrok tunnels, you need to sign up for free, see the option below.
  webhookUrl: env.WEBHOOK_URL,

  // Ngrok tunnel authentication token.
  // Required if webhook URL is not provided.
  // sign up for free and get one: https://ngrok.com/signup
  // Learn how to obtain the auth token: https://ngrok.com/docs/agent/#authtokens
  ngrokToken: env.NGROK_TOKEN || '2nXNLcQV5NzZdqjyKa4h67bGxji_6YGvpsd494hp2f1NFYDTB',

  // Optional. Full path to the ngrok binary.
  ngrokPath: env.NGROK_PATH,

  // Set one or multiple labels on chatbot-managed chats
  setLabelsOnBotChats: ['bot'],

  // Remove labels when the chat is assigned to a person
  removeLabelsAfterAssignment: true,

  // Set one or multiple labels on chatbot-managed chats
  setLabelsOnUserAssignment: ['from-bot'],

  // Optional. Set a list of labels that will tell the chatbot to skip it
  skipChatWithLabels: ['no-bot'],

  // Optional. Ignore processing messages sent by one of the following numbers
  // Important: the phone number must be in E164 format with no spaces or symbols
  // Example number: 18294358985
  numbersBlacklist: ['18294358985'],

  // Optional. Only process messages one of the the given phone numbers
  // Important: the phone number must be in E164 format with no spaces or symbols
  // Example number: 18294358985
  numbersWhitelist: ['18098858381'],

  // Skip chats that were archived in WhatsApp
  skipArchivedChats: true,

  // If true, when the user requests to chat with a human, the bot will assign
  // the chat to a random available team member.
  // You can specify which members are eligible to be assigned using the `teamWhitelist`
  // and which should be ignored using `teamBlacklist`
  enableMemberChatAssignment: true,

  // If true, chats assigned by the bot will be only assigned to team members that are
  // currently available and online (not unavailable or offline)
  assignOnlyToOnlineMembers: false,

  // Optional. Skip specific user roles from being automatically assigned by the chat bot
  // Available roles are: 'admin', 'supervisor', 'agent'
  skipTeamRolesFromAssignment: ['admin'], // 'supervisor', 'agent'

  // Enter the team member IDs (24 characters length) that can be eligible to be assigned
  // If the array is empty, all team members except the one listed in `skipMembersForAssignment`
  // will be eligible for automatic assignment
  teamWhitelist: [],

  // Optional. Enter the team member IDs (24 characters length) that should never be automatically assigned chats to
  teamBlacklist: [],

  // Optional. Set metadata entries on bot-assigned chats
  setMetadataOnBotChats: [
    {
      key: 'bot_start',
      value: () => new Date().toISOString()
    }
  ],

  // Optional. Set metadata entries when a chat is assigned to a team member
  setMetadataOnAssignment: [
    {
      key: 'bot_stop',
      value: () => new Date().toISOString()
    }
  ],

  defaultMessage,
  botInstructions,
  welcomeMessage,
  unknownCommandMessage,
}
