import { createClient } from '@supabase/supabase-js';

// Configuration de la connexion à ta base de données
const supabaseUrl = 'https://pvpztslxriczpooaicvc.supabase.co';
const supabaseKey = 'sb_publishable_EN5HvTEviUmhSca3nNcYXg_N9hgj...'; // Ta clé publique (raccourcie pour l'exemple, assure-toi d'avoir la complète si possible, sinon reprends celle de ta capture)

export const supabase = createClient(supabaseUrl, supabaseKey);
