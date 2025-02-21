chrome.runtime.onInstalled.addListener(() => {
    console.log("Background script initialized.");
  });
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "fetchRichestPeople") {
      fetchRichestPeople().then(response => sendResponse({ data: response }))
        .catch(error => sendResponse({ error: error.message }));
      return true;  // To indicate you are sending a response asynchronously
    }
  });
  
  async function fetchRichestPeople() {
    try {
      const response = await fetch('https://en.wikipedia.org/w/api.php?action=query&titles=List_of_wealthiest_Americans_by_net_worth&prop=revisions&rvprop=content&format=json');
      const data = await response.json();
      //console.log("Received data:", data);
      const pageContent = data.query.pages[Object.keys(data.query.pages)[0]].revisions[0]['*'];
      //console.log("Received pageContent:", pageContent);
      const regex = /\{\{sortname\|([^|]+)\|([^}]+)\}\} \|\| (\d+) \|\|/g;
      const topRichList = [];
      let match;
  
      while (match = regex.exec(pageContent)) {
        const firstName = match[1].trim();
        const lastName = match[2].trim();
        const netWorthString = match[3].trim();
        const name = `${firstName} ${lastName}`;
        const netWorth = parseFloat(netWorthString.replace(/[^0-9.-]+/g, ""))*1000000000;
  
        topRichList.push({ name, netWorth });
      }
  
      return topRichList.slice(0, 10);
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }
  