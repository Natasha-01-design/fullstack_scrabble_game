
function isWordValid(word) {
  if (!word || word.length < 2) {
    return Promise.resolve(false);
  }

  return fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    .then((response) => response.ok)
    .catch((error) => {
      console.error("Error validating word:", error);
      return false;
    });
}

export default isWordValid;
