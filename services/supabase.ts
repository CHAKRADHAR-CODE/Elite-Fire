
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vuilizducprfuucrbzab.supabase.co';
const supabaseKey = 'sb_publishable_ETZICu1Frt_veRI60jIe0A_NV5eJnMQ';

export const supabase = createClient(supabaseUrl, supabaseKey);
