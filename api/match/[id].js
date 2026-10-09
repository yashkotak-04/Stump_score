/**
 * StumpScore — Vercel Serverless Function: /api/match/[id]
 * Fetches full scorecard, fall of wickets, partnerships, and commentary for a specific match.
 *
 * Cache Strategy: Edge caching for 15s, SWR for 30s.
 */

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');
  res.setHeader('Content-Type', 'application/json');

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: 'Match ID is required' });
  }

  const apiKey = process.env.CRICKET_API_KEY;

  // Case 1: No API key or sample match ID requested
  if (!apiKey || apiKey.trim() === '' || id.startsWith('live_') || id.startsWith('upcoming_') || id.startsWith('completed_')) {
    return res.status(200).json({
      success: true,
      id,
      apiKeyConfigured: Boolean(apiKey),
      isRealTime: false,
      match: getSampleDetailedMatch(id),
      credit: 'StumpScore Detailed Match Center'
    });
  }

  // Case 2: Fetch full scorecard from provider
  try {
    const detailUrl = `https://api.cricapi.com/v1/match_scorecard?apikey=${encodeURIComponent(apiKey)}&id=${encodeURIComponent(id)}`;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    const apiResponse = await fetch(detailUrl, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeout);

    if (!apiResponse.ok) {
      throw new Error(`Scorecard API returned HTTP ${apiResponse.status}`);
    }

    const data = await apiResponse.json();

    if (data.status !== 'success' && !data.data) {
      throw new Error(data.message || 'Scorecard data not available');
    }

    return res.status(200).json({
      success: true,
      id,
      apiKeyConfigured: true,
      isRealTime: true,
      match: data.data || data,
      credit: 'Live Cricket Scorecard provided by licensed Cricket Data API'
    });

  } catch (err) {
    console.error('Scorecard API fetch error:', err.message);

    return res.status(200).json({
      success: false,
      id,
      error: `Could not fetch live scorecard (${err.message}). Showing cached overview.`,
      match: getSampleDetailedMatch(id)
    });
  }
};

function getSampleDetailedMatch(id) {
  return {
    id,
    series: "Border-Gavaskar Trophy 2026 - 4th Test",
    format: "Test",
    status: "live",
    statusText: "Day 2, Post-Tea Session (AUS lead by 124 runs)",
    venue: "Melbourne Cricket Ground (MCG)",
    toss: "Australia won the toss and elected to bat",
    teams: [
      { name: "Australia", short: "AUS" },
      { name: "India", short: "IND" }
    ],
    innings: [
      {
        number: 1,
        team: "AUS",
        runs: 324,
        wickets: 10,
        overs: "96.4",
        runRate: 3.35,
        batting: [
          { name: "U. Khawaja", runs: 68, balls: 142, fours: 7, sixes: 0, dismissal: "c Pant b Bumrah" },
          { name: "M. Labuschagne", runs: 44, balls: 98, fours: 5, sixes: 0, dismissal: "b Siraj" },
          { name: "S. Smith", runs: 104, balls: 195, fours: 11, sixes: 1, dismissal: "c Kohli b Jadeja" },
          { name: "T. Head", runs: 32, balls: 41, fours: 4, sixes: 1, dismissal: "c Gill b Bumrah" }
        ],
        bowling: [
          { name: "J. Bumrah", overs: "24.4", maidens: 6, runs: 68, wickets: 4, econ: 2.76 },
          { name: "M. Siraj", overs: "22.0", maidens: 4, runs: 74, wickets: 2, econ: 3.36 },
          { name: "R. Jadeja", overs: "28.0", maidens: 7, runs: 82, wickets: 3, econ: 2.93 }
        ]
      },
      {
        number: 2,
        team: "IND",
        runs: 284,
        wickets: 10,
        overs: "84.2",
        runRate: 3.37,
        batting: [
          { name: "R. Sharma", runs: 52, balls: 88, fours: 6, sixes: 1, dismissal: "c Carey b Starc" },
          { name: "Y. Jaiswal", runs: 38, balls: 54, fours: 5, sixes: 0, dismissal: "c Smith b Cummins" },
          { name: "V. Kohli", runs: 84, balls: 152, fours: 9, sixes: 0, dismissal: "c Carey b Hazlewood" },
          { name: "R. Pant", runs: 46, balls: 51, fours: 4, sixes: 2, dismissal: "c Lyon b Starc" }
        ],
        bowling: [
          { name: "M. Starc", overs: "20.2", maidens: 3, runs: 64, wickets: 3, econ: 3.15 },
          { name: "P. Cummins", overs: "22.0", maidens: 5, runs: 71, wickets: 3, econ: 3.23 },
          { name: "J. Hazlewood", overs: "21.0", maidens: 6, runs: 58, wickets: 2, econ: 2.76 },
          { name: "N. Lyon", overs: "21.0", maidens: 4, runs: 76, wickets: 2, econ: 3.62 }
        ]
      },
      {
        number: 3,
        team: "AUS",
        runs: 84,
        wickets: 4,
        overs: "27.0",
        runRate: 3.11,
        batting: [
          { name: "U. Khawaja", runs: 12, balls: 24, fours: 1, sixes: 0, dismissal: "lbw Bumrah" },
          { name: "M. Labuschagne", runs: 18, balls: 41, fours: 2, sixes: 0, dismissal: "c Pant b Siraj" },
          { name: "S. Smith", runs: 38, balls: 62, fours: 4, sixes: 0, notOut: true },
          { name: "A. Carey", runs: 14, balls: 24, fours: 2, sixes: 0, notOut: true }
        ],
        bowling: [
          { name: "J. Bumrah", overs: "10.0", maidens: 3, runs: 24, wickets: 3, econ: 2.40 },
          { name: "M. Siraj", overs: "9.0", maidens: 2, runs: 31, wickets: 1, econ: 3.44 },
          { name: "R. Jadeja", overs: "8.0", maidens: 2, runs: 22, wickets: 0, econ: 2.75 }
        ]
      }
    ],
    partnership: {
      batters: "S. Smith (20) & A. Carey (14)",
      runs: 34,
      balls: 48
    },
    fallOfWickets: [
      { no: 1, score: 17, batter: "Khawaja", over: "5.4" },
      { no: 2, score: 41, batter: "Labuschagne", over: "13.2" },
      { no: 3, score: 62, batter: "Head", over: "20.1" },
      { no: 4, score: 79, batter: "Marsh", over: "25.3" }
    ],
    commentary: [
      { over: "26.6", text: "Siraj to Smith, no run, defended solidly off the back foot towards cover point." },
      { over: "26.5", text: "Siraj to Smith, FOUR! Glorious punch through backward point! Pierces the infield." },
      { over: "26.4", text: "Siraj to Smith, no run, leaving outside off-stump with comfort." },
      { over: "26.3", text: "Siraj to Carey, 1 run, pushed into the gap at mid-on for an easy single." },
      { over: "26.2", text: "Siraj to Carey, no run, fuller on middle and leg, turned towards square leg." },
      { over: "26.1", text: "Siraj to Carey, no run, good length ball angling away outside off." }
    ]
  };
}
