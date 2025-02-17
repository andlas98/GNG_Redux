var parseString = require('xml2js').parseString;
var DOMPurify = require('dompurify');


export var allFeedEntries : Array <{[key: string]: any}> = [];

const PROXY_URL = 'https://api.cors.lol/?url=';

function moveSiliconeraEntriesToAllFeedEntries(entries: any) {
  entries.forEach((entry: any) => {
    const cleanedArticlePreview = DOMPurify.sanitize(entry.description[0]);
    const cleanedArticleTags = entry.category.map((tag: any) => tag.replace(/&#039;/g, "'") + " ");
    const formattedEntry = {
      articleHeaderImg: "",
      articleHeadline: entry.title[0],
      articleLink: entry.link[0],
      articleAuthor: entry["dc:creator"][0],
      articleSource: "Siliconera",
      articlePublishDate: entry.pubDate[0],
      articleTags: cleanedArticleTags,
      articlePreview: cleanedArticlePreview,
    };
    allFeedEntries.push(formattedEntry);
  });
  // debugger;
}

function movePolygonEntriesToAllFeedEntries(entries: any) {
  entries.forEach((entry: any) => {
    const articleTagsTemp: string[] = [];
    entry.category.map((categoryObj: any) =>{
      const entryTerm = categoryObj.$.term.replace(/&#039;/g, "'") + " ";
      articleTagsTemp.push(entryTerm);
      return articleTagsTemp
    })
    const cleanedArticlePreview = DOMPurify.sanitize(entry.content[0]._);
    const formattedEntry = {
      articleHeaderImg: "",
      articleHeadline: entry.title[0]._,
      articleLink: entry.link[0].$.href,
      articleAuthor: entry.author[0].name[0],
      articleSource: "Polygon",
      articlePublishDate: entry.published[0],
      articleTags: articleTagsTemp,
      articlePreview: cleanedArticlePreview,
    };
    allFeedEntries.push(formattedEntry);
  });
}

function moveRedditEntriesToAllFeedEntries(entries: any) {
  entries.forEach((entry: any) => { 
    const cleanedArticlePreview = DOMPurify.sanitize(entry.content[0]._)
    if (entry.title[0]?.includes("/u/C-OSSU on")) return;
    const formattedEntry = {
      articleHeaderImg: entry["media:thumbnail"][0].$.url || "",
      articleHeadline: entry.title[0],
      articleLink: entry.link[0].$.href,
      articleAuthor: "See post for details",
      articleSource: "C-OSSU (Reddit)",
      articlePublishDate: entry.published[0],
      articleTags: "",
      articlePreview: cleanedArticlePreview,
    };
    allFeedEntries.push(formattedEntry);
  });
}


export const fetchFeed = async (feeds: { [key: string]: string }) => {
  allFeedEntries.length = 0; // Clear previous entries

  const fetchPromises = Object.entries(feeds).map(async ([key, url]) => {
    try {
      const response = await fetch(`${PROXY_URL}${url}`);
      const data = await response.text();
      parseString(data, (err: any, res: any) => {
        if (err) {
          console.warn("Parsing error:", err);
          return;
        }
        if (key === "Siliconera") {
          const siliconeraEntries = res.rss.channel[0].item;
          moveSiliconeraEntriesToAllFeedEntries(siliconeraEntries);
        }
        if (key === "Polygon") {
          const polygonEntries = res.feed.entry;
          movePolygonEntriesToAllFeedEntries(polygonEntries);
        }

        if (key === "C-OSSU (Reddit)") moveRedditEntriesToAllFeedEntries(res.feed.entry);
        
        console.log(res);
        return res;
      });
    } catch (error) {
      console.warn("Fetch error:", error);
      return error;
    }
    // return 1;
  });

  await Promise.all(fetchPromises);
  return allFeedEntries;
};

export function sortFeedEntriesByNewestToOldest (allFeedEntries: Array<{[key: string]: any}>){
  allFeedEntries.sort((a, b) => {
    return new Date(b.articlePublishDate).getTime() - new Date(a.articlePublishDate).getTime();
  });
  return allFeedEntries;
}