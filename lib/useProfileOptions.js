import { useEffect, useState } from 'react';
import supabase from '../lib/supabase';

const geonamesUsername = process.env.NEXT_PUBLIC_GEONAMES_USERNAME;

export default function useProfileOptions(selectedCountry) {
  const [genres, setGenres] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [educationOptions, setEducationOptions] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);

  // Fetch genres, instruments, education options on mount
  useEffect(() => {
    const fetchGenres = async () => {
      const { data } = await supabase.from('genres').select('name');
      setGenres(data || []);
    };
    const fetchInstruments = async () => {
      const { data } = await supabase
        .from('instruments')
        .select('name, category')
        .order('category', { ascending: true })
        .order('name', { ascending: true });
      setInstruments(data || []);
    };
    const fetchEducationOptions = async () => {
      const { data } = await supabase.from('education').select('id, name, HUN');
      setEducationOptions(data || []);
    };
    fetchGenres();
    fetchInstruments();
    fetchEducationOptions();
  }, []);

  // Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      const res = await fetch(`http://api.geonames.org/countryInfoJSON?username=${geonamesUsername}`);
      const data = await res.json();
      setCountries(data.geonames || []);
    };
    fetchCountries();
  }, []);

  // Fetch cities when selectedCountry changes
  useEffect(() => {
    if (!selectedCountry) {
      setCities([]);
      return;
    }
    const fetchCities = async () => {
      const res = await fetch(
        `http://api.geonames.org/searchJSON?formatted=true&country=${selectedCountry}&featureClass=P&maxRows=1000&username=${geonamesUsername}`
      );
      const data = await res.json();
      setCities(data.geonames || []);
    };
    fetchCities();
  }, [selectedCountry]);

  return {
    genres,
    instruments,
    educationOptions,
    countries,
    cities,
    setCities, // in case you want to clear cities manually
  };
}