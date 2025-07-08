// Load environment variables
require('dotenv').config();

const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const cron = require('node-cron');
const { generateJoke } = require('./jokeGenerator');

// Initialize Discord client with necessary intents
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ] 
});

// Array of slash commands
const commands = [
  new SlashCommandBuilder()
    .setName('żart')
    .setDescription('Generuje losowy żart używając AI')
    .toJSON()
];

// Register slash commands when bot is ready
client.once('ready', async () => {
  console.log(`Zalogowano jako ${client.user.tag}!`);
  
  // Register slash commands
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    console.log('Rozpoczęto rejestrację komend slash (/)');
    
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands },
    );
    
    console.log('Pomyślnie zarejestrowano komendy slash (/)');
    
    // Schedule daily joke
    setupDailyJoke();
  } catch (error) {
    console.error('Wystąpił błąd podczas rejestracji komend:', error);
  }
});

// Handle slash commands
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  
  const { commandName } = interaction;
  
  if (commandName === 'żart') {
    await interaction.deferReply(); // Show "bot is thinking..."
    
    try {
      const { text: jokeText, imageUrl } = await generateJoke();
      
      // Create an embed with the joke and image
      const { EmbedBuilder } = require('discord.js');
      const jokeEmbed = new EmbedBuilder()
        .setColor('#FF9900')
        .setTitle('😂 Żart dnia')
        .setDescription(jokeText)
        .setImage(imageUrl)
        .setFooter({ text: 'AI-Generated Joke' })
        .setTimestamp();
      
      await interaction.editReply({ embeds: [jokeEmbed] });
    } catch (error) {
      console.error('Błąd podczas generowania żartu:', error);
      await interaction.editReply('Przepraszam, wystąpił błąd podczas generowania żartu. Spróbuj ponownie później.');
    }
  }
});

// Function to set up daily joke schedule
function setupDailyJoke() {
  const jokesChannelId = process.env.JOKES_CHANNEL_ID;
  const dailyJokeTime = process.env.DAILY_JOKE_TIME || '12:00';
  const [hour, minute] = dailyJokeTime.split(':');
  
  // Schedule cron job - runs once a day at the specified time
  // Format: minute hour * * * (minute, hour, day of month, month, day of week)
  cron.schedule(`${minute} ${hour} * * *`, async () => {
    try {
      const jokesChannel = await client.channels.fetch(jokesChannelId);
      if (!jokesChannel) {
        console.error('Kanał żartów nie został znaleziony!');
        return;
      }
      
      const { text: jokeText, imageUrl } = await generateJoke();
      
      // Create an embed with the joke and image
      const { EmbedBuilder } = require('discord.js');
      const jokeEmbed = new EmbedBuilder()
        .setColor('#FF9900')
        .setTitle('📅 Żart dnia')
        .setDescription(jokeText)
        .setImage(imageUrl)
        .setFooter({ text: `AI-Generated Joke | ${new Date().toLocaleDateString('pl-PL')}` })
        .setTimestamp();
      
      await jokesChannel.send({ embeds: [jokeEmbed] });
      console.log('Pomyślnie wysłano dzienny żart!');
    } catch (error) {
      console.error('Wystąpił błąd podczas wysyłania dziennego żartu:', error);
    }
  }, {
    timezone: process.env.TIMEZONE || 'Europe/Warsaw'
  });
  
  console.log(`Zaplanowano codzienny żart o godzinie ${dailyJokeTime}`);
}

// Login to Discord
client.login(process.env.DISCORD_TOKEN);

// Handle errors
client.on('error', console.error);
process.on('unhandledRejection', error => {
  console.error('Nieobsłużony błąd:', error);
});
