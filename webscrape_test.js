fetch('https://na.finalfantasyxiv.com/lodestone/character/?q=shin%20sakura')
  .then(response => {
    if (!response.ok) {
      throw new Error(`error: ${response.status}`);
    }
    return response.text();
  })
  .then(htmlData => {
    console.log(htmlData); 
  })
  .catch(error => {
    console.error('Error:', error);
  });