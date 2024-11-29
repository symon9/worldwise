import { fileURLToPath } from 'url';
import path from 'path';
import { promises as fs } from 'fs';

// Define __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function handler(req, res) {
  const filePath = path.join(__dirname, '../../data/cities.json');

  if (req.method === 'GET') {
    try {
      // Read cities from the JSON file
      const data = await fs.readFile(filePath, 'utf8');
      const cities = JSON.parse(data);

      // Check if fetching a single city by ID
      const { id } = req.query;
      if (id) {
        const city = cities.find((city) => city.id === parseInt(id, 10));
        if (!city) {
          return res.status(404).json({ message: 'City not found' });
        }
        return res.status(200).json(city);
      }

      // Return all cities
      res.status(200).json(cities);
    } catch (error) {
      res.status(500).json({ message: 'Error reading cities data', error });
    }
  } else if (req.method === 'POST') {
    try {
      // Parse the incoming data
      const { id, name } = req.body;
      if (!id || !name) {
        return res.status(400).json({ message: 'ID and name are required' });
      }

      // Read existing cities
      const data = await fs.readFile(filePath, 'utf8');
      const cities = JSON.parse(data);

      // Add the new city
      const newCity = { id, name };
      cities.push(newCity);

      // Save the updated cities back to the file (This won't persist on Vercel)
      await fs.writeFile(filePath, JSON.stringify(cities, null, 2));

      res.status(201).json(newCity);
    } catch (error) {
      res.status(500).json({ message: 'Error saving city data', error });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ message: 'ID is required' });
      }

      // Read existing cities
      const data = await fs.readFile(filePath, 'utf8');
      let cities = JSON.parse(data);

      // Remove the city with the given ID
      const cityIndex = cities.findIndex((city) => city.id === parseInt(id, 10));
      if (cityIndex === -1) {
        return res.status(404).json({ message: 'City not found' });
      }

      cities.splice(cityIndex, 1);

      // Save the updated cities back to the file (This won't persist on Vercel)
      await fs.writeFile(filePath, JSON.stringify(cities, null, 2));

      res.status(200).json({ message: `City with ID ${id} deleted successfully` });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting city data', error });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
