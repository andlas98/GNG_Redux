import { useEffect, useState } from 'react';
import { fetchFeed, sortFeedEntriesByNewestToOldest } from './lib';
import { ModeSwitch } from './ui/switch';
import { PostCard } from './ui/postCard'; // Assuming PostCard is the component to render each entry
import feeds from './feeds';
import SiteHeader from './ui/siteHeader';

const App = () => {
  const [sortedFeedEntries, setSortedFeedEntries] = useState<{ [key: string]: any }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchFeed(feeds);
      const sortedData = sortFeedEntriesByNewestToOldest([...data]);
      setSortedFeedEntries(sortedData);
    };

    fetchData();
  }, [feeds]);

  return (
    <div className="App h-full dark:bg-black dark:text-white">
      <ModeSwitch />
      <div className="container m-auto mb-[3rem]">
        <SiteHeader />
        {/* Render PostCards here using sortedFeedEntries */}
        <div className='feed-entries-container mt-[2rem] mb-[3rem] dark:border-dark-mode-red border-[1px] border-[solid] shadow-md divide-y divide-white divide-dashed'>
          {sortedFeedEntries.map((entry, index) => (
            <PostCard 
              key={index} 
              className={entry.className}
              articleHeaderImg={entry.articleHeaderImg}
              articleHeadline={entry.articleHeadline}
              articleLink={entry.articleLink}
              articlePublishDate={entry.articlePublishDate}
              articleAuthor={entry.articleAuthor}
              articleSource={entry.articleSource}
              articleTags={entry.articleTags}
              entry={entry} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
