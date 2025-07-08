const fetch = require('node-fetch');
const natural = require('natural');
const  Mistral  = require('@mistralai/mistralai');
require('dotenv').config();

// Natural Language Processing tools
const tokenizer = new natural.WordTokenizer();
const stopwords = ['i', 'a', 'an', 'the', 'w', 'na', 'o', 'się', 'z', 'do', 'to', 'że', 'nie', 'co', 'jest'];

// Initialize Mistral AI client - works with API key or in limited capacity without
// Using public endpoint for limited access without API key
const mistralPublicEndpoint = 'https://api.mistral.ai/v1';

/**
 * Generates a joke using Mistral AI with fallbacks
 * @returns {Promise<{text: string, imageUrl: string}>} The generated joke and related image
 */
async function generateJoke() {
  // Try different joke generation methods in sequence until one works
  const apiMethods = [ 
    generateMistralJoke,   // Priority: Try Mistral AI first
  ];

  for (const method of apiMethods) {
    try {
      const result = await method();
      if (result && result.text && result.text.length > 15) {
        console.log(`Pomyślnie wygenerowano żart używając: ${method.name}`);
        return result;
      }
    } catch (error) {
      console.log(`Nie udało się wygenerować żartu używając ${method.name}:`, error.message);
      // Continue to next method
    }
  }

  // If all methods fail, return a hardcoded joke
  const defaultJoke = 'Dlaczego programista nie może wyjść spod prysznica? Bo instrukcje na szamponie mówią: nałóż, spłucz, powtórz.';
  return {
    text: defaultJoke,
    imageUrl: await generateRelatedImage(defaultJoke)
  };
}



/**
 * Generates a joke using Mistral AI
 * @returns {Promise<{text: string, imageUrl: string}>} The generated joke and related image
 */
async function generateMistralJoke() {
  // Check if we have Mistral API key
  const apiKey = process.env.MISTRAL_API_KEY || '';

  try {
    let jokeText;
      // Using official Mistral client if API key is available
      const client = new Mistral.default(apiKey);

      // Generate a joke in Polish
      const response = await client.chat({
        model: 'mistral-tiny', // Using the smallest model for jokes
        messages: [
          { role: 'system', content: 'Jesteś zabawnym komikiem. Twoim zadaniem jest generowanie żartów, które są odpowiednie dla wszystkich odbiorców.' },
          { role: 'user', content: 'Wymyśl krótki, zabawny żart po polsku. Bez wyjaśnień, po prostu podaj żart.' }
        ],
        temperature: 0.9,
        max_tokens: 200
      });
      
      jokeText = response.choices[0].message.content.trim();

    
    // Generate related image for the joke
    const imageUrl = await generateRelatedImage(jokeText);
    
    return {
      text: jokeText,
      imageUrl
    };
  } catch (error) {
    console.error('Error generating joke with Mistral:', error);
    throw error;
  }
}


/**
 * Extract keywords from text
 * @param {string} text - The text to extract keywords from
 * @returns {string[]} Array of keywords
 */
function extractKeywords(text) {
  // Convert to lowercase and tokenize
  const tokens = tokenizer.tokenize(text.toLowerCase());
  
  // Filter out stopwords and short words
  const keywords = tokens.filter(word => 
    word.length > 3 && 
    !stopwords.includes(word) &&
    /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$/.test(word) // Keep only words with letters (including Polish)  
  );
  
  return keywords;
}

/**
 * Generates an image URL related to the joke
 * @param {string} jokeText - The joke text
 * @returns {Promise<string>} URL to a related image
 */
async function generateRelatedImage(jokeText) {
  try {
    // Extract keywords from joke or use the first 20 characters
    const keywords = extractKeywords(jokeText);
    let searchTerm = jokeText.substring(0, 20);
    
    if (keywords.length > 0) {
      // Use up to 2 keywords for better results
      searchTerm = keywords.slice(0, 2).join(' ');
    }
    
    // Create hash from the search term to ensure consistent but unique images
    const stringToHash = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash);
    };
    
    const hashValue = stringToHash(searchTerm);
    
    // Use multiple free image services that don't require API keys
    // Rotate between services for variety
    const imageServices = [
      // RoboHash - generates robot images based on text
      () => `https://robohash.org/${encodeURIComponent(searchTerm)}?set=set3&size=300x300`,
      
      // DiceBear - generates avatars based on text
      () => `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(searchTerm)}`,
      
      // Picsum Photos - random images with seed
      () => `https://picsum.photos/seed/${hashValue}/300/300`,
      
    ];
    
    // Select a service based on hash value for consistency per joke
    const serviceIndex = hashValue % imageServices.length;
    return imageServices[serviceIndex]();
    
  } catch (error) {
    console.error('Error generating image:', error);
    // Fallback image if there's an error - simple placeholder
    return 'https://via.placeholder.com/300x200/ffde2f/000000?text=Joke+Image';
  }
}

// Export main functions
module.exports = { generateJoke };

generateJoke().then(joke => console.log(joke));