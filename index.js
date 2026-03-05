const TelegramBot = require("node-telegram-bot-api")
const axios = require("axios")
const express = require("express")

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true })

const app = express()
app.get("/", (req, res) => res.send("StainAI Running"))
app.listen(process.env.PORT || 3000)

const SESSION_TIMEOUT = Number(process.env.SESSION_TIMEOUT) || 300000

let sessions = {}

const startImage = "https://i.ibb.co/cSQVfxp5/d3e716fb89edd137dc750918ccfe22e8.jpg"
const pingImage = "https://res.cloudinary.com/dvpnd4wrq/image/upload/v1772691429/Dynamic%20folders/upload_1772691429.jpg"
const devImage = "https://i.postimg.cc/VNW476yJ/4d59188bad5eb3f3043447cbb97076c8.jpg"

const startTime = Date.now()

bot.onText(/\/start/, (msg) => {

const chatId = msg.chat.id

const caption = `🤖 *Welcome to StainAI.*

An integrated artificial intelligence assistant designed to help generate ideas, answer questions, and solve problems efficiently.

Use the buttons below to navigate.

⚡ Intelligent assistance at your fingertips.`

bot.sendPhoto(chatId, startImage, {
caption,
parse_mode: "Markdown",
reply_markup: {
keyboard: [
["/ai","/ping"],
["/dev","/support"]
],
resize_keyboard: true
}
})

})

bot.onText(/\/ping/, (msg)=>{

const chatId = msg.chat.id

const uptime = Math.floor((Date.now() - startTime) / 1000)
const date = new Date().toLocaleString()

const caption = `📡 *StainAI System Status*

🤖 Bot Status: Online  
⏱ Uptime: ${uptime} seconds  
📅 Date & Time: ${date}

"Discipline turns small actions into powerful results."`

bot.sendPhoto(chatId,pingImage,{
caption,
parse_mode:"Markdown"
})

})

bot.onText(/\/dev/, (msg)=>{

const chatId = msg.chat.id

const caption = `👨‍💻 *StainAI Development Team*

Main Developer  
Ken  
https://linktr.ee/iamevanss  

Co-Developer  
https://short-url.org/teddyyy`

bot.sendPhoto(chatId,devImage,{
caption,
parse_mode:"Markdown"
})

})

bot.onText(/\/support/, (msg)=>{

const chatId = msg.chat.id

bot.sendMessage(chatId,
`🛠 *Support*

For assistance or inquiries regarding StainAI contact:

@heisevanss`,
{parse_mode:"Markdown"})

})

bot.onText(/\/ai/, (msg)=>{

const chatId = msg.chat.id

sessions[chatId] = {
active: true,
last: Date.now()
}

bot.sendMessage(chatId,
`🧠 *AI Session Activated.*

Send any message and StainAI will respond.

Session closes after 5 minutes of inactivity.

Use /cancelsession to close it manually.`,
{parse_mode:"Markdown"})

})

bot.onText(/\/cancelsession/, (msg)=>{

const chatId = msg.chat.id

delete sessions[chatId]

bot.sendMessage(chatId,
`⚠️ *AI Session Closed.*

Start a new session anytime using /ai`,
{parse_mode:"Markdown"})

})

bot.on("message", async (msg)=>{

const chatId = msg.chat.id
const text = msg.text

if(!sessions[chatId]) return
if(!text) return
if(text.startsWith("/")) return

if(Date.now() - sessions[chatId].last > SESSION_TIMEOUT){

delete sessions[chatId]

bot.sendMessage(chatId,"⚠️ Session expired. Start again with /ai")
return

}

sessions[chatId].last = Date.now()

let reply = null

try{

const response = await axios.post(
"https://openrouter.ai/api/v1/chat/completions",
{
model:"mistralai/mistral-7b-instruct",
messages:[
{role:"user",content:text}
]
},
{
headers:{
Authorization:`Bearer ${process.env.OPENROUTER_KEY}`,
"Content-Type":"application/json"
}
})

reply = response.data.choices[0].message.content

}catch(e){

reply = "⚠️ AI service is temporarily unavailable. Please try again shortly."

}

bot.sendMessage(chatId,reply)

})
