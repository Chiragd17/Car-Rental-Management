import pool from '../src/config/db.js';

const getWikiImage = async (query) => {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(query)}&prop=pageimages&format=json&pithumbsize=800`;
  try {
    const r = await fetch(url);
    const d = await r.json();
    const pages = d.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pageId !== '-1') return pages[pageId].thumbnail?.source;
  } catch(e) {}
  return null;
};

const updateImages = async () => {
  console.log('Fetching exact images from Wikipedia...');
  const [vehicles] = await pool.query('SELECT vehicle_id, model FROM vehicle');
  let updatedCount = 0;

  for (const v of vehicles) {
    let query = v.model;
    
    // Clean up Indian-specific names to match global Wikipedia articles
    if (query.includes('Maruti')) query = query.replace('Maruti', 'Suzuki');
    if (query === 'Suzuki Alto K10') query = 'Suzuki Alto';
    if (query === 'Suzuki Dzire') query = 'Suzuki Dzire';
    if (query === 'Hyundai Grand i10 Nios') query = 'Hyundai i10';
    if (query === 'Toyota Urban Cruiser Hyryder') query = 'Toyota Urban Cruiser';
    if (query === 'Mahindra Scorpio N') query = 'Mahindra Scorpio';
    
    let img = await getWikiImage(query);
    
    // Try without spaces/variants if first attempt fails
    if (!img) {
      const simplified = query.split(' ').slice(0, 2).join(' ');
      img = await getWikiImage(simplified);
    }

    if (img) {
      await pool.query('UPDATE vehicle SET image_url = ? WHERE vehicle_id = ?', [img, v.vehicle_id]);
      console.log(`✅ Found image for: ${v.model}`);
      updatedCount++;
    } else {
      console.log(`❌ No image found for: ${v.model} (Searched: ${query})`);
    }
  }

  console.log(`\nFinished! Successfully updated ${updatedCount}/${vehicles.length} cars with exact images.`);
  process.exit(0);
};

updateImages();
