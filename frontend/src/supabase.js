import { createClient } from '@supabase/supabase-js';

// URL de ton projet Supabase
const supabaseUrl = 'https://pvpztslxriczpooaicvc.supabase.co';

// Ta Clé Publique (Safe pour le frontend)
const supabaseKey = 'sb_publishable_EN5HvTEviUmhSea3nNcYXg_N9hgjFim';

// Création du client pour se connecter à la base de données
export const supabase = createClient(supabaseUrl, supabaseKey);
