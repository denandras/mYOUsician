export default async function handler(req, res) {
    const { endpoint, ...query } = req.query;

    // Validate the endpoint parameter
    if (!endpoint || !['countryInfoJSON', 'searchJSON'].includes(endpoint)) {
        return res.status(400).json({ error: 'Invalid or missing endpoint parameter' });
    }

    // Construct the GeoNames API URL
    const geonamesUsername = process.env.NEXT_PUBLIC_GEONAMES_USERNAME;
    if (!geonamesUsername) {
        return res.status(500).json({ error: 'GeoNames username is not configured' });
    }

    const queryString = new URLSearchParams({ ...query, username: geonamesUsername }).toString();
    const url = `http://api.geonames.org/${endpoint}?${queryString}`;

    try {
        // Fetch data from GeoNames
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`GeoNames API error: ${response.statusText}`);
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching GeoNames data:', error);
        res.status(500).json({ error: 'Failed to fetch data from GeoNames' });
    }
}