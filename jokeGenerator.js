const fetch = require('node-fetch');
const natural = require('natural');

// Natural Language Processing tools
const tokenizer = new natural.WordTokenizer();
const stopwords = ['i', 'a', 'an', 'the', 'w', 'na', 'o', 'się', 'z', 'do', 'to', 'że', 'nie', 'co', 'jest'];

/**
 * Generates a joke using a free AI model API
 * @returns {Promise<{text: string, imageUrl: string}>} The generated joke and related image
 */
async function generateJoke() {
  try {
    // Using Hugging Face Inference API - free tier
    // Note: You can add your Hugging Face API key to the .env file if you want better rate limits
    // but it works without authentication for limited usage
    const response = await fetch(
      'https://api-inference.huggingface.co/models/Pfinder/GPT2-jokes',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization if you have a Hugging Face token
          // 'Authorization': `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
        },
        body: JSON.stringify({
          inputs: 'Opowiedz śmieszny żart po polsku:',
          parameters: {
            max_length: 200,
            temperature: 0.9,
            top_p: 0.95,
            do_sample: true
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API response error: ${response.status}`);
    }

    const result = await response.json();
    
    // Extract and clean up the generated text
    let joke = result[0].generated_text;
    
    // Remove the prompt from the generated text
    joke = joke.replace('Opowiedz śmieszny żart po polsku:', '').trim();
    
    // If the joke is too short, try an alternative API
    if (joke.length < 20) {
      return await generateJokeAlternative();
    }
    
    // Get a related image
    const imageUrl = await generateRelatedImage(joke);
    
    return {
      text: joke,
      imageUrl
    };
  } catch (error) {
    console.error('Error generating joke from primary API:', error);
    return await generateJokeAlternative();
  }
}

/**
 * Alternative joke generation using another free API
 * @returns {Promise<{text: string, imageUrl: string}>} The generated joke and related image
 */
async function generateJokeAlternative() {
  try {
    // Using JokeAPI as a fallback
    const response = await fetch('https://v2.jokeapi.dev/joke/Any?lang=pl');
    
    if (!response.ok) {
      throw new Error(`Fallback API response error: ${response.status}`);
    }
    
    const data = await response.json();
    
    let jokeText;
    if (data.type === 'single') {
      jokeText = data.joke;
    } else {
      jokeText = `${data.setup}\n\n${data.delivery}`;
    }
    
    // Get a related image
    const imageUrl = await generateRelatedImage(jokeText);
    
    return {
      text: jokeText,
      imageUrl
    };
  } catch (fallbackError) {
    console.error('Error generating joke from fallback API:', fallbackError);
    // Return a hardcoded joke as last resort
    const defaultJoke = 'Dlaczego programista nie może wyjść spod prysznica? Bo instrukcje na szamponie mówią: nałóż, spłucz, powtórz.';
    const defaultImage = 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400';
    
    return {
      text: defaultJoke,
      imageUrl: defaultImage
    };
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
    // Extract keywords from joke
    const keywords = extractKeywords(jokeText);
    
    // If no keywords were found, use default image term
    if (keywords.length === 0) {
      keywords.push('funny', 'joke', 'humor');
    }
    
    // Use up to 2 keywords for better results
    const searchTerms = keywords.slice(0, 2).join(' ');
    
    // Use Unsplash API for free images
    const response = await fetch(
      `https://source.unsplash.com/400x300/?${encodeURIComponent(searchTerms)},funny,joke`,
      { method: 'GET' }
    );
    
    if (!response.ok) {
      throw new Error(`Image API response error: ${response.status}`);
    }
    
    // The URL we get back is the image URL
    return response.url;
  } catch (error) {
    console.error('Error generating image:', error);
    // Fallback image if there's an error
    return 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400';
  }
}

module.exports = { generateJoke };
