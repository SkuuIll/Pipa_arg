const fs = require('fs');

async function main() {
  const url = 'https://www.youtube.com/@PIPAArg/videos';
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8'
    }
  });

  if (!response.ok) {
    throw new Error(`YouTube fetch HTTP ${response.status}`);
  }

  const html = await response.text();
  const match = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/) || html.match(/var ytInitialData = ({.*?});<\/script>/s);
  if (!match) {
    throw new Error('ytInitialData not found in HTML');
  }

  const data = JSON.parse(match[1]);
  const tabs = data.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
  const videosTab = tabs.find(t => t.tabRenderer?.selected === true) || tabs.find(t => /videos|vídeos/i.test(t.tabRenderer?.title));
  const contents = videosTab?.tabRenderer?.content?.richGridRenderer?.contents || [];

  const list = [];
  for (const item of contents) {
    const lockup = item.richItemRenderer?.content?.lockupViewModel;
    if (lockup) {
      const id = lockup.contentId || lockup.rendererContext?.commandContext?.onTap?.innertubeCommand?.watchEndpoint?.videoId;
      const title = lockup.metadata?.lockupMetadataViewModel?.title?.content;
      const duration = lockup.contentImage?.thumbnailViewModel?.overlays?.[0]?.thumbnailBottomOverlayViewModel?.badges?.[0]?.thumbnailBadgeViewModel?.text || '';
      const metaRows = lockup.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows || [];
      const parts = metaRows[0]?.metadataParts || [];
      const views = parts[0]?.accessibilityLabel || parts[0]?.text?.content || '';
      const published = parts[1]?.text?.content || parts[0]?.text?.content || 'Reciente';

      if (id && title) {
        list.push({
          id,
          title,
          link: `https://www.youtube.com/watch?v=${id}`,
          published,
          views,
          duration,
          thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          kind: 'upload'
        });
      }
      continue;
    }

    const legacy = item.richItemRenderer?.content?.videoRenderer;
    if (legacy && legacy.videoId) {
      const id = legacy.videoId;
      const title = legacy.title?.runs?.map((r) => r.text).join('') || legacy.title?.simpleText || '';
      const published = legacy.publishedTimeText?.simpleText || 'Reciente';
      const views = legacy.viewCountText?.simpleText || '';
      const duration = legacy.lengthText?.simpleText || '';

      list.push({
        id,
        title,
        link: `https://www.youtube.com/watch?v=${id}`,
        published,
        views,
        duration,
        thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        kind: 'upload'
      });
    }
  }

  if (list.length === 0) {
    throw new Error('No videos parsed from YouTube videos tab');
  }

  fs.writeFileSync('public/youtube-latest.json', JSON.stringify(list, null, 2), 'utf-8');
  console.log(`Saved ${list.length} videos to public/youtube-latest.json`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
